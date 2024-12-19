import {  Mina, AccountUpdate, PrivateKey, Bool, Field, Poseidon, MerkleMap, Signature, UInt32, UInt64} from 'o1js';
import { Funding } from './Add.js';

const useProof = false;

  // Setup Mina local blockchain
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

//deploy the contract 
const zkAppPrivateKey = PrivateKey.random(); //this is the owner of the contract 
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// const zkAppAddress = Local.testAccounts[2];
// const zkAppPrivateKey = zkAppAddress.key;

const zkAppInstance = new Funding(zkAppAddress);


const currentBlock = Local.getNetworkState().blockchainLength;
const deadline = UInt64.from(currentBlock.add(10)); // 当前块高度 + 10
const beneficiary = PrivateKey.random().toPublicKey();
const hardCap = UInt64.from(100 * 1e9); // 100 MINA

const deployerBalance = Mina.getBalance(deployerAccount);
console.log(`Deployer balance: ${deployerBalance.div(UInt64.from(1e9)).toString()} MINA`);
console.log("test env");
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
    await zkAppInstance.initFunding(hardCap, deadline, beneficiary); // Initialize with the whitelist tree root 
  });
  await deployTxn.prove();
  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

  console.log(`zkApp deployed successful!`);
  console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
  console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`); 
  console.log("当前时间: ", Local.getNetworkState().blockchainLength.toString());
  console.log("众筹截止时间: ", zkAppInstance.deadline.get().toString());
  console.log(`众筹目标金额: ${zkAppInstance.hardCap.get().div(UInt64.from(1e9)).toString()} MINA`);
  console.log("受益人: ", zkAppInstance.beneficiary.get().toString());
//众筹 + 10 
const amount = UInt64.from(10 * 1e9); // 10 MINA
const contributeTxn = await Mina.transaction({  
  sender: senderAccount, // 指定发送者
  fee: UInt64.from(0.1 * 1e9), // 手续费 0.1 MINA
}, async () => {
  await zkAppInstance.contribute(amount, senderAccount.key.toPublicKey());
});
await contributeTxn.prove();
await contributeTxn.sign([senderKey]).send();

console.log(`Contribute 10 MINA successful!`);
console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`); 

//众筹 + 90
const amount90 = UInt64.from(90 * 1e9); // 10 MINA
const contributeTxn1 = await Mina.transaction({  
  sender: senderAccount, // 指定发送者
  fee: UInt64.from(0.1 * 1e9), // 手续费 0.1 MINA
}, async () => {
  await zkAppInstance.contribute(amount90, senderAccount.key.toPublicKey());
});
await contributeTxn1.prove();
await contributeTxn1.sign([senderKey]).send();

console.log(`Contribute 90 MINA successful!`);
console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`); 

//达到 hardcap，不能再众筹
try {
const amount1 = UInt64.from(10 * 1e9); // 10 MINA
const contributeTxn2 = await Mina.transaction({  
  sender: senderAccount, // 指定发送者
  fee: UInt64.from(0.1 * 1e9), // 手续费 0.1 MINA
}, async () => {
  await zkAppInstance.contribute(amount1, senderAccount.key.toPublicKey());
});
await contributeTxn2.prove();
await contributeTxn2.sign([senderKey]).send();
} catch (error: any) {
console.log(`Contribute 1 MINA failed!`);
console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`); 
}

//未到时间提款失败
try {
  const withdrawTxn = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.withdraw(senderAccount.key.toPublicKey());
  });
  await withdrawTxn.prove();
  await withdrawTxn.sign([senderKey]).send();
} catch (error: any) {
  console.log(`Withdraw failed as expected: ${error.message}`);
  console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
  console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`); 
}
// //到时间提款成功
Local.setBlockchainLength(UInt32.from(1001));

const withdrawTxn1 = await Mina.transaction({  
  sender: senderAccount, // 指定发送者
  fee: UInt64.from(0.1 * 1e9), // 手续费 0.1 MINA
}, async () => {
  AccountUpdate.fundNewAccount(senderAccount);
  await zkAppInstance.withdraw(beneficiary);
});
await withdrawTxn1.prove();
await withdrawTxn1.sign([senderKey, zkAppPrivateKey]).send();
console.log(`Withdraw successful!`);
console.log(`当前众筹账本金额: ${zkAppInstance.totalRaised.get().div(UInt64.from(1e9)).toString()} MINA`);
console.log(`当前众筹账户余额: ${Mina.getBalance(zkAppInstance.address).div(UInt64.from(1e9)).toString()} MINA`);

const beneficiaryBalance = Mina.getBalance(beneficiary);
console.log(`受益人余额: ${beneficiaryBalance.div(UInt64.from(1e9)).toString()} MINA`);
const senderBalance = Mina.getBalance(senderAccount);
console.log(`提款人余额: ${senderBalance.div(UInt64.from(1e9)).toString()} MINA`);
