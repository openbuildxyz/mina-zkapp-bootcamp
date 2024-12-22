import {
  Field,
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt32,
  UInt64,
} from 'o1js';
import { CrowdfundingZkapp } from './crowdfunding-zkapp.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

const senderPriv: string = process.env.SENDER_PRIV!;
const senderKey = PrivateKey.fromBase58(senderPriv);
const sender = senderKey.toPublicKey();
//console.log(`Funding the fee payer account.`);
//await Mina.faucet(sender); // 领水

const deployerPriv: string = process.env.DEPLOYER_PRIV!;
const deployerKey = PrivateKey.fromBase58(deployerPriv);
const deployer = deployerKey.toPublicKey();
//console.log(`Funding the fee payer account.`);
//await Mina.faucet(deployer); // 领水

const endBlockchainLength = 373800;

// 编译合约
await CrowdfundingZkapp.compile();

// the zkapp account
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdfundingZkapp(zkappAccount);

console.log('deploy');
await fetchAccount({ publicKey: deployer });
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.2 * 10e9,
    memo: 'deploy',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
    await zkapp.deploy({
      endTime: UInt32.from(endBlockchainLength),
      hardCap: UInt64.from(10 * 10 ** 9),
      withdrawer: deployer,
    }); // 部署前设置合约初始状态
  }
);
await tx.prove();
await tx.sign([deployerKey, zkappKey]).send().wait();
console.log(tx.toPretty());

console.log('deposit');
await fetchAccount({ publicKey: sender });
await fetchAccount({ publicKey: zkappAccount });

tx = await Mina.transaction(
  { sender, fee: 0.2 * 10e9, memo: 'deposit' },
  async () => {
    await zkapp.deposit(UInt64.from(3 * 10 ** 9));
  }
);
await tx.prove();
await tx.sign([senderKey]).send().wait();
console.log(tx.toPretty());

//console.log('withdraw');
//
// await fetchAccount({ publicKey: deployer });
// await fetchAccount({ publicKey: zkappAccount });
//tx = await Mina.transaction(
//  { sender: deployer, fee: 0.1 * 10e9, memo: 'withdraw' },
//  async () => {
//    await zkapp.withdraw();
//  }
//);
//await tx.prove();
//await tx.sign([deployerKey]).send().wait();
//console.log(tx.toPretty());
