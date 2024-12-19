import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './CrowdFunding';

let proofsEnabled = false;

describe('DecentralizedFundingPool', () => {
  let adminAccount: Mina.TestPublicKey,
    adminKey: PrivateKey,
    participant1: Mina.TestPublicKey,
    participant1Key: PrivateKey,
    participant2: Mina.TestPublicKey,
    participant2Key: PrivateKey,
    participant3: Mina.TestPublicKey,
    participant3Key: PrivateKey,
    contractAddress: PublicKey,
    contractKey: PrivateKey,
    fundingPool: CrowdFunding,
    TestNetwork: any;

  beforeAll(async () => {
    if (proofsEnabled) await CrowdFunding.compile();
  });

  beforeEach(async () => {
    TestNetwork = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(TestNetwork);

    [adminAccount, participant1, participant2, participant3] = TestNetwork.testAccounts;
    adminKey = adminAccount.key;
    participant1Key = participant1.key;
    participant2Key = participant2.key;
    participant3Key = participant3.key;

    contractKey = PrivateKey.random();
    contractAddress = contractKey.toPublicKey();
    fundingPool = new CrowdFunding(contractAddress);

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(adminAccount, async () => {
      AccountUpdate.fundNewAccount(adminAccount);
      await fundingPool.deploy({
        endTime: UInt32.from(100),
        minStake: UInt64.from(10),
        maxPool: UInt64.from(100),
      });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
  }

  it('deploy', async () => {
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(0));
    expect(fundingPool.getEndTime()).toEqual(UInt32.from(100));
    expect(fundingPool.getMinStake()).toEqual(UInt64.from(10));
    expect(fundingPool.getMaxPool()).toEqual(UInt64.from(100));
    expect(fundingPool.getProjectOwner()).toEqual(adminKey.toPublicKey());
  });

  it('contribute success', async () => {
    const amount = UInt64.from(100);
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(0));

    const txn = await Mina.transaction(participant1, async () => {
      await fundingPool.stake(amount);
    });
    await txn.prove();
    await txn.sign([participant1Key, contractKey]).send().wait();

    expect(fundingPool.account.balance.get()).toEqual(amount);
  });

  it('contribute success by more users', async () => {
    const baseAmount = 10;
    const amount = UInt64.from(baseAmount);
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(0));

    let txn = await Mina.transaction(participant1, async () => {
      await fundingPool.stake(amount);
    });
    await txn.prove();
    await txn.sign([participant1Key, contractKey]).send().wait();
    expect(fundingPool.account.balance.get()).toEqual(amount);

    txn = await Mina.transaction(participant2, async () => {
      await fundingPool.stake(amount);
    });
    await txn.prove();
    await txn.sign([participant2Key, contractKey]).send().wait();
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(baseAmount * 2));

    txn = await Mina.transaction(participant3, async () => {
      await fundingPool.stake(amount);
    });
    await txn.prove();
    await txn.sign([participant3Key, contractKey]).send().wait();
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(baseAmount * 3));
  });

  it('contribute failed by less amount', async () => {
    expect(async () => {
      await Mina.transaction(participant1, async () => {
        await fundingPool.stake(UInt64.from(1));
      })
    }).rejects;
  })

  it('withdraw success', async () => {
    expect(fundingPool.account.balance.get()).toEqual(UInt64.from(0));

    // clear balance
    let txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      const balance = Mina.getBalance(adminAccount);
      payer.send({ to: participant1, amount: balance });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(0));

    txn = await Mina.transaction(participant2, async () => {
      const payer = AccountUpdate.createSigned(participant2);
      const balance = Mina.getBalance(participant2);
      payer.send({ to: participant1, amount: balance });
    });
    await txn.prove();
    await txn.sign([participant2Key, contractKey]).send();
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(0));

    // contribute
    txn = await Mina.transaction(participant1, async () => {
      await fundingPool.stake(UInt64.from(100));
    });
    await txn.prove();
    await txn.sign([participant1Key, contractKey]).send();

    // withdraw
    txn = await Mina.transaction(adminAccount, async () => {
      await fundingPool.retrieve();
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(100));

    // 0 slot
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(20) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(80));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(20));

    // 200 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(70));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(30));

    // 400 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(60));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(40));

    // 600 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(50));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(50));

    // 800 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(40));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(60));

    // 1000 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(30));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(70));

    // 1200 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(20));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(80));

    // 1400 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(10));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(90));

    // 1600 slot
    TestNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(adminAccount, async () => {
      const payer = AccountUpdate.createSigned(adminAccount);
      payer.send({ to: participant2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([adminKey, contractKey]).send();
    expect(Mina.getBalance(adminAccount)).toEqual(UInt64.from(0));
    expect(Mina.getBalance(participant2)).toEqual(UInt64.from(100));
  })
});
