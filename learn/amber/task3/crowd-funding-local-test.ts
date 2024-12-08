import { CrowdFunding } from './CrowdFunding.js';
import { Field, Mina, PrivateKey, AccountUpdate, UInt32, UInt64, fetchAccount } from 'o1js';

import { getProfiler } from './profiler.js';

function formatMina(amount: UInt64): string {
    return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');

const doProofs = true;
let Local = await Mina.LocalBlockchain({ 
    proofsEnabled: doProofs,
});
Mina.setActiveInstance(Local);

console.log('compile...');
await CrowdFunding.compile();

// 获取测试账户后，可以给账户充值
const [ownerAccount, investor1, investor2] = Local.testAccounts;

// 记录初始余额
console.log('\n初始余额状态:');
console.log('受益人初始余额:', formatMina(Mina.getBalance(ownerAccount)), 'MINA');
console.log('投资者1初始余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('投资者2初始余额:', formatMina(Mina.getBalance(investor2)), 'MINA');

// const ownerAccount = Local.testAccounts[1];
const ownerKey = ownerAccount.key;  
const hardCap = UInt64.from(10 * 1e9);

// create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkappAccount = zkAppPrivateKey.toPublicKey();

const zkApp = new CrowdFunding(zkappAccount);

console.log('deploy...');
const deployTxn = await Mina.transaction(ownerAccount, async () => {
    // 1 Mina fee is required to create a new account for the zkApp
    // This line means the deployer account will pay the fee for any account created in this transaction
    await zkApp.deploy({ owner: ownerKey.toPublicKey() });
    const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;
    await zkApp.initState(hardCap, currentSlot.add(100));
  });
  await deployTxn.prove();
  await deployTxn.sign([ownerKey, zkAppPrivateKey]).send();

  const initHardCap  = await zkApp.hardCap.getAndRequireEquals();
  const initDeadline = await zkApp.deadline.getAndRequireEquals();
  //const initOwner    = await zkApp.owner.get().toBase58();
  let account = Mina.getAccount(zkappAccount);
  console.log(JSON.stringify(account));
  console.log('--------------------------------');
  console.log('state after init:hardCap', initHardCap.toString());
  console.log('state after init:deadline', initDeadline.toString());
  //console.log('state after init:owner', initOwner);
  console.log('balance after init:', await zkApp.account.balance.get());
  console.log('--------------------------------');

  // const investor1 = Local.testAccounts[2];
  // const investor2 = Local.testAccounts[3];

  const amount = UInt64.from(1 * 1e9);
  console.log('state after init：', await zkApp.account.provedState.getAndRequireEquals());
  console.log('未达到目标金额，且众筹未结束，investor1 contribute...');
  await fetchAccount({ publicKey: zkappAccount });
  await fetchAccount({ publicKey: investor1 });
  
//   await fetchAccount({publicKey: zkappAccount});
//   await fetchAccount({publicKey: investor1});
//   await fetchAccount({publicKey: investor2});
  const tx = await Mina.transaction({
        sender: investor1,
        fee: 0.1 * 1e9,
        memo: '投资'
    }, async () => {
        await zkApp.contribute(amount);
    });
    await tx.prove();
    await tx.sign([investor1.key]).send().wait();

    console.log('众筹金额：', await zkApp.account.balance.get());  
    console.log('--------------------------------');

    console.log('未达到目标金额，且众筹未结束时提现...');

    const tx2 = await Mina.transaction({
           sender: ownerAccount,
          fee: 0.1 * 1e9,
          memo: '提现'
      }, async () => {
        try {
            await zkApp.withdraw();
        } catch (error) {
            console.log('提现失败，因为众筹还未结束！');
        }
      });
      await tx.prove();
      await tx2.sign([ownerKey]).send();

      console.log('--------------------------------');
      console.log('未达到目标金额，且众筹未结束，investor2 contribute超过目标金额...');
      console.log('超出部分：', (await zkApp.account.balance.get()).toString());


      const tx3 = await Mina.transaction({
            sender: investor2,
          fee: 0.1 * 1e9,
          memo: '投资'
      }, async () => {
          await zkApp.contribute(hardCap);
      });
      await tx3.prove();
      await tx3.sign([investor2.key]).send();
      console.log('投资金额：', hardCap.toString());
      console.log('众筹金额：', await zkApp.account.balance.get());
      console.log('--------------------------------');

      console.log('众筹达到目标金额，继续投资...');
      const tx4 = await Mina.transaction({
           sender : investor1,
          fee: 0.1 * 1e9,
          memo: '投资'
      }, async () => {
        try {
          await zkApp.contribute(amount);
        } catch (error) {
            console.log('众筹达上限，无法继续投资！');
        }
      });
      await tx3.prove();
      await tx3.sign([investor1.key]).send();

      console.log('众筹金额：', await zkApp.account.balance.get());
      console.log('--------------------------------');

      console.log('众筹达到目标金额，且众筹结束时继续投资...');
      // 设置区块链长度，模拟众筹结束
      Local.setBlockchainLength(UInt32.from(101));
      const tx5 = await Mina.transaction({
          sender  : investor1,
          fee: 0.1 * 1e9,
          memo: '投资'
      }, async () => {
        try {
          await zkApp.contribute(amount);
        } catch (error) {
            console.log('众筹已结束，无法继续投资！');
        }
      });
      await tx3.prove();
      await tx3.sign([investor1.key]).send();

      console.log('--------------------------------');
      console.log('众筹达到目标金额，且众筹结束时提现...');
      console.log('提现金额：', await zkApp.account.balance.get());

      const tx6 = await Mina.transaction({
          sender: ownerAccount,
          fee: 0.1 * 1e9,
          memo: '提现'
      }, async () => {
        await zkApp.withdraw();
      });   
      await tx6.prove();
      await tx6.sign([ownerKey]).send();
      console.log('合约账户余额：', await zkApp.account.balance.get());
      console.log('--------------------------------');
