import { CrowdfundingContract } from './crowdfunding-local.js';
import {
  AccountUpdate,
  Mina,
  PrivateKey,
  UInt64,
} from 'o1js';

describe('CrowdfundingContract', () => {
  let deployer: Mina.TestPublicKey;
  let investor: Mina.TestPublicKey;
  let creator: Mina.TestPublicKey;
  let zkApp: CrowdfundingContract;
  let zkAppAccount: PrivateKey;

  beforeEach(async () => {
    const local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(local);

    [deployer, investor, creator] = local.testAccounts;
    zkAppAccount = PrivateKey.random();
    zkApp = new CrowdfundingContract(zkAppAccount.toPublicKey());
  });

  // Deploy contract
  async function deploy(fundraisingGoal = 100, endTime = 2733562450713) {
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

  // Invest
  async function fund(amount: UInt64) {
    const txn = await Mina.transaction(investor, async () => {
      await zkApp.fund(amount);
    });
    await txn.prove();
    await txn.sign([investor.key]).send();
    return txn;
  }

  // Modify end time
  async function setEndTime(endTime: UInt64) {
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.setEndTime(endTime);
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
  }

  it('invest case', async () => {
    await deploy();
    const amount = UInt64.from(10 * 1e9);
    await fund(amount);
    expect(zkApp.totalFunded.get()).toEqual(amount);

    const update = AccountUpdate.create(zkAppAccount.toPublicKey());
    expect(update.account.balance.get()).toEqual(amount);
  });

  it('withdraw case', async () => {
    await deploy();
    const amount = UInt64.from(100 * 1e9);
    await fund(amount);

    // The time window has not been closed and the withdrawal cannot be made
    expect(async () => {
      const txn = await Mina.transaction(creator, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([creator.key]).send();
    }).rejects;

    // Modify end time
    await setEndTime(UInt64.from(10));

    // Non-project creator cannot withdraw funds
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([investor.key]).send();
    }).rejects;

    // Withdraw
    const beforeBalance = AccountUpdate.create(creator).account.balance.get();
    const txn = await Mina.transaction(creator, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([creator.key]).send();
    expect(AccountUpdate.create(creator).account.balance.get()).toEqual(
      beforeBalance.add(amount)
    );
  });
});
