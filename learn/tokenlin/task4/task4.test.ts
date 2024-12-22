import { 
  AccountUpdate, 
  Field, 
  Mina, 
  PrivateKey, 
  PublicKey,
  UInt32,
  UInt64
 } from 'o1js';
import { Donate } from './task4';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */



// 在项目入口文件顶部导入
import * as dotenv from 'dotenv';
dotenv.config();
// 读取环境变量
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_ZKAPP = process.env.PRIVATE_KEY_ZKAPP_TASK4;
const PRIVATE_KEY_PRIVILEGED_ACCT = process.env.PRIVATE_KEY_PRIVILEGED_ACCT_TASK4;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in .env file');
}
if (!PRIVATE_KEY_ZKAPP) {
  throw new Error('PRIVATE_KEY_ZKAPP is not defined in .env file');
}
if (!PRIVATE_KEY_PRIVILEGED_ACCT) {
  throw new Error('PRIVATE_KEY_PRIVILEGED_ACCT is not defined in .env file');
}
// console.log("PRIVATE_KEY, " + PRIVATE_KEY);







let proofsEnabled = false;

let initialState_deadlineBlockHeight = new UInt32(376620);

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
    PrivateKey.fromBase58(PRIVATE_KEY_PRIVILEGED_ACCT)
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
    expect(num).toEqual(initialState_deadlineBlockHeight);
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

  it('withdraw and send', async () => {
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
    Local.incrementGlobalSlot(initialState_deadlineBlockHeight);  // 改变slot
    Mina.setActiveInstance(Local);
    txn = await Mina.transaction(senderAccount, async () => {
      AccountUpdate.fundNewAccount(senderAccount);
      await zkApp.withdraw(privilegedAcct.key);
    });
    await txn.prove();
    await txn.sign([senderKey, privilegedAcct.key]).send();

    // check
    const privilegedAcctBalance = Mina.getBalance(privilegedAcct);
    console.log(`privilegedAcct balances: ${Mina.getBalance(privilegedAcct).div(1e9)} MINA`)
    expect(privilegedAcctBalance).toEqual(new UInt64(2e9));



    // console.log("globalSlotSinceGenesis: " + Local.getNetworkState().globalSlotSinceGenesis);
    // Local.incrementGlobalSlot(50);
    // console.log("globalSlotSinceGenesis: " + Local.getNetworkState().globalSlotSinceGenesis);



    // send to zkapp 1 mina
    try{
      txn = await Mina.transaction(privilegedAcct, async () => {
        // AccountUpdate.fundNewAccount(senderAccount);
        let payerAccountUpdate = AccountUpdate.createSigned(privilegedAcct);
            payerAccountUpdate.send({ to: zkAppAddress, amount: UInt64.from(1e9) });// 2MINA
      });
      await txn.prove();
      await txn.sign([senderAccount.key, privilegedAcct.key]).send();
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 1 MINA to zkapp ok`)
    }catch(error){
      // console.log(error);
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 1 MINA to zkapp error`)
    }



    // send to zkapp 0.4 mina
    try{
      txn = await Mina.transaction(privilegedAcct, async () => {
        let payerAccountUpdate = AccountUpdate.createSigned(privilegedAcct);
            payerAccountUpdate.send({ to: zkAppAddress, amount: UInt64.from(0.4e9) });
      });
      await txn.prove();
      await txn.sign([privilegedAcct.key]).send();
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.4 MINA to zkapp ok`)
    }catch(error){
      // console.log(error);
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.4 MINA to zkapp error`)
    }




    Local.incrementGlobalSlot(200);  // 改变slot


    // send to zkapp 0.3 mina
    try{
      txn = await Mina.transaction(privilegedAcct, async () => {
        let payerAccountUpdate = AccountUpdate.createSigned(privilegedAcct);
            payerAccountUpdate.send({ to: zkAppAddress, amount: UInt64.from(0.3e9) });
      });
      await txn.prove();
      await txn.sign([senderAccount.key, privilegedAcct.key]).send();
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.3 MINA to zkapp ok`)
    }catch(error){
      // console.log(error);
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.3 MINA to zkapp error`)
    }





    // Local.incrementGlobalSlot(200);  // 改变slot
    // send to zkapp 0.2 mina
    try{
      txn = await Mina.transaction(privilegedAcct, async () => {
        let payerAccountUpdate = AccountUpdate.createSigned(privilegedAcct);
            payerAccountUpdate.send({ to: zkAppAddress, amount: UInt64.from(0.2e9) });
      });
      await txn.prove();
      await txn.sign([senderAccount.key, privilegedAcct.key]).send();
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.2 MINA to zkapp ok`)
    }catch(error){
      // console.log(error);
      console.log(`slot ${Local.getNetworkState().globalSlotSinceGenesis}: send 0.2 MINA to zkapp error`)
    }




  });

});
