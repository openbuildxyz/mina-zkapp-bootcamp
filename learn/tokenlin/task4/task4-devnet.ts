import {
  Field,
  PrivateKey,
  Mina,
  UInt64,
  UInt32,
  AccountUpdate,
  fetchAccount
} from 'o1js';
// import { getProfiler } from '../utils/profiler.js';
// import { VerySimpleZkapp } from './task3.js';

import { getProfiler } from '../others/utils/profiler.js';
import { Donate } from "./task4.js";


const SimpleProfiler = getProfiler('Simple zkApp');
SimpleProfiler.start('Simple zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina:'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);




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







const privilegedAcct = Mina.TestPublicKey(
  PrivateKey.fromBase58(PRIVATE_KEY_PRIVILEGED_ACCT)
);


// Fee payer setup
// const senderKey = PrivateKey.fromBase58('EKEdjFogmuzcAYVqYJZPuF8WmXVR1PBZ3oMA2ektLpeRJArkD4ne');
const senderKey = PrivateKey.fromBase58(PRIVATE_KEY);
const sender = senderKey.toPublicKey();
// console.log(`Funding the fee payer account.`);
// await Mina.faucet(sender);// 领水



console.log(`Fetching the fee payer account information.`);
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(
  `Using the fee payer account ${sender.toBase58()} with nonce: ${
    accountDetails?.nonce
  } and balance: ${accountDetails?.balance}.`
);
console.log('');

// 编译合约
console.log('compile');
console.time('compile');
await Donate.compile();
console.timeEnd('compile');

// the zkapp account
// let zkappKey = PrivateKey.random();
// let zkappAccount = zkappKey.toPublicKey();// 需要保存好合约账户的私钥！
const zkappKey = PrivateKey.fromBase58(PRIVATE_KEY_ZKAPP);
const zkappAccount = zkappKey.toPublicKey();

let zkapp = new Donate(zkappAccount);

// console.log("zkappAccount privatekey: " + zkappKey.toBase58());
// console.log("zkappAccount publickey: " + zkappAccount.toBase58());
// console.log("PrivateKey.fromBase58(): " + PrivateKey.fromBase58(zkappKey.toBase58()).toBase58());



// // random generate
// let random = PrivateKey.random();
// let random_acc = random.toPublicKey();// 需要保存好合约账户的私钥！
// console.log("random_acc privatekey: " + random.toBase58());
// console.log("random_acc publickey: " + random_acc.toBase58());







console.log('deploy...');
let tx = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: 'deploy',
  // nonce: 2
}, async () => {
  AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
  zkapp.deploy();// 部署前设置合约初始状态
});
await tx.prove();
await tx.sign([senderKey, zkappKey]).send().wait();

await fetchAccount({publicKey: zkappAccount});// !!!必须
console.log('initial receivedAmount: ' + zkapp.receivedAmount.get());
await fetchAccount({publicKey: sender});// !!!必须











// console.log('donate 1 ...');
// await fetchAccount({publicKey: zkappAccount});// !!!必须
// await fetchAccount({publicKey: sender});// !!!必须
// tx = await Mina.transaction({
//   sender,
//   fee: 0.2 * 10**9,
//   memo: 'donate 1',
//   // nonce: 2
// }, async () => {
//   // await zkapp.update(Field(3));
//   await zkapp.donate(sender, new UInt64(1e9));
// });
// await tx.prove();
// await tx.sign([senderKey]).send().wait();

// await fetchAccount({publicKey: zkappAccount});
// console.log('current receivedAmount: ' + zkapp.receivedAmount.get());
// await fetchAccount({publicKey: sender});// !!!必须






// console.log('donate 2 ...');
// await fetchAccount({publicKey: zkappAccount});// !!!必须
// await fetchAccount({publicKey: sender});// !!!必须
// tx = await Mina.transaction({
//   sender,
//   fee: 0.2 * 10**9,
//   memo: 'donate 2',
//   // nonce: 2
// }, async () => {
//   // await zkapp.update(Field(3));
//   await zkapp.donate(sender, new UInt64(1e9));
// });
// await tx.prove();
// await tx.sign([senderKey]).send().wait();

// await fetchAccount({publicKey: zkappAccount});
// console.log('current receivedAmount: ' + zkapp.receivedAmount.get());
// await fetchAccount({publicKey: sender});// !!!必须







// console.log('withdraw ...');
// await fetchAccount({publicKey: zkappAccount});// !!!必须
// await fetchAccount({publicKey: sender});// !!!必须
// tx = await Mina.transaction({
//   sender,
//   fee: 0.2 * 10**9,
//   memo: 'withdraw',
//   // nonce: 2
// }, async () => {
//   // await zkapp.update(Field(3));
//   AccountUpdate.fundNewAccount(sender);// 消耗1MINA用于创建新账户
//   await zkapp.withdraw(privilegedAcct.key);
// });
// await tx.prove();
// await tx.sign([senderKey, privilegedAcct.key]).send().wait();

// await fetchAccount({publicKey: zkappAccount});
// console.log('current receivedAmount: ' + zkapp.receivedAmount.get());
// await fetchAccount({publicKey: sender});// !!!必须


SimpleProfiler.stop().store();
