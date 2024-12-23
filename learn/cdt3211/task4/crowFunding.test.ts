import {
  CrowdfundingContract
} from './crowFunding';
import {
  AccountUpdate,
  Mina,
  PrivateKey,
  PublicKey,
  UInt32,
  UInt64
} from 'o1js';

describe('CrowdfundingContract', () => {
  let deployer: Mina.TestPublicKey;
  let investor: Mina.TestPublicKey;
  let creator: Mina.TestPublicKey;
  let zkApp: CrowdfundingContract;
  let zkAppAccount: PrivateKey;
  let Local: any;

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployer, investor, creator] = Local.testAccounts;
    zkAppAccount = PrivateKey.random();
    zkApp = new CrowdfundingContract(zkAppAccount.toPublicKey());
  });

  // 部署合约
  async function localDeploy(fundraisingGoal = 100, endTime = 10) {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy({
        creator,
        fundraisingGoal: UInt64.from(fundraisingGoal),
        endTime: UInt32.from(endTime),
      });
    });
    await txn.prove();
    await txn.sign([deployer.key, zkAppAccount]).send();
  }

  // 账户资金释放(用向其他账户转账的形式代替)
  async function release(amount: UInt64) {
    const txn = await Mina.transaction(creator, async () => {
      const accountUpdate = AccountUpdate.createSigned(creator);
      accountUpdate.send({ to: investor, amount: amount });
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
  }

  // 投资
  async function fund(amount: UInt64) {
    const txn = await Mina.transaction(investor, async () => {
      await zkApp.fund(amount);
    });
    await txn.prove();
    await txn.sign([investor.key]).send();
  }


  it('投资测试', async () => {
    await localDeploy();
    const amount = UInt64.from(10);
    await fund(amount);
    expect(zkApp.totalFunded.get()).toEqual(amount);

    const update = AccountUpdate.create(zkAppAccount.toPublicKey());
    expect(update.account.balance.get()).toEqual(amount);
  })

  it('提款测试', async () => {
    await localDeploy();
    const amount = UInt64.from(100);
    await fund(amount);

    Local.setBlockchainLength(UInt32.from(10));
    Mina.setActiveInstance(Local);

    // 非项目发起人无法提款
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([investor.key]).send();
    }).rejects;

    const beforeBalance = Mina.getBalance(creator);
    //提款
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([creator.key]).send();

    expect(Mina.getBalance(creator)).toEqual(beforeBalance.add(amount));
  })

  it('资金逐步释放', async () => {
    await localDeploy();
    const amount = UInt64.from(100);
    await fund(amount);

    // 清空余额
    const balance = Mina.getBalance(creator);
    await release(balance);
    expect(Mina.getBalance(creator)).toEqual(UInt64.from(0));

    Local.setBlockchainLength(UInt32.from(100));
    Mina.setActiveInstance(Local);

    //提款
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
    expect(Mina.getBalance(creator)).toEqual(UInt64.from(100));

    //首次只能提取20%
    await release(UInt64.from(Number(amount) * 0.2));

    expect(Mina.getBalance(creator)).toEqual(UInt64.from(80));

    // 再次提取会失败
    expect(async () => {
      await release(UInt64.from(1));
    }).rejects;

    // 200个区块后
    Local.incrementGlobalSlot(200);
    // 释放10%
    await release(UInt64.from(Number(amount) * 0.1));
    expect(Mina.getBalance(creator)).toEqual(UInt64.from(70));

    Local.incrementGlobalSlot(1400)
    // 释放剩余全部
    await release(UInt64.from(Number(amount) * 0.7));
    expect(Mina.getBalance(creator)).toEqual(UInt64.from(0));


  })

});