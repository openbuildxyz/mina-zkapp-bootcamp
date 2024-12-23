import {
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt64,
  UInt32,
} from 'o1js';
import { getProfiler } from '../utils/profiler.js';
import { CrowdFundingZkapp } from './crowd-funding-zkapp.js';
import { test1, test2 } from './private.js';
import { formatMina, getCurrentBlockHeight } from './utils.js';

const CrowdProfiler = getProfiler('Crowd-Funding zkApp');
CrowdProfiler.start('Crowd-Funding zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

// 部署着（收益者）
const deployerKey = PrivateKey.fromBase58(test1);
const deployer = deployerKey.toPublicKey();
// console.log(`Funding the fee payer account.`);
// await Mina.faucet(deployer); // 领水

// 投资人1
const investor1Key = PrivateKey.fromBase58(test2);
const investor1 = investor1Key.toPublicKey();

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
await CrowdFundingZkapp.compile();
console.timeEnd('compile');

// 创建众筹合约账户
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdFundingZkapp(zkappAccount);

// 合约地址
console.log(`合约地址: ${zkappAccount.toBase58()}`);
console.log(`合约私钥: ${zkappKey.toBase58()}`);

// 部署合约
console.log('deploy...');
console.time('deploy');
const currentHeight = await getCurrentBlockHeight();
console.log('当前区块高度:', currentHeight);
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.2 * 1e9,
    memo: '众筹合约部署',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // 部署时创建合约账户花费11MINA
    await zkapp.deploy({
      beneficiary: deployer, // 受益人（部署账户就是被投资人）
      targetAmount: UInt64.from(10 * 1e9), // 10 MINA
      endTime: UInt32.from(currentHeight + 10), // 2个区块后结束
    });
  }
);
await tx.prove();
await tx.sign([deployerKey, zkappKey]).send().wait();
console.timeEnd('deploy');

/**
 * Mina 的账户状态是本地缓存的
 * 每次交易后，相关账户的状态都会发生变化
 * 在读取重要状态之前，需要确保我们有最新的链上数据
 * 如果不进行fetchAccount 调用，可能会读取到过期的状态数据
 */
// 获取智能合约账户的最新状态（更新状态）
await fetchAccount({ publicKey: zkappAccount }); // !!!必须
console.log('初始状态:');
console.log('合约地址: ' + zkappAccount.toBase58());
console.log('目标金额: ' + formatMina(zkapp.targetAmount.get()), 'MINA');
console.log('结束时间: ' + zkapp.endTime.get().toString());
console.log('总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');
// 获取部署者账户（受益人）的最新余额状态（更新状态）
await fetchAccount({ publicKey: deployer }); // !!!必须

// 投资
console.log('\n投资人1 - 投资 5 MINA..');
tx = await Mina.transaction(
  {
    sender: investor1,
    fee: 0.1 * 1e9,
    memo: '投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(5 * 1e9));
  }
);
await tx.prove();
await tx.sign([investor1Key]).send().wait();

// 获取合约状态
await fetchAccount({ publicKey: zkappAccount });
await fetchAccount({ publicKey: deployer });
console.log('\n合约状态:');
console.log('总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');

// 等待2个区块
console.log('\n等待区块高度增加...');
const endTime = zkapp.endTime.get();
const targetAmount = zkapp.targetAmount.get();
while (true) {
  await fetchAccount({ publicKey: zkappAccount });
  const currentBalance = Mina.getBalance(zkappAccount);
  console.log('\n当前众筹状态:');
  console.log(
    `当前募集: ${formatMina(currentBalance)} / ${formatMina(targetAmount)} MINA`
  );
  console.log(
    `完成度: ${((Number(currentBalance) / Number(targetAmount)) * 100).toFixed(
      2
    )}%`
  );

  const currentHeight = await getCurrentBlockHeight();
  console.log('当前区块高度:', currentHeight);

  if (currentHeight >= Number(endTime)) {
    console.log('众筹已结束...');
    break;
  }

  console.log(`距离结束还需 ${Number(endTime) - currentHeight} 个区块`);

  await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
}

// 提现
console.log('\n 提现..');
tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.1 * 1e9,
    memo: '提现',
  },
  async () => {
    await zkapp.withdraw();
  }
);
await tx.prove();
await tx.sign([deployerKey]).send().wait();

// 获取合约状态
console.log('\n合约状态:');
await fetchAccount({ publicKey: zkappAccount });
await fetchAccount({ publicKey: deployer });
console.log('总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(deployer)), 'MINA');

CrowdProfiler.stop().store();
