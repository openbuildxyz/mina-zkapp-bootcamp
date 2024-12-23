import {
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt64,
  UInt32,
  PublicKey,
} from 'o1js';

import { getProfiler } from './utils/proifler.js';
import { Fundraising } from './fundraising.js';
import { feepayerKeys, contractKeys } from './testkeys/myfirsttest.js';

function formatMina(amount: UInt64): string {
  return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

function getCurrentBlockHeight() {
  return Number(Mina.getNetworkState().blockchainLength);
}

const CrowdProfiler = getProfiler('Crowd-Funding zkApp');
CrowdProfiler.start('Crowd-Funding zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);
console.log('Connected to Mina network...');
const deployerKey = PrivateKey.fromValue(feepayerKeys.privateKey);
const deployer = PublicKey.fromValue(feepayerKeys.publicKey);
// console.log(`Funding the fee payer account.`);
// await Mina.faucet(deployer); // 领水

// 投资人1
// const investor1Key = PrivateKey.fromBase58(test2);
// const investor1 = investor1Key.toPublicKey();

console.log(`Fetching the fee payer account information.`);
const deployerAcct = await fetchAccount({ publicKey: deployer });
const accountDetails = deployerAcct.account;
console.log(
  `Using the fee payer account ${deployer.toBase58()} with nonce: ${
    accountDetails?.nonce
  } and balance: ${accountDetails?.balance}.`
);

// 编译合约
console.log('compile');
console.time('compile');
await Fundraising.compile();
console.timeEnd('compile');

let zkappKey = PrivateKey.fromValue(contractKeys.privateKey);
let zkappAccount = PublicKey.fromValue(contractKeys.publicKey);
let zkapp = new Fundraising(zkappAccount);

// 合约地址
console.log(`合约地址: ${zkappAccount.toBase58()}`);
console.log(`合约私钥: ${zkappKey.toBase58()}`);

// 部署合约
console.log('deploy...');
console.time('deploy');
const currentHeight = getCurrentBlockHeight();
console.log('当前区块高度:', currentHeight);
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.2 * 1e9,
    memo: '众筹合约部署',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer);
    await zkapp.deploy({
      hardCap: UInt64.from(10 * 1e9), // 10 MINA
      raiseOwner: deployer,
      endTime: UInt32.from(currentHeight + 10),
    });
  }
);
await tx.prove();
await tx.sign([deployerKey, zkappKey]).send().wait();
console.timeEnd('deploy');

// 每次都需要重新获取账户信息
await fetchAccount({ publicKey: zkappAccount });
console.log('初始状态..........');
console.log('线上合约地址: ' + zkappAccount.toBase58());
console.log('硬顶金额: ' + formatMina(zkapp.hardCap.get()), 'MINA');
console.log('募资结束时间: ' + zkapp.endTime.get().toString());
console.log('当前募资总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');
// 获取部署者账户（受益人）的最新余额状态（更新状态）
await fetchAccount({ publicKey: deployer });

// // 投资
// console.log('\n投资人1 - 投资 5 MINA..');
// tx = await Mina.transaction(
//   {
//     sender: investor1,
//     fee: 0.1 * 1e9,
//     memo: '投资',
//   },
//   async () => {
//     await zkapp.invest(UInt64.from(5 * 1e9));
//   }
// );
// await tx.prove();
// await tx.sign([investor1Key]).send().wait();

// // 获取合约状态
// await fetchAccount({ publicKey: zkappAccount });
// await fetchAccount({ publicKey: deployer });
// console.log('\n合约状态:');
// console.log('当前募资总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
// console.log('受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');

// console.log('\n等待区块高度增加..........');
// const endTime = zkapp.endTime.get();

// while (true) {
//   await fetchAccount({ publicKey: zkappAccount });
//   const currentBalance = Mina.getBalance(zkappAccount);
//   console.log('\n当前众筹状态:');
//   console.log(`当前募集: ${formatMina(currentBalance)} MINA`);

//   const currentHeight = getCurrentBlockHeight();
//   console.log('当前区块高度:', currentHeight);

//   if (currentHeight >= Number(endTime)) {
//     console.log('募资结束...');
//     break;
//   }

//   console.log(`距离结束还需 ${Number(endTime) - currentHeight} 个区块`);

//   await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
// }

// // 提现
// console.log('\n 提现测试......');
// tx = await Mina.transaction(
//   {
//     sender: deployer,
//     fee: 0.1 * 1e9,
//     memo: '提现',
//   },
//   async () => {
//     await zkapp.withdraw(UInt64.from(10 * 1e9));
//   }
// );
// await tx.prove();
// await tx.sign([deployerKey]).send().wait();

// console.log('\n提现后合约状态:');
// await fetchAccount({ publicKey: zkappAccount });
// await fetchAccount({ publicKey: deployer });
// console.log('剩余总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
// console.log('体现后受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');

CrowdProfiler.stop().store();
