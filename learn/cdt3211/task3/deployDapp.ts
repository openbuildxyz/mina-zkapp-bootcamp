import {
  CrowdfundingContract
} from './crowFunding.js';
import {
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  fetchAccount
} from 'o1js';

const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

const senderKey = PrivateKey.fromBase58('KEY');
const sender = senderKey.toPublicKey();

const senderAccount = await fetchAccount({ publicKey: sender });
const accountDetails = senderAccount?.account;
if (!accountDetails) {
  console.error('Account not found');
}
console.log('sender', sender.toBase58())
console.log('nonce', accountDetails?.nonce)
console.log('balance', accountDetails?.balance)

console.log('编译合约')
await CrowdfundingContract.compile();

let zkAppKey = PrivateKey.random();
let zkAppAccount = zkAppKey.toPublicKey();
let zkApp = new CrowdfundingContract(zkAppAccount);

console.log('部署合约')
let txn = await Mina.transaction({
  sender,
  fee: 0.2 * 1e9,
  memo: 'deploy contract',
},
  async () => {
    AccountUpdate.fundNewAccount(sender);
    await zkApp.deploy({
      creator: sender,
      fundraisingGoal: UInt64.from(100 * 1e9),
      endTime: UInt64.from(2733562450713)
    });
  });
await txn.prove();
await txn.sign([senderKey, zkAppKey]).send();

await fetchAccount({ publicKey: zkAppAccount });
await fetchAccount({ publicKey: sender });

console.log('投资')
await fetchAccount({ publicKey: zkAppAccount });
txn = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: 'fund contract'
}, async () => {
  await zkApp.fund(UInt64.from(1e9));
})
await txn.prove();
await txn.sign([senderKey]).send();

await fetchAccount({ publicKey: zkAppAccount });
console.log('totalFunded', zkApp.totalFunded.get().toString());

console.log('提款')
//修改结束时间
txn = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: 'set end time'
}, async () => {
  await zkApp.setEndTime(UInt64.from(2733562450713));
});
await txn.prove();
await txn.sign([senderKey]).send();

txn = await Mina.transaction({
  sender,
  fee: 0.2 * 10e9,
  memo: 'withdraw contract'
}, async () => {
  await zkApp.withdraw();
})