import {
  UInt32,
  UInt64,
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
} from 'o1js';
import { Crowdfunding } from './crowdfunding';

let proofEnabled = false;

describe('Crowdfunding', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    investor1: Mina.TestPublicKey,
    investor1Key: PrivateKey,
    investor2: Mina.TestPublicKey,
    investor2Key: PrivateKey,
    investor3: Mina.TestPublicKey,
    investor3Key: PrivateKey,
    zkappAddress: PublicKey,
    zkappPrivateKey: PrivateKey,
    zkAppInstance: Crowdfunding,
    Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>;

  beforeAll(async () => {
    if (proofEnabled) await Crowdfunding.compile();
  });

  beforeEach(async () => {
    // setup local blockchain
    Local = await Mina.LocalBlockchain({ proofsEnabled: proofEnabled });
    Mina.setActiveInstance(Local);

    // test accounts
    [deployerAccount, investor1, investor2, investor3] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    investor1Key = investor1.key;
    investor2Key = investor2.key;
    investor3Key = investor3.key;

    // zkapp account
    zkappPrivateKey = PrivateKey.random();
    zkappAddress = zkappPrivateKey.toPublicKey();
    zkAppInstance = new Crowdfunding(zkappAddress);

    // deploy zkapp
    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkAppInstance.deploy({
        owner: deployerAccount,
        hardCap: UInt64.from(100),
        endTime: UInt32.from(20),
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkappPrivateKey]).send();
  }

  it('Contract Deployment', () => {
    const hardCap = UInt64.from(100);
    const endTime = UInt32.from(20);

    const onChainHardCap = zkAppInstance.hardCap.get();
    const onChainEndTime = zkAppInstance.endTime.get();

    expect(onChainHardCap).toEqual(hardCap);
    expect(onChainEndTime).toEqual(endTime);
  });

  it('Funding Mechanism: should allow funding within hard carp', async () => {
    const fundingAmount = UInt64.from(50);

    const txn1 = await Mina.transaction(investor1, async () => {
      await zkAppInstance.fund(fundingAmount);
    });
    await txn1.prove();
    await txn1.sign([investor1Key, zkappPrivateKey]).send().wait();

    let balance = zkAppInstance.account.balance.get();
    expect(balance).toEqual(fundingAmount);

    const txn2 = await Mina.transaction(investor2, async () => {
      await zkAppInstance.fund(fundingAmount);
    });
    await txn2.prove();
    await txn2.sign([investor2Key, zkappPrivateKey]).send().wait();

    balance = zkAppInstance.account.balance.get();
    expect(balance).toEqual(fundingAmount.mul(2));
  });

  it('Funding Mechanism: should prevent funding after end time', async () => {
    // set blockchain time past end time
    Local.setBlockchainLength(UInt32.from(21));
    Mina.setActiveInstance(Local);

    await expect(async () => {
      const txn = await Mina.transaction(investor3, async () => {
        await zkAppInstance.fund(UInt64.from(50));
      });
      await txn.prove();
      await txn.sign([investor3Key, zkappPrivateKey]).send().wait();
    }).rejects.toThrow('Funding period has ended');
  });

  it('Withdrawal Mechanism: time locked', async () => {
    // prepare
    const fundingAmount = UInt64.from(100);
    let txn = await Mina.transaction(investor1, async () => {
      await zkAppInstance.fund(fundingAmount);
    });
    await txn.prove();
    await txn.sign([investor1Key, zkappPrivateKey]).send().wait();

    txn = await Mina.transaction(investor1, async () => {
      const sender = AccountUpdate.createSigned(investor1);
      const balance = Mina.getBalance(investor1);
      sender.send({ to: investor2, amount: balance });
    });
    await txn.prove();
    await txn.sign([investor1Key, zkappPrivateKey]).send().wait();
    expect(Mina.getBalance(investor1)).toEqual(UInt64.from(0));

    Local.setBlockchainLength(UInt32.from(20));
    Mina.setActiveInstance(Local);

    let withdrawTxn = await Mina.transaction(deployerAccount, async () => {
      await zkAppInstance.withdraw(deployerAccount);
    });

    await withdrawTxn.prove();
    await withdrawTxn.sign([deployerKey, zkappPrivateKey]).send().wait();

    // 0 slot
    withdrawTxn = await Mina.transaction(deployerAccount, async () => {
      const sender = AccountUpdate.createSigned(deployerAccount);
      sender.send({ to: investor1, amount: UInt64.from(20) });
    });
    await withdrawTxn.prove();
    await withdrawTxn.sign([deployerKey, zkappPrivateKey]).send().wait();
    expect(Mina.getBalance(investor1)).toEqual(UInt64.from(20));

    // 200 slots
    Local.incrementGlobalSlot(200);
    withdrawTxn = await Mina.transaction(deployerAccount, async () => {
      const sender = AccountUpdate.createSigned(deployerAccount);
      sender.send({ to: investor1, amount: UInt64.from(10) });
    });
    await withdrawTxn.prove();
    await withdrawTxn.sign([deployerKey, zkappPrivateKey]).send().wait();
    expect(Mina.getBalance(investor1)).toEqual(UInt64.from(30));

    // 400 slots
    Local.incrementGlobalSlot(200);
    withdrawTxn = await Mina.transaction(deployerAccount, async () => {
      const sender = AccountUpdate.createSigned(deployerAccount);
      sender.send({ to: investor1, amount: UInt64.from(10) });
    });
    await withdrawTxn.prove();
    await withdrawTxn.sign([deployerKey, zkappPrivateKey]).send().wait();
    expect(Mina.getBalance(investor1)).toEqual(UInt64.from(40));

    // 1600 slots
    Local.incrementGlobalSlot(1200);
    withdrawTxn = await Mina.transaction(deployerAccount, async () => {
      const sender = AccountUpdate.createSigned(deployerAccount);
      sender.send({ to: investor1, amount: UInt64.from(60) });
    });
    await withdrawTxn.prove();
    await withdrawTxn.sign([deployerKey, zkappPrivateKey]).send().wait();
    expect(Mina.getBalance(investor1)).toEqual(UInt64.from(100));
  });

  it('Withdrawal Mechanism: should prevent unauthorized withdrawal', async () => {
    Local.setBlockchainLength(UInt32.from(20));
    Mina.setActiveInstance(Local);

    await expect(async () => {
      const txn = await Mina.transaction(investor1, async () => {
        await zkAppInstance.withdraw(investor1);
      });
      await txn.prove();
      await txn.sign([investor1Key, zkappPrivateKey]).send().wait();
    }).rejects.toThrow();
  });
});
