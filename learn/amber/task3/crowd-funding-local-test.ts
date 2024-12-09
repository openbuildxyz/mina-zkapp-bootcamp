import { CrowdFunding } from './CrowdFunding.js';
import { Field, Mina, PrivateKey, AccountUpdate, UInt32, UInt64, fetchAccount } from 'o1js';

import { getProfiler } from './profiler.js';
import { currentSlot } from 'o1js/dist/node/lib/mina/mina.js';

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
let tx = await Mina.transaction(ownerAccount, async () => {
    // 1 Mina fee is required to create a new account for the zkApp
    // This line means the deployer account will pay the fee for any account created in this transaction
    AccountUpdate.fundNewAccount(ownerAccount);
    await zkApp.deploy({ verificationKey: undefined, owner: ownerKey.toPublicKey() });
  });
  await tx.prove();
  await tx.sign([ownerKey, zkAppPrivateKey]).send();

  console.log('==========初始化合约==========');
  tx = await Mina.transaction({
    sender: ownerAccount,
    fee: 0.1 * 1e9,
    memo: '初始化'
    }, async () => {
    const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;
    await zkApp.initState(hardCap, currentSlot.add(100));
  });
  await tx.prove();
  await tx.sign([ownerAccount.key]).send().wait();

  const initHardCap  = await zkApp.hardCap.getAndRequireEquals();
  const initDeadline = await zkApp.deadline.getAndRequireEquals();
  const owner = zkApp.owner.get();
  //const initOwner    = await zkApp.owner.get().toBase58();
  let account = Mina.getAccount(zkappAccount);
  console.log(JSON.stringify(account));
  console.log('--------------------------------');
  console.log('state after init:hardCap', initHardCap.toString());
  console.log('state after init:deadline', initDeadline.toString());
  console.log('state after init:owner', owner.toBase58());   
  console.log('balance after init:', formatMina(await zkApp.account.balance.get()));
  console.log('--------------------------------');

  // const investor1 = Local.testAccounts[2];
  // const investor2 = Local.testAccounts[3];

  const amount = UInt64.from(1 * 1e9);
  console.log('state after init：', Boolean(zkApp.account.provedState.getAndRequireEquals()));
  console.log('未达到目标金额，且众筹未结束，investor1 contribute...');

 tx = await Mina.transaction({
        sender: investor1,
        fee: 0.1 * 1e9,
        memo: '投资'
    }, async () => {
        await zkApp.contribute(UInt64.from(2 * 1e9));
    });
    await tx.prove();
    await tx.sign([investor1.key]).send().wait();

    console.log('合约账户余额：', formatMina(Mina.getBalance(zkappAccount)), 'MINA'); 
    console.log('--------------------------------');

    console.log('未达到目标金额，且众筹未结束时提现...');

    tx = await Mina.transaction({
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
      await tx.sign([ownerKey]).send();

      console.log('--------------------------------');
      console.log('未达到目标金额，且众筹未结束，investor2 contribute超过目标金额...');
      console.log('投资前invest账户余额:', formatMina(Mina.getBalance(investor2)));
      console.log('投资金额：', formatMina(hardCap));
      const beforeInvest = Number(Mina.getBalance(investor2).toBigInt()) / 1e9;

      tx = await Mina.transaction({
            sender: investor2,
          fee: 0.1 * 1e9,
          memo: '投资'
      }, async () => {
          await zkApp.contribute(hardCap);
      });
      await tx.prove();
      await tx.sign([investor2.key]).send();
      console.log('投资金额：', formatMina(hardCap), 'MINA');
      console.log('投资后invest账户余额:', formatMina(Mina.getBalance(investor2)), 'MINA');
      console.log('实际投资金额：', formatMina(Mina.getBalance(investor2).sub(beforeInvest)), 'MINA');
      console.log('合约账户余额：', formatMina(Mina.getBalance(zkappAccount)), 'MINA');
      console.log('--------------------------------');

      console.log('众筹达到目标金额，继续投资...');
      tx = await Mina.transaction({
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
      await tx.prove();
      await tx.sign([investor1.key]).send();

      console.log('合约账户余额：', formatMina(Mina.getBalance(zkappAccount)), 'MINA');
      console.log('--------------------------------');

      console.log('众筹达到目标金额，且众筹结束时继续投资...');
      // 设置区块链长度，模拟众筹结束
      Local.setBlockchainLength(UInt32.from(101));
     tx = await Mina.transaction({
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
      await tx.prove();
      await tx.sign([investor1.key]).send();

      console.log('--------------------------------');
      console.log('众筹达到目标金额，且众筹结束时提现...');
      console.log('合约账户余额：', formatMina(Mina.getBalance(zkappAccount)), 'MINA');
      console.log('提现前受益人账户余额：', formatMina(Mina.getBalance(ownerAccount)), 'MINA');

    tx = await Mina.transaction({
          sender: ownerAccount,
          fee: 0.1 * 1e9,
          memo: '提现'
      }, async () => {
        await zkApp.withdraw();
      });   
      await tx.prove();
      await tx.sign([ownerKey]).send();
      console.log('合约账户余额：', formatMina(Mina.getBalance(zkappAccount)), 'MINA');
      console.log('提现后受益人账户余额：', formatMina(Mina.getBalance(ownerAccount)), 'MINA');
      console.log('--------------------------------');
