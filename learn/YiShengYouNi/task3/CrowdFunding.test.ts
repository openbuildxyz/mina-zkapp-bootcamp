import 'jest';
import { Crowdfunding } from './Crowdfunding';
import { UInt64, PublicKey, PrivateKey, Mina, fetchAccount, AccountUpdate } from 'o1js';

describe('Crowdfunding zkApp', () => {
  let zkApp: Crowdfunding;
  let mockGetTimestamp: jest.Mock;
  let Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>;
  let deployerPrivateKey: PrivateKey;
  let deployerPublicKey: PublicKey;
  let zkAppPrivateKey: PrivateKey;
  let zkAppPublic: PublicKey;

  beforeAll(async () => {
    Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    deployerPrivateKey = Local.testAccounts[0].key;
    deployerPublicKey = deployerPrivateKey.toPublicKey();
    zkAppPrivateKey = PrivateKey.random();
    zkAppPublic = zkAppPrivateKey.toPublicKey();


    // zkAppPublic 创建并资助新账户
    await Mina.transaction({
      sender: deployerPublicKey, // 使用已存在且有余额的账户,
      fee: 2 * 10 ** 9, // 2 MINA：1 MINA 用于账户创建费 + 1 MINA 用于交易费
      memo: 'fund zkApp',
    }, async () => {
      // AccountUpdate.fundNewAccount(zkAppPublic, 2 * 10 ** 9); // // 创建并资助 zkAppPublic 账户
      const sender = AccountUpdate.create(deployerPublicKey);
      sender.send({
        to: zkAppPublic,
        amount: 10 * 10 ** 9, // 10 MINA
      });
    }).prove()
      .sign([deployerPrivateKey]) // 签名
      .send()
      .wait();

    // 检查 zkAppPublic 账户余额
    const zkAppAccount = await fetchAccount({ publicKey: zkAppPublic });
    if (!zkAppAccount) {
      throw new Error(`Account for zkAppPublic (${zkAppPublic.toBase58()}) does not exist.`);
    } else {
      console.log(`zkAppPublic balance after funding: ${zkAppAccount?.account?.balance.toString()}`);
    }


    zkApp = new Crowdfunding(zkAppPublic);

    // 生成验证密钥
    const { verificationKey } = await Crowdfunding.compile();

    // 部署 zkApp
    await Mina.transaction({
      sender: deployerPublicKey,
      fee: 2 * 10 ** 9,
      memo: '部署合约',
    }, async () => {
      zkApp.deploy({ verificationKey });
    }).prove()
      .sign([deployerPrivateKey])
      .send()
      .wait();

    // 检查 deployerPublicKey 和 zkAppPublic 的余额
    const deployerAccount = await fetchAccount({ publicKey: deployerPublicKey });
    console.log(`DeployerPublic balance after deployment: ${deployerAccount.account?.balance}`);


    // 检查 zkAppPublic 账户余额
    const zkAppAccountAfterDeploy = await fetchAccount({ publicKey: zkAppPublic });
    if (!zkAppAccountAfterDeploy) {
      throw new Error(`Account for zkAppPublic (${zkAppPublic.toBase58()}) does not exist.`);
    } else {
      console.log(`zkAppPublic balance after funding: ${zkAppAccountAfterDeploy?.account?.balance}`);
    }

    // 同步账户信息：确保账户数据已经被加载
    await fetchAccount({ publicKey: zkAppPublic }); // zkApp 账户信息
    await fetchAccount({ publicKey: deployerPublicKey }); // 部署者账户信息

  });

  beforeEach(async () => {

    // 重置 zkApp 状态
    await Mina.transaction(deployerPublicKey, async () => {
      zkApp.startTime.set(UInt64.from(0));
      zkApp.endTime.set(UInt64.from(100));
      zkApp.totalFunds.set(UInt64.from(0));
    })
      .prove()
      .sign([deployerPrivateKey, zkAppPrivateKey])
      .send()
      .wait();

    await fetchAccount({ publicKey: deployerPublicKey });

    // 创建动态 Mock
    mockGetTimestamp = jest.fn();

    // 替换 zkApp.network.timestamp.get 的实现为 Mock
    Object.defineProperty(zkApp.network.timestamp, 'get', {
      value: mockGetTimestamp,
    });
  });



  it('should initialize startTime correctly', async () => {
    const startTime = zkApp.startTime.get();
    expect(startTime.toString()).toBe('0');
  });

  // 验证众筹参数设置
  it('should configure crowdfunding parameters correctly', async () => {
    const startTime = UInt64.zero;
    const endTime = UInt64.from(100);
    const hardCap = UInt64.from(1000);

    await zkApp.configureCrowdfunding(
      UInt64.from(startTime),
      UInt64.from(endTime),
      hardCap,
      zkAppPublic
    );

    expect(zkApp.startTime.get().toString()).toBe('0');
    expect(zkApp.endTime.get().toString()).toBe('100');
    expect(zkApp.hardCap.get().toString()).toBe('1000');
    expect(zkApp.beneficiary.get().toBase58()).toBe(zkAppPublic.toBase58());
  });
  // // 验证投资时间
  // it('should allow contributions within the time window', async () => {
  //   const startTime = UInt64.zero;
  //   const endTime = UInt64.from(100);
  //   const hardCap = UInt64.from(1000);
  //   const beneficiary = PublicKey.fromBase58(testPublicKey);

  //   await zkApp.configureCrowdfunding(
  //     UInt64.from(startTime),
  //     UInt64.from(endTime),
  //     hardCap,
  //     beneficiary
  //   );

  //   const contributor = PublicKey.fromBase58(testPublicKey);
  //   const amount = UInt64.from(100);

  //   // 模拟当前时间在时间窗口内
  //   mockGetTimestamp.mockReturnValue(UInt64.from(50)); // Mock 当前时间为 50
  //   Local.setTimestamp(UInt64.from(50));

  //   await zkApp.contribute(contributor, amount);

  //   expect(zkApp.totalFunds.get().toString()).toBe('100');
  // });
  // // 验证时间窗口外的投资失败
  // it('should not allow contributions outside the time window', async () => {
  //   const startTime = UInt64.zero;
  //   const endTime = UInt64.from(100);
  //   const hardCap = UInt64.from(1000);
  //   const beneficiary = PublicKey.fromBase58(testPublicKey);

  //   await zkApp.configureCrowdfunding(
  //     UInt64.from(startTime),
  //     UInt64.from(endTime),
  //     hardCap,
  //     beneficiary
  //   );

  //   const contributor = PublicKey.fromBase58(testPublicKey);
  //   const amount = UInt64.from(100);

  //   // 模拟当前时间在众筹时间窗口外
  //   mockGetTimestamp.mockReturnValue(UInt64.from(200));

  //   await expect(() => zkApp.contribute(contributor, amount)).rejects.toThrow();
  // });
  // // 验证提款
  // it('should allow withdrawal after the time window ends', async () => {
  //   const startTime = UInt64.zero;
  //   const endTime = UInt64.from(100);
  //   const hardCap = UInt64.from(1000);
  //   const beneficiary = PublicKey.fromBase58(testPublicKey);

  //   await zkApp.configureCrowdfunding(
  //     UInt64.from(startTime),
  //     UInt64.from(endTime),
  //     hardCap,
  //     beneficiary
  //   );

  //   // 模拟众筹成功
  //   const amount = UInt64.from(500);
  //   zkApp.totalFunds.set(amount);

  //   // 模拟时间窗口结束
  //   mockGetTimestamp.mockReturnValue(UInt64.from(200));

  //   await zkApp.withdraw(beneficiary, amount);

  //   expect(zkApp.totalFunds.get().toString()).toBe('0');
  // });
});
