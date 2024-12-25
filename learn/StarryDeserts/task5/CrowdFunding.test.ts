import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { FundingPool } from './CrowdFunding';

let proofsEnabled = false;

describe('FundingPool', () => {
  let ownerAccount: Mina.TestPublicKey,
    ownerKey: PrivateKey,
    donor1: Mina.TestPublicKey,
    donor1Key: PrivateKey,
    donor2: Mina.TestPublicKey,
    donor2Key: PrivateKey,
    donor3: Mina.TestPublicKey,
    donor3Key: PrivateKey,
    poolAddress: PublicKey,
    poolKey: PrivateKey,
    fundingContract: FundingPool,
    LocalNetwork: any;

  beforeAll(async () => {
    if (proofsEnabled) await FundingPool.compile();
  });

  beforeEach(async () => {
    LocalNetwork = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(LocalNetwork);

    [ownerAccount, donor1, donor2, donor3] = LocalNetwork.testAccounts;
    ownerKey = ownerAccount.key;
    donor1Key = donor1.key;
    donor2Key = donor2.key;
    donor3Key = donor3.key;

    poolKey = PrivateKey.random();
    poolAddress = poolKey.toPublicKey();
    fundingContract = new FundingPool(poolAddress);

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(ownerAccount, async () => {
      AccountUpdate.fundNewAccount(ownerAccount);
      await fundingContract.deploy({
        endTime: UInt32.from(100),
        minStake: UInt64.from(10),
        maxPool: UInt64.from(100),
      });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
  }

  it('deploy', async () => {
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(0));
    expect(fundingContract.getEndTime()).toEqual(UInt32.from(100));
    expect(fundingContract.getMinStake()).toEqual(UInt64.from(10));
    expect(fundingContract.getMaxPool()).toEqual(UInt64.from(100));
    expect(fundingContract.getProjectOwner()).toEqual(ownerKey.toPublicKey());
  });

  it('contribute success', async () => {
    const amount = UInt64.from(100);
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(0));

    const txn = await Mina.transaction(donor1, async () => {
      await fundingContract.contribute(amount);
    });
    await txn.prove();
    await txn.sign([donor1Key, poolKey]).send().wait();

    expect(fundingContract.account.balance.get()).toEqual(amount);
  });

  it('contribute success by more users', async () => {
    const baseAmount = 10;
    const amount = UInt64.from(baseAmount);
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(0));

    let txn = await Mina.transaction(donor1, async () => {
      await fundingContract.contribute(amount);
    });
    await txn.prove();
    await txn.sign([donor1Key, poolKey]).send().wait();
    expect(fundingContract.account.balance.get()).toEqual(amount);

    txn = await Mina.transaction(donor2, async () => {
      await fundingContract.contribute(amount);
    });
    await txn.prove();
    await txn.sign([donor2Key, poolKey]).send().wait();
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(baseAmount * 2));

    txn = await Mina.transaction(donor3, async () => {
      await fundingContract.contribute(amount);
    });
    await txn.prove();
    await txn.sign([donor3Key, poolKey]).send().wait();
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(baseAmount * 3));
  });

  it('contribute failed by less amount', async () => {
    expect(async () => {
      await Mina.transaction(donor1, async () => {
        await fundingContract.contribute(UInt64.from(1));
      })
    }).rejects;
  })

  it('withdraw success', async () => {
    expect(fundingContract.account.balance.get()).toEqual(UInt64.from(0));

    // clear balance
    let txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      const balance = Mina.getBalance(ownerAccount);
      payer.send({ to: donor1, amount: balance });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(0));

    txn = await Mina.transaction(donor2, async () => {
      const payer = AccountUpdate.createSigned(donor2);
      const balance = Mina.getBalance(donor2);
      payer.send({ to: donor1, amount: balance });
    });
    await txn.prove();
    await txn.sign([donor2Key, poolKey]).send();
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(0));

    // contribute
    txn = await Mina.transaction(donor1, async () => {
      await fundingContract.contribute(UInt64.from(100));
    });
    await txn.prove();
    await txn.sign([donor1Key, poolKey]).send();

    // withdraw
    txn = await Mina.transaction(ownerAccount, async () => {
      await fundingContract.withdraw();
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(100));

    // 0 slot
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(20) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(80));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(20));

    // 200 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(70));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(30));

    // 400 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(60));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(40));

    // 600 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(50));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(50));

    // 800 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(40));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(60));

    // 1000 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(30));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(70));

    // 1200 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(20));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(80));

    // 1400 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(10));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(90));

    // 1600 slot
    LocalNetwork.incrementGlobalSlot(UInt32.from(200));
    txn = await Mina.transaction(ownerAccount, async () => {
      const payer = AccountUpdate.createSigned(ownerAccount);
      payer.send({ to: donor2, amount: UInt64.from(10) });
    });
    await txn.prove();
    await txn.sign([ownerKey, poolKey]).send();
    expect(Mina.getBalance(ownerAccount)).toEqual(UInt64.from(0));
    expect(Mina.getBalance(donor2)).toEqual(UInt64.from(100));
  })
});
