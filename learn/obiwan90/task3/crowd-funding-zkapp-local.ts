import {
    Field,
    Mina,
    AccountUpdate,
    UInt64,
    UInt32,
    Bool,
    PrivateKey
} from 'o1js';
import { getProfiler } from './utils/profiler.js';
import { CrowdfundingContract } from "./crowd-funding-zkapp.js";

const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');

// 设置本地区块链
const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// 编译合约
if (doProofs) {
    await CrowdfundingContract.compile();
} else {
    await CrowdfundingContract.analyzeMethods();
}

function formatMina(amount: UInt64): string {
    return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

// 获取测试账户
let [deployer, beneficiary, investor1, investor2] = Local.testAccounts;

// 记录初始余额
console.log('\n初始余额状态:');
console.log('受益人初始余额:', formatMina(Mina.getBalance(beneficiary)), 'MINA');
console.log('投资者1初始余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('投资者2初始余额:', formatMina(Mina.getBalance(investor2)), 'MINA');

// 创建众筹合约账户
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdfundingContract(zkappAccount);

// 获取当前区块高度
const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('部署合约...');
let tx = await Mina.transaction({
    sender: deployer,
    fee: 0.1 * 1e9,
    memo: '众筹合约',
}, async () => {
    AccountUpdate.fundNewAccount(deployer);
    await zkapp.deploy({
        verificationKey: undefined,
        beneficiary: beneficiary,
        hardCap: UInt64.from(10 * 1e9), // 硬顶：10 MINA
        endTime: UInt32.from(currentSlot.add(100)) // 结束时间：当前时间 + 100个区块
    });
});
await tx.prove();
await tx.sign([deployer.key, zkappKey]).send();

// 检查初始状态
console.log('检查初始状态...');
let beneficiaryState = zkapp.beneficiary.get();
let hardCapState = zkapp.hardCap.get();
let endTimeState = zkapp.endTime.get();
console.log('受益人地址:', beneficiaryState.toBase58());
console.log('募资上限:', hardCapState.div(1e9).toString(), 'MINA');
console.log('结束时间:', endTimeState.toString(), '区块高度');

// 打印事件
function printEvents(events: any[]) {
    console.log('\n事件总数:', events.length);
    // 处理投资事件
    const contributionEvents = events.filter(e => e.type === 'contribution');
    if (contributionEvents.length > 0) {
        console.log('\n投资事件类型:', contributionEvents[0].type);
        contributionEvents.forEach((e, index) => {
            console.log(`事件 #${index + 1}:`);
            console.log('- 投资人:', e.event.data.from.toBase58());
            console.log('- 投资金额:', formatMina(e.event.data.contributed), 'MINA');
            console.log('- 退款金额:', formatMina(e.event.data.refunded), 'MINA');
        });
    }

    // 处理提现事件
    const withdrawalEvents = events.filter(e => e.type === 'withdrawal');
    if (withdrawalEvents.length > 0) {
        console.log('\n提现事件类型:', withdrawalEvents[0].type);
        withdrawalEvents.forEach((e, index) => {
            console.log(`事件 #${index + 1}:`);
            console.log('- 提现金额:', formatMina(e.event.data.amount), 'MINA');
        });
    }
}

// 投资者1投资
console.log('\n投资者1投资 2 MINA...');
tx = await Mina.transaction({
    sender: investor1,
    fee: 0.1 * 1e9,
    memo: '投资者1投资'
}, async () => {
    await zkapp.contribute(UInt64.from(2 * 1e9));
});
await tx.prove();
await tx.sign([investor1.key]).send().wait(); // 添加 .wait()

// 检查投资1的事件
// let events = await zkapp.fetchEvents();
// printEvents(events);

console.log('\n投资者2投资 3 MINA...');
tx = await Mina.transaction({
    sender: investor2,
    fee: 0.1 * 1e9,
    memo: '投资者2投资'
}, async () => {
    await zkapp.contribute(UInt64.from(3 * 1e9));
});
await tx.prove();
await tx.sign([investor2.key]).send().wait();

// 检查投资2后的状态
let account = Mina.getAccount(zkappAccount);
// console.log('投资2后合约余额:', formatMina(account.balance), 'MINA');
// events = await zkapp.fetchEvents();
// printEvents(events);


console.log('\n投资者2尝试超额投资 8 MINA...');
tx = await Mina.transaction({
    sender: investor2,
    fee: 0.1 * 1e9,
    memo: '投资者2尝试超额投资'
}, async () => {
    await zkapp.contribute(UInt64.from(8 * 1e9));
});
await tx.prove();
await tx.sign([investor2.key]).send().wait();

// 检查超额投资后的状态
account = Mina.getAccount(zkappAccount);
// events = await zkapp.fetchEvents();
// printEvents(events);
console.log('超额投资后合约余额:', formatMina(account.balance), 'MINA');

// 模拟时间流逝
console.log('\n等待众筹结束...');
Local.incrementGlobalSlot(101);
console.log('当前区块高度:', Local.getNetworkState().globalSlotSinceGenesis.toString());

// 提现前检查余额
console.log('\n提现前状态:');
const beforeWithdrawBalance = Mina.getBalance(beneficiary);
console.log('受益人当前余额:', formatMina(beforeWithdrawBalance), 'MINA');
console.log('合约余额:', formatMina(Mina.getBalance(zkappAccount)), 'MINA');
console.log('投资者1余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('投资者2余额:', formatMina(Mina.getBalance(investor2)), 'MINA');
console.log('\n受益人提现...');
tx = await Mina.transaction({
    sender: beneficiary,
    fee: 0.1 * 1e9,
    memo: '受益人提现'
}, async () => {
    await zkapp.withdraw();
});
await tx.prove();
await tx.sign([beneficiary.key]).send().wait();

console.log('\n提现后的所有事件:');
let events = await zkapp.fetchEvents();
printEvents(events);

// 检查最终状态
console.log('\n最终状态:');
const afterWithdrawBalance = Mina.getBalance(beneficiary);
console.log('受益人最终余额:', formatMina(afterWithdrawBalance), 'MINA');
console.log('实际获得金额（减去手续费）:',
    formatMina(afterWithdrawBalance.sub(beforeWithdrawBalance)),
    'MINA'
);
// const event = await fetchEvents({publicKey: zkappAccount.toBase58()});
CrowdfundingProfiler.stop().store();