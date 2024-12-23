import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './CrowdFunding';

let proofsEnabled = false;

describe('CrowdFunding', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    user1: Mina.TestPublicKey,
    user1Key: PrivateKey,
    user2: Mina.TestPublicKey,
    user2Key: PrivateKey,
    user3: Mina.TestPublicKey,
    user3Key: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: CrowdFunding,
    Local: any;

  beforeAll(async () => {
    if (proofsEnabled) await CrowdFunding.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployerAccount, user1, user2, user3] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    user1Key = user1.key;
    user2Key = user2.key;
    user3Key = user3.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new CrowdFunding(zkAppAddress);

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy({
        deadline: UInt32.from(100),
        minimumInvestment: UInt64.from(10),
        hardCap: UInt64.from(100),
      });
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('deploy', async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    expect(zkApp.getDeadline()).toEqual(UInt32.from(100));
    expect(zkApp.getMinimumInvestment()).toEqual(UInt64.from(10));
    expect(zkApp.getHardCap()).toEqual(UInt64.from(100));
    expect(zkApp.getInvestor()).toEqual(deployerKey.toPublicKey());
  });

  it('contribute success', async () => {
    const amount = UInt64.from(100);
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));

    const txn = await Mina.transaction(user1, async () => {
      await zkApp.contribute(amount);
    });
    await txn.prove();
    await txn.sign([user1Key, zkAppPrivateKey]).send().wait();

    expect(zkApp.account.balance.get()).toEqual(amount);
  });

  it('contribute success by more users', async () => {
    const baseAmount = 10;
    const amount = UInt64.from(baseAmount);
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));

    let txn = await Mina.transaction(user1, async () => {
      await zkApp.contribute(amount);
    });
    await txn.prove();
    await txn.sign([user1Key, zkAppPrivateKey]).send().wait();
    expect(zkApp.account.balance.get()).toEqual(amount);

    txn = await Mina.transaction(user2, async () => {
      await zkApp.contribute(amount);
    });
    await txn.prove();
    await txn.sign([user2Key, zkAppPrivateKey]).send().wait();
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(baseAmount * 2));

    txn = await Mina.transaction(user3, async () => {
      await zkApp.contribute(amount);
    });
    await txn.prove();
    await txn.sign([user3Key, zkAppPrivateKey]).send().wait();
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(baseAmount * 3));
  });

  it('contribute failed by less amount', async () => {
    expect(async () => {
      await Mina.transaction(user1, async () => {
        await zkApp.contribute(UInt64.from(1));
      })
    }).rejects;
  })

  it('withdraw success', async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));

    // clear balance
    let txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      const balance = Mina.getBalance(deployerAccount);
      payer.send({ to: user1, amount: balance });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(0));

    txn = await Mina.transaction(user2, async () => {
      const payer = AccountUpdate.createSigned(user2);
      const balance = Mina.getBalance(user2);
      payer.send({ to: user1, amount: balance });
    });
    await txn.prove();
    await txn.sign([user2Key, zkAppPrivateKey]).send();
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(0));

    // contribute
    txn = await Mina.transaction(user1, async () => {
      await zkApp.contribute(UInt64.from(100));
    });
    await txn.prove();
    await txn.sign([user1Key, zkAppPrivateKey]).send();

    // withdraw
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(100));

    // 0 slot
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(20) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(80));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(20));

    // 200 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(70));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(30));

    // 400 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(60));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(40));

    // 600 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(50));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(50));

    // 800 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(40));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(60));

    // 1000 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(30));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(70));

    // 1200 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(20));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(80));

    // 1400 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(10));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(90));

    // 1600 slot
    Local.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      payer.send({ to: user2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(0));
    expect(Mina.getBalance(user2)).toEqual(UInt64.from(100));
  })
});
