import {
  Field,
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt32,
  UInt64
} from 'o1js';
// import { getProfiler } from './utils/profiler.js';
import { RabbitToken, RabbitTokenPublish } from './tokenfunding.js';

// const SimpleProfiler = getProfiler('Simple zkApp');
// SimpleProfiler.start('Simple zkApp test flow');

const MINA = 1e9;
const hardcapSlot = UInt64.from(30 * MINA);

// Network configuration
const network = Mina.Network({
  mina:'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

// Fee payer setup
const senderKey = PrivateKey.fromBase58('EKE****');
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


let { publicKey: tokenAddress, privateKey: tokenOwner } = PrivateKey.randomKeypair();
let token = new RabbitToken(tokenAddress);
let tokenId = token.deriveTokenId();

// 编译合约
console.log('compile');
console.time('compile');
await RabbitToken.compile();
console.timeEnd('compile');

const tx = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: '一笔交易',
  // nonce: 2
}, async () => {
    AccountUpdate.fundNewAccount(sender, 2);
    await token.deploy();
});
await tx.prove();
let txnResponse1 = await tx.sign([tokenOwner, senderKey]).send().wait();
console.log('Transaction Hash 1:', txnResponse1.status, txnResponse1.hash);



const { publicKey: appAddress, privateKey: appAccount } = PrivateKey.randomKeypair();
const zkApp = new RabbitTokenPublish(appAddress, tokenId);
await RabbitTokenPublish.compile();

const deployAppTx = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: '一笔交易',
  // nonce: 2
}, async () => {
    AccountUpdate.fundNewAccount(sender);
    await zkApp.deploy({ endAt: UInt32.from(200) });
    await token.approveAccountUpdate(zkApp.self);
});
await deployAppTx.prove();
let txnResponse2 = await deployAppTx.sign([appAccount, senderKey]).send().wait();
console.log('Transaction Hash 2:', txnResponse2.status, txnResponse2.hash);


