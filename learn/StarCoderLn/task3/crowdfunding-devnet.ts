import { CrowdfundingContract } from './crowdfunding-local.js';
import { Mina, PrivateKey, AccountUpdate, UInt64, fetchAccount } from 'o1js';

const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

const key = '';
const senderKey = PrivateKey.fromBase58(key);
const sender = senderKey.toPublicKey();
// await Mina.faucet(sender); // Territorial waters
const senderAccount = await fetchAccount({ publicKey: sender });
const accountDetails = senderAccount?.account;
console.log(`Using the creator account ${sender.toBase58()} with nonce: ${accountDetails?.nonce} and balance: ${accountDetails?.balance}`)

console.log('Compiling contracts...');
await CrowdfundingContract.compile();

let zkAppKey = PrivateKey.random();
let zkAppAccount = zkAppKey.toPublicKey();
let zkApp = new CrowdfundingContract(zkAppAccount);

console.log('Deploying contracts...');
let txn = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 10e9,
    memo: 'Deploy transaction',
  },
  async () => {
    AccountUpdate.fundNewAccount(sender);
    await zkApp.deploy({
      creator: sender,
      fundraisingGoal: UInt64.from(100 * 1e9),
      endTime: UInt64.from(2733562450713),
    });
  }
);
await txn.prove();
await txn.sign([senderKey, zkAppKey]).send();

await fetchAccount({ publicKey: zkAppAccount });
await fetchAccount({ publicKey: sender });

console.log('Invest...');
await fetchAccount({ publicKey: zkAppAccount });
txn = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 10e9,
    memo: 'Invest transaction',
  },
  async () => {
    await zkApp.fund(UInt64.from(1e9));
  }
);
await txn.prove();
await txn.sign([senderKey]).send();

await fetchAccount({ publicKey: zkAppAccount });
console.log('Total funded', zkApp.totalFunded.get().toString());

// Modify end time
txn = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 10e9,
    memo: 'Set end time',
  },
  async () => {
    await zkApp.setEndTime(UInt64.from(2733562450713));
  }
);
await txn.prove();
await txn.sign([senderKey]).send();

console.log('Withdraw...');
txn = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 10e9,
    memo: 'Withdraw transaction',
  },
  async () => {
    await zkApp.withdraw();
  }
);
