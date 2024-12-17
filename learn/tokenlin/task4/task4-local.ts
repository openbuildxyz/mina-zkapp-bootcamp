import {
  Field,
  Mina,
  UInt32,
  UInt64,
  PrivateKey,
  fetchAccount,
  AccountUpdate} from 'o1js';
import { getProfiler } from '../others/utils/profiler.js';
import { Donate } from "./task4.js";


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



const SimpleProfiler = getProfiler('Simple zkApp');
SimpleProfiler.start('Simple zkApp test flow');


let initialState_deadlineBlockHeight = new UInt32(376620);



const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// 编译合约

if (doProofs) {
  await Donate.compile();
} else {
  await Donate.analyzeMethods();
}

// a test account that pays all the fees, and puts additional funds into the zkapp
let [sender] = Local.testAccounts;// EKEdjFogmuzcAYVqYJZPuF8WmXVR1PBZ3oMA2ektLpeRJArkD4ne

console.log('initial sender balance: ' + Mina.getBalance(sender));


const privilegedAcct = Mina.TestPublicKey(
  PrivateKey.fromBase58(PRIVATE_KEY_PRIVILEGED_ACCT)
);



// the zkapp account
let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new Donate(zkappAccount);

console.log('deploy');
let tx = await Mina.transaction({
  sender,
  fee: 0.1 * 10e9,
  memo: '一笔交易',
  // nonce: 2
}, async () => {
  AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
  zkapp.deploy();// 部署前设置合约初始状态
});
await tx.prove();
await tx.sign([sender.key, zkappAccount.key]).send();

// console.log(tx.toPretty());

// await fetchAccount({publicKey: zkappAccount});// !!!必须
console.log('initial deadlineBlockHeight: ' + zkapp.deadlineBlockHeight.get());
console.log('initial targetAmount: ' + zkapp.targetAmount.get());
console.log('initial receivedAmount: ' + zkapp.receivedAmount.get());
console.log('sender balance: ' + Mina.getBalance(sender));

let account = Mina.getAccount(zkappAccount);
// console.log(JSON.stringify(account));


// // pay more into the zkapp -- this doesn't need a proof
// console.log('receive...');
// tx = await Mina.transaction(sender, async () => {
//   let payerAccountUpdate = AccountUpdate.createSigned(sender);
//   payerAccountUpdate.send({ to: zkappAccount, amount: UInt64.from(200e9) });// 100MINA
// });
// await tx.sign([sender.key]).send();
// console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);


// // pay more into the zkapp -- this doesn't need a proof
// console.log('receive...');
// tx = await Mina.transaction(sender, async () => {
//   let payerAccountUpdate = AccountUpdate.createSigned(sender);
//   AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
//   payerAccountUpdate.send({ to: privilegedAcct, amount: UInt64.from(200e9) });// 100MINA
// });
// await tx.sign([sender.key]).send();
// // console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);
// console.log('privilegedAcct balance: ' + Mina.getBalance(privilegedAcct));







console.log('donate 1 ...');
tx = await Mina.transaction(sender, async () => {
  await zkapp.donate(sender, new UInt64(1e9));
});
await tx.prove();
await tx.sign([sender.key]).send();

console.log('update receivedAmount 1 ...');
const newX = zkapp.receivedAmount.get();
console.log('latest state: ' + newX);
console.log('sender balance: ' + Mina.getBalance(sender));
console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);


console.log('donate 2 ...');
tx = await Mina.transaction(sender, async () => {
  await zkapp.donate(sender, new UInt64(1e9));
});
await tx.prove();
await tx.sign([sender.key]).send();

console.log('update receivedAmount 2 ...');
const newX2 = zkapp.receivedAmount.get();
console.log('latest state: ' + newX2);
console.log('sender balance: ' + Mina.getBalance(sender));
console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);


console.log('donate 3 ...');
try{
  tx = await Mina.transaction(sender, async () => {
    await zkapp.donate(sender, new UInt64(1e9));
  });
  await tx.prove();
  await tx.sign([sender.key]).send();
}catch(error){
  console.log("donate 3 error")
}




console.log('withdraw ...');
// console.log("zkapp balance: " + zkapp.account.balance.get().div(1));
console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);

Local.setBlockchainLength(initialState_deadlineBlockHeight);  // 改变区块高度。
tx = await Mina.transaction(sender, async () => {
  AccountUpdate.fundNewAccount(sender);// 消耗1MINA用于创建新账户
  await zkapp.withdraw(privilegedAcct.key);
});
await tx.prove();
await tx.sign([sender.key, privilegedAcct.key]).send();

console.log('update receivedAmount 3 ...');
// const newX3 = zkapp.receivedAmount.get();
// console.log('latest state: ' + newX3);
console.log('sender balance: ' + Mina.getBalance(sender));
console.log('privilegedAcct balance: ' + Mina.getBalance(privilegedAcct));
console.log(`current balance of zkapp after withdrawing: ${zkapp.account.balance.get().div(1e9)} MINA`);




// send to the zkapp -- this doesn't need a proof
console.log('send 2 MINA to zkapp, will be fail...');
try{
  tx = await Mina.transaction(privilegedAcct, async () => {
    let payerAccountUpdate = AccountUpdate.createSigned(privilegedAcct);
    payerAccountUpdate.send({ to: zkappAccount, amount: UInt64.from(2e9) });// 2MINA
  });
  await tx.sign([privilegedAcct.key]).send();
  console.log(`current balance of zkapp: ${zkapp.account.balance.get().div(1e9)} MINA`);
}catch(error){
  console.log("send 2 MINA to zkapp error")
}



SimpleProfiler.stop().store();
