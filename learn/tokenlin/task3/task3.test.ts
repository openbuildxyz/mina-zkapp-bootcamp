import { 
  AccountUpdate, 
  Field, 
  Mina, 
  PrivateKey, 
  PublicKey,
  UInt32,
  UInt64
 } from 'o1js';
import { Donate } from './task3';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('Donate', () => {

  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Donate,
    Local: any;


  const privilegedAcct = Mina.TestPublicKey(
    PrivateKey.fromBase58('EKEeoESE2A41YQnSht9f7mjiKpJSeZ4jnfHXYatYi8xJdYSxWBep')
  );

  beforeAll(async () => {
    if (proofsEnabled) await Donate.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Donate(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('get initial deadlineBlockHeight', async () => {
    await localDeploy();
    const num = zkApp.deadlineBlockHeight.get();
    expect(num).toEqual(new UInt32(373835));
  });



  it('donate 1', async () => {
    await localDeploy();

    // update transaction
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.donate(senderAccount, new UInt64(1e9));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const updatedNum = zkApp.receivedAmount.get();
    expect(updatedNum).toEqual(new UInt64(1e9));
  });

  it('withdraw', async () => {
    await localDeploy();
    // donate 1
    let txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.donate(senderAccount, new UInt64(1e9));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // donate 2
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.donate(senderAccount, new UInt64(1e9));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // check
    const updatedNum = zkApp.receivedAmount.get();
    expect(updatedNum).toEqual(new UInt64(2e9));


    // withdraw
    // const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Local.setBlockchainLength(new UInt32(100000000));  // 改变区块高度。
    Mina.setActiveInstance(Local);
    txn = await Mina.transaction(senderAccount, async () => {
      AccountUpdate.fundNewAccount(senderAccount);
      await zkApp.withdraw(privilegedAcct.key, new UInt64(1e9));
    });
    await txn.prove();
    await txn.sign([senderKey, privilegedAcct.key]).send();

    // check
    const privilegedAcctBalance = Mina.getBalance(privilegedAcct);
    expect(privilegedAcctBalance).toEqual(new UInt64(2e9));

    const receivedAmount = zkApp.receivedAmount.get();
    expect(receivedAmount).toEqual(new UInt64(1e9));

  });

});
