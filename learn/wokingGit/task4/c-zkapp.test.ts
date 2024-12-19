import { isReady, shutdown, Mina, PrivateKey, PublicKey, UInt64, UInt32 } from 'o1js';
import { CrowdFundingZkapp } from './CrowdFundingZkapp';

describe('CrowdFundingZkapp', () => {
  let zkAppPrivateKey: PrivateKey;
  let zkAppAddress: PublicKey;
  let zkApp: CrowdFundingZkapp;
  let deployerKey: PrivateKey;
  let deployerAccount: PublicKey;
  let investorKey: PrivateKey;
  let investorAccount: PublicKey;

  beforeAll(async () => {
    await isReady;

    // 设置本地测试区块链
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    deployerKey = Local.testAccounts[0].privateKey;
    deployerAccount = Local.testAccounts[0].publicKey;
    investorKey = Local.testAccounts[1].privateKey;
    investorAccount = Local.testAccounts[1].publicKey;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    // 初始化合约实例
    zkApp = new CrowdFundingZkapp(zkAppAddress);
  });

  afterAll(() => {
    setTimeout(shutdown, 0);
  });

  it('should deploy the contract correctly', async () => {
    const hardCap = UInt64.from(1000);
    const endTime = UInt32.from(10);

    const tx = await Mina.transaction(deployerAccount, () => {
      zkApp.deploy({
        zkappKey: zkAppPrivateKey,
        investor: investorAccount,
        hardCap,
        endTime,
      });
    });
    await tx.prove();
    await tx.sign([deployerKey]).send();

    // 验证合约状态
    expect(zkApp.investor.get()).toEqual(investorAccount);
    expect(zkApp.hardCap.get()).toEqual(hardCap);
    expect(zkApp.endTime.get()).toEqual(endTime);
  });

  it('should allow investment within the limits', async () => {
    const amount = UInt64.from(500);

    const tx = await Mina.transaction(investorAccount, () => {
      zkApp.invest(amount);
    });
    await tx.prove();
    await tx.sign([investorKey]).send();

    // 验证余额
    expect(zkApp.account.balance.get().toBigInt()).toEqual(BigInt(500));
  });

  it('should prevent investment beyond the hard cap', async () => {
    const amount = UInt64.from(600); // 超出硬顶

    const tx = Mina.transaction(investorAccount, () => {
      zkApp.invest(amount);
    });

    // 应抛出异常
    await expect(async () => {
      await tx.prove();
      await tx.sign([investorKey]).send();
    }).rejects.toThrow('投资金额已到顶');
  });

  it('should allow withdrawal after endTime', async () => {
    // 增加区块链长度到 endTime 之后
    Mina.getNetworkState().blockchainLength = zkApp.endTime.get().add(UInt32.from(1));

    const tx = await Mina.transaction(investorAccount, () => {
      zkApp.withdraw();
    });
    await tx.prove();
    await tx.sign([investorKey]).send();

    // 验证提现后合约账户余额为 0
    expect(zkApp.account.balance.get().toBigInt()).toEqual(BigInt(0));
  });

  it('should prevent withdrawal before endTime', async () => {
    Mina.getNetworkState().blockchainLength = zkApp.endTime.get().sub(UInt32.from(1));

    const tx = Mina.transaction(investorAccount, () => {
      zkApp.withdraw();
    });

    // 应抛出异常
    await expect(async () => {
      await tx.prove();
      await tx.sign([investorKey]).send();
    }).rejects.toThrow('众筹未结束');
  });
});
