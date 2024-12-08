import {
  CrowdfundingContract
} from './crowFunding';
import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
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
  async function localDeploy(fundraisingGoal = 100, endTime = 2733562450713) {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy({
        creator,
        fundraisingGoal: UInt64.from(fundraisingGoal * 1e9),
        endTime: UInt64.from(endTime),
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

  // 修改结束时间
  async function setEndTime(endTime: UInt64) {
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.setEndTime(endTime);
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
  }

  it('投资测试', async () => {
    await localDeploy();
    const amount = UInt64.from(10 * 1e9);
    await fund(amount);
    expect(zkApp.totalFunded.get()).toEqual(amount);

    const update = AccountUpdate.create(zkAppAccount.toPublicKey());
    expect(update.account.balance.get()).toEqual(amount);
  })

  it('提款测试', async () => {
    await localDeploy();
    const amount = UInt64.from(100 * 1e9);
    await fund(amount);

    //时间窗口未关闭无法提款
    expect(async () => {
      const txn = await Mina.transaction(creator, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([creator.key]).send();
    }).rejects;


    //修改结束时间
    await setEndTime(UInt64.from(10));

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

});