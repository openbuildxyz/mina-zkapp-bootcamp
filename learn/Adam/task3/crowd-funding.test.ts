import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './crowd-funding';
import { LocalBlockchain } from 'o1js/dist/node/lib/mina/local-blockchain';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('CrowdFunding', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    sender1: Mina.TestPublicKey,
    sender2: Mina.TestPublicKey,
    withdrawer: Mina.TestPublicKey,
    sender1Key: PrivateKey,
    sender2Key: PrivateKey,
    withdrawerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: CrowdFunding,
    currentSlot: UInt32,
    Local: any


  beforeAll(async () => {
    if (proofsEnabled) await CrowdFunding.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    currentSlot = Local.getNetworkState().blockchainLength;

    [deployerAccount, sender1, sender2, withdrawer] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    sender1Key = sender1.key;
    sender2Key = sender2.key;
    withdrawerKey = withdrawer.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new CrowdFunding(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy({
        privileged: withdrawer
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys CrowdFunding smart contract', async () => {
    await localDeploy();
    const balance = zkApp.account.balance.get();
    expect(Number(balance)).toEqual(0);
  });

  it('correctly sender1 fund 1 Mina', async () => {
    await localDeploy();

    const senderBalance = Mina.getBalance(sender1);
    // update transaction
    const txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    const updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(1e9);

    expect(Mina.getBalance(sender1)).toEqual(senderBalance.sub(1e9));
  });

  it('correctly sender2 fund 100 Mina but actually sub 1 Mina', async () => {
    await localDeploy();

    const senderBalance = Mina.getBalance(sender1);
    // update transaction
    const txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(100 * 1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    const updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(1e9);

    expect(Mina.getBalance(sender1)).toEqual(senderBalance.sub(1e9));
  });

  it('correctly sender1 and sender2 fund 2 Mina totally, and withdrawer withdraw all Mina', async () => {
    // pass this test, change fundgoal to 2 Mina first
    await localDeploy();

    const sender1Balance = Mina.getBalance(sender1);
    const sender2Balance = Mina.getBalance(sender2);
    // sender2 fund 1 Mina
    let txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    // sender2 fund 1 Mina
    txn = await Mina.transaction(sender2, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender2Key, zkAppPrivateKey]).send().wait();


    let updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(2 * 1e9);
    expect(Mina.getBalance(sender1)).toEqual(sender1Balance.sub(1e9));
    expect(Mina.getBalance(sender2)).toEqual(sender2Balance.sub(1e9));

    // withdraw

    // set blockchainLength
    Local.setBlockchainLength(UInt32.from(1e9));
    Mina.setActiveInstance(Local);


    const withdrawerBalance = Mina.getBalance(withdrawer);
    txn = await Mina.transaction(withdrawer, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([withdrawerKey, zkAppPrivateKey]).send().wait();

    updatedBalance = zkApp.account.balance.get();
    expect(Mina.getBalance(withdrawer)).toEqual(withdrawerBalance.add(2 * 1e9));
    expect(Number(updatedBalance)).toEqual(0);
  });

  it('error when time is not in range', async () => {
    Local.setBlockchainLength(UInt32.from(1e9));
    Mina.setActiveInstance(Local);

    await localDeploy();
    await expect(
      Mina.transaction(sender1, async () => {
        await zkApp.fund(UInt64.from(1e9));
      })
    ).rejects.toThrow();
  })

  // it('error when fundgoal is 1 Mina and has received 1 Mina', async () => {
  //   await localDeploy();

  //   // fund 1 Mina
  //   let txn = await Mina.transaction(sender1, async () => {
  //     await zkApp.fund(UInt64.from(1e9));
  //   });
  //   await txn.prove();
  //   await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

  //   const updatedBalance = zkApp.account.balance.get();
  //   expect(Number(updatedBalance)).toEqual(1e9);


  //   await expect(
  //     Mina.transaction(sender2, async () => {
  //       await zkApp.fund(UInt64.from(1e9));
  //     })
  //   ).rejects.toThrow();
  // })

  it('error when withdrawer is not true withdrawer', async () => {
    await localDeploy();
    await expect(
      Mina.transaction(sender1, async () => {
        await zkApp.withdraw();
      })
    ).rejects.toThrow();
  })
});
