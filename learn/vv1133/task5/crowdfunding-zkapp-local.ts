import assert from 'node:assert';
import {
  Field,
  Mina,
  AccountUpdate,
  PublicKey,
  PrivateKey,
  UInt32,
  UInt64,
} from 'o1js';
import { CrowdfundingZkapp } from './crowdfunding-zkapp.js';
import { AbcTokenContract } from './token-contract.js';

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Local.setBlockchainLength(UInt32.from(1));
Mina.setActiveInstance(Local);

// a test account that pays all the fees, and puts additional funds into the zkapp
let [deployer, sender] = Local.testAccounts;

// token contract
let { publicKey: tokenAddress, privateKey: tokenKey } =
  PrivateKey.randomKeypair();
let tokenOwnerZkapp = new AbcTokenContract(tokenAddress);
let tokenId = tokenOwnerZkapp.deriveTokenId();

// deploy token contract
console.log('compile AbcTokenContract...');
await AbcTokenContract.compile();

console.log('deploy AbcTokenContract...');
let deployTx = await Mina.transaction(sender, async () => {
  AccountUpdate.fundNewAccount(sender, 2);
  await tokenOwnerZkapp.deploy();
});
await deployTx.prove();
await deployTx.sign([tokenKey, sender.key]).send();

assert(
  Mina.getAccount(tokenAddress).zkapp?.verificationKey !== undefined,
  'token contract deployed'
);

// 编译合约
await CrowdfundingZkapp.compile();

// the zkapp account
let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new CrowdfundingZkapp(zkappAccount, tokenId);

console.log('deploy CrowdfundingZkapp...');
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.1 * 10e9,
    memo: 'deploy',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
    await zkapp.deploy({
      endTime: UInt32.from(4),
      hardCap: UInt64.from(100 * 10 ** 9),
      withdrawer: deployer,
    });
    await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
  }
);
await tx.prove();
await tx.sign([deployer.key, zkappAccount.key]).send();
console.log(tx.toPretty());

console.log('deposit ...');
Local.setBlockchainLength(UInt32.from(2));

// sender 获取 abc token
console.log('sender get abc token ...');
const transferAmount = UInt64.from(10 * 10 ** 9);
tx = await Mina.transaction(sender, async () => {
  AccountUpdate.fundNewAccount(sender, 1);
  await tokenOwnerZkapp.transfer(tokenAddress, sender, transferAmount);
});
await tx.prove();
await tx.sign([tokenKey, sender.key]).send();
console.log(`token bal: ` + Mina.getBalance(sender, tokenId));

console.log('sender deposit ...');
tx = await Mina.transaction(
  { sender, fee: 0.1 * 10e9, memo: 'deposit' },
  async () => {
    AccountUpdate.fundNewAccount(sender, 1);
    await zkapp.deposit(UInt64.from(3 * 10 ** 9));
    await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
  }
);
await tx.prove();
await tx.sign([sender.key]).send();
console.log(tx.toPretty());

console.log('withdraw ...');
Local.setBlockchainLength(UInt32.from(8));

tx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * 10e9, memo: 'withdraw' },
  async () => {
    AccountUpdate.fundNewAccount(deployer, 1);
    await zkapp.withdraw();
    await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
  }
);
await tx.prove();
await tx.sign([deployer.key]).send();
console.log(tx.toPretty());
