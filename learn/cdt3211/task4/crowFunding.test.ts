import {
  CrowdfundingContract
} from './crowFunding';
import {
  AccountUpdate,
  Mina,
  PrivateKey,
  UInt32,
  UInt64
} from 'o1js';

describe('CrowdfundingContract', () => {
  let deployer: Mina.TestPublicKey;
  let investor: Mina.TestPublicKey;
  let creator: Mina.TestPublicKey;
  let zkApp: CrowdfundingContract;
  let zkAppAccount: PrivateKey;

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
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

  // 投资
  async function fund(amount: UInt64) {
    const txn = await Mina.transaction(investor, async () => {
      await zkApp.fund(amount);
    });
    await txn.prove();
    await txn.sign([investor.key]).send();
    return txn;
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

    // 非项目发起人无法提款
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([investor.key]).send();
    }).rejects;

    //提款
    const beforeBalance = AccountUpdate.create(creator).account.balance.get();
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
    expect(AccountUpdate.create(creator).account.balance.get()).toEqual(beforeBalance.add(amount));
  })

  it('资金逐步释放', async () => {
    await localDeploy();
    const amount = UInt64.from(100);
    await fund(amount);

    //提款
    const beforeBalance = AccountUpdate.create(creator).account.balance.get();
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
    expect(AccountUpdate.create(creator).account.balance.get()).toEqual(beforeBalance.add(amount));

    //再次提款
    expect(async () => {
      const txn = await Mina.transaction(creator, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([creator.key]).send();
    }).rejects;
  })

});