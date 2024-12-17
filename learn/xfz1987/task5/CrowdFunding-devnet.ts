import {
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt64,
  UInt32,
} from 'o1js';
import { getProfiler } from '../others//utils/profiler.js';
import { CatToken } from './CatToken.js';
import { CrowdFunding } from './CrowdFunding.js';
import { test1, test2 } from './private.js';
import { getCurrentBlockHeight } from './utils.js';

const CrowdProfiler = getProfiler('Crowd-Funding zkApp');
CrowdProfiler.start('Crowd-Funding zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

// 部署人
const deployerKey = PrivateKey.fromBase58(test1);
const deployer = deployerKey.toPublicKey();

// 购买人
const buyerKey = PrivateKey.fromBase58(test2);
const buyer = buyerKey.toPublicKey();

console.log(`Fetching the fee payer account information.`);
const deployerAcct = await fetchAccount({ publicKey: deployer });
const accountDetails = deployerAcct.account;
console.log(
  `Using the fee payer account ${deployer.toBase58()} with nonce: ${
    accountDetails?.nonce
  } and balance: ${accountDetails?.balance}.`
);

// 编译合约
console.log('CrowdFunding complie...');
await CrowdFunding.compile();
console.log('token complie...');
await CatToken.compile();

const fee = 1e8;

// 创建 token
const tokenOwnerKey = PrivateKey.random();
const tokenOwnerAddress = tokenOwnerKey.toPublicKey();
const token = new CatToken(tokenOwnerAddress);
const tokenId = token.deriveTokenId();

// 创建合约账户
const crowdFundingKey = PrivateKey.random();
const crowdFundingAddress = crowdFundingKey.toPublicKey();
const crowdFunding = new CrowdFunding(crowdFundingAddress, tokenId);

// 合约地址
console.log(`合约地址: ${crowdFundingAddress.toBase58()}`);
console.log(`token地址: ${tokenOwnerAddress.toBase58()}`);
console.log(`tokenId: ${tokenId}`);

// 部署 token
console.log('deploy token...');
let txn = await Mina.transaction(
  {
    sender: deployer,
    fee,
    memo: 'cat token deploy',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer, 2); // 需要支付 2 MINA，开了2个Account
    await token.deploy(); // 底层调用了 token的 init
  }
);
await txn.prove();
await txn.sign([tokenOwnerKey, deployerKey]).send().wait();

// 部署合约
const currentHeight = await getCurrentBlockHeight();
console.log('当前区块高度:', currentHeight);
console.log('deploy zkapp...');
txn = await Mina.transaction(
  {
    sender: deployer,
    fee: 1 * 1e9,
    memo: 'crowdFunding deploy',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer);
    await crowdFunding.deploy({
      endTime: UInt32.from(currentHeight + 50),
      hardCap: UInt64.from(100 * 1e9),
      pricePerToken: UInt64.from(2 * 1e9), // 2 MINA/token
    });
    await token.approveAccountUpdate(crowdFunding.self);
  }
);
await txn.prove();
await txn.sign([crowdFundingKey, deployerKey]).send().wait();

console.log('transfer token...');
const transferAmt = new UInt64(100);
txn = await Mina.transaction(
  {
    sender: deployer,
    fee: 1 * 1e9,
    memo: 'transfer token',
  },
  async () => {
    await token.transfer(tokenOwnerAddress, crowdFundingAddress, transferAmt);
  }
);
await txn.prove();
await txn.sign([tokenOwnerKey, deployerKey]).send().wait();

console.log(
  `zkapp current token: ${Mina.getBalance(
    crowdFundingAddress,
    tokenId
  ).toString()}`
);
console.log('buy tokens....');
const amountToBuy = UInt64.from(50 * 1e9); // 购买 50 MINA 的代币
const tx = await Mina.transaction(
  {
    sender: buyer,
    fee: 1 * 1e9,
    memo: 'buy token',
  },
  async () => {
    AccountUpdate.fundNewAccount(buyer, 1);
    await crowdFunding.buyTokens(amountToBuy);
    await token.approveAccountUpdate(crowdFunding.self);
  }
);
await tx.prove();
await tx.sign([buyerKey, crowdFundingKey]).send().wait();
console.log(
  `final balance: ${Mina.getBalance(crowdFundingAddress, tokenId).toString()}`
);
console.log(
  `final balance of buyer: ${Mina.getBalance(buyer, tokenId).toString()}`
);

CrowdProfiler.stop().store();
