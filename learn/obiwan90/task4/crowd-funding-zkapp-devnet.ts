import {
    PrivateKey,
    Mina,
    AccountUpdate,
    UInt64,
    UInt32,
    fetchAccount
} from 'o1js';
import { getProfiler } from './utils/profiler.js';
import { CrowdfundingContract } from './crowd-funding-zkapp.js';

const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');

// Network configuration
const network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

// 辅助函数：格式化 MINA 金额
function formatMina(amount: UInt64): string {
    return (Number(amount) / 1e9).toString();
}

// sender  
const senderKey = PrivateKey.fromBase58('EKFayk52DivU6tMCFBCLPs9dNNQ1KKiqXAhzJ8zYnZn6kY6o63R1');
const sender = senderKey.toPublicKey();

console.log('获取付款账户信息...');
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(`使用付款账户 ${sender.toBase58()} nonce: ${accountDetails?.nonce} 余额: ${accountDetails?.balance}`);

// 编译合约
console.log('编译合约...');
await CrowdfundingContract.compile();

// 创建众筹合约账户
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdfundingContract(zkappAccount);

// 打印合约地址
console.log('合约地址:', zkappAccount.toBase58());
console.log('合约私钥:', zkappKey.toBase58());

// 打印事件
function printEvents(events: any[]) {
    console.log('\n事件总数:', events.length);
    events.forEach((e, index) => {
        if (e.type === 'amount') {
            console.log(`事件 #${index + 1}:`);
            const type = e.event.data.type.toString() === '1' ? '投资' : '提现';
            const amount = formatMina(e.event.data.amount);
            console.log(`- 类型: ${type}`);
            console.log(`- 金额: ${amount} MINA`);
        }
    });
}

// 获取当前区块高度

async function getCurrentBlockHeight(): Promise<number> {
    try {
        const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query {
                        bestChain(maxLength: 1) {
                            protocolState {
                                consensusState {
                                    blockHeight
                                }
                            }
                        }
                    }
                `
            }),
        });
        const data = await response.json();
        if (!data.data?.bestChain?.[0]?.protocolState?.consensusState?.blockHeight) {
            throw new Error('无法获取区块高度');
        }
        return parseInt(data.data.bestChain[0].protocolState.consensusState.blockHeight);
    } catch (error) {
        console.error('获取区块高度失败:', error);
        throw error;
    }
}

console.log('部署合约...');
const currentBlockHeight = await getCurrentBlockHeight();
// const endBlockHeight = UInt32.from(currentBlockHeight + 1000);
//使用时间触发硬顶 3区块 大约9分钟
const endBlockHeight = UInt32.from(currentBlockHeight + 2);
console.log('当前区块高度:', currentBlockHeight);
console.log('计划结束区块高度:', endBlockHeight.toString());
let tx = await Mina.transaction({
    sender,
    fee: 0.5 * 1e9,
    memo: '众筹合约部署',
}, async () => {
    AccountUpdate.fundNewAccount(sender);
    await zkapp.deploy({
        verificationKey: undefined,
        beneficiary: sender,
        hardCap: UInt64.from(10 * 1e9),
        endTime: endBlockHeight
    });
});
await tx.prove();
let txn = await tx.sign([senderKey, zkappKey]).send();
await txn.wait();

// 检查初始状态和事件
await fetchAccount({ publicKey: zkappAccount });
console.log('受益人地址:', zkapp.beneficiary.get().toBase58());
console.log('募资上限:', formatMina(zkapp.hardCap.get()), 'MINA');
console.log('结束时间:', zkapp.endTime.get().toString(), '区块高度');

// 投资
console.log('\n投资 2 MINA...');
tx = await Mina.transaction({
    sender,
    fee: 0.3 * 1e9,
    memo: '投资',
}, async () => {
    await zkapp.contribute(UInt64.from(2 * 1e9));
});
await tx.prove();
txn = await tx.sign([senderKey]).send();
await txn.wait();

// 验证投资结果
await fetchAccount({ publicKey: zkappAccount });
const balanceAfterInvest = Mina.getBalance(zkappAccount);
console.log('投资后合约余额:', formatMina(balanceAfterInvest), 'MINA');
if (balanceAfterInvest.equals(UInt64.from(2e9))) {
    console.log('✅ 投资成功');
} else {
    console.log('❌ 投资金额不正确');
}

// 检查投资事件
const investEvents = await zkapp.fetchEvents();
console.log('\n投资事件:');
printEvents(investEvents);

// 等待众筹结束
console.log('\n等待众筹结束...');
const endTime = zkapp.endTime.get();
const hardCap = zkapp.hardCap.get();

while (true) {
    try {
        // 检查是否达到硬顶
        await fetchAccount({ publicKey: zkappAccount });
        const currentBalance = Mina.getBalance(zkappAccount);

        // 打印详细状态
        console.log('\n当前众筹状态:');
        console.log(`当前募集: ${formatMina(currentBalance)} / ${formatMina(hardCap)} MINA`);
        console.log(`完成度: ${(Number(currentBalance) / Number(hardCap) * 100).toFixed(2)}%`);

        // 检查是否达到硬顶
        const isHardCapReached = Number(currentBalance) >= Number(hardCap);

        if (isHardCapReached) {
            console.log('已达到硬顶，开始提现...');
            break;
        }

        // 检查是否超时
        const currentBlockHeight = await getCurrentBlockHeight();
        if (currentBlockHeight >= Number(endTime)) {
            console.log('众筹时间已到，开始提现...');
            break;
        }

        console.log(`距离结束还需 ${Number(endTime) - currentBlockHeight} 个区块`);

        // 等待一段时间再检查
        await new Promise(resolve => setTimeout(resolve, 180000)); // 等待3分钟
    } catch (error) {
        console.error('检查状态时出错:', error);
        await new Promise(resolve => setTimeout(resolve, 60000)); // 等待1分钟
    }
}

// 提现
console.log('\n执行提现...');
tx = await Mina.transaction({
    sender,
    fee: 0.3 * 1e9,
    memo: '提现',
}, async () => {
    await zkapp.withdraw();
});
await tx.prove();
txn = await tx.sign([senderKey]).send();
await txn.wait();

// 验证提现结果
await fetchAccount({ publicKey: zkappAccount });
const balanceAfterWithdraw = Mina.getBalance(zkappAccount);
console.log('提现后合约余额:', formatMina(balanceAfterWithdraw), 'MINA');
if (balanceAfterWithdraw.equals(UInt64.from(0))) {
    console.log('✅ 提现成功');
} else {
    console.log('❌ 合约余额未清零');
}

// 检查受益人账户的 timing 设置
await fetchAccount({ publicKey: sender });
const beneficiaryAccount = Mina.getAccount(sender);
console.log('\n受益人账户 timing 设置:');
console.log({
    initialMinimumBalance: beneficiaryAccount.timing.initialMinimumBalance?.toString(),
    cliffTime: beneficiaryAccount.timing.cliffTime?.toString(),
    cliffAmount: beneficiaryAccount.timing.cliffAmount?.toString(),
    vestingPeriod: beneficiaryAccount.timing.vestingPeriod?.toString(),
    vestingIncrement: beneficiaryAccount.timing.vestingIncrement?.toString()
});

// 检查所有事件
console.log('\n所有事件:');
const allEvents = await zkapp.fetchEvents();
printEvents(allEvents);

// 验证初始可用金额（20%）
console.log('\n等待6分钟验证资金释放...');
await new Promise(resolve => setTimeout(resolve, 360000)); // 等待6分钟

// 尝试转出30%（应该失败，因为只有20%可用）
console.log('\n尝试转出30%资金...');
tx = await Mina.transaction({
    sender,
    fee: 0.3 * 1e9,
}, async () => {
    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({
        to: zkappAccount, // 可以转给任何地址
        amount: UInt64.from(0.6 * 1e9) // 尝试转出0.6 MINA (30%)
    });
});
try {
    await tx.prove();
    await tx.sign([senderKey]).send();
    console.log('❌ 错误：不应该能转出超过已释放的金额');
} catch (error) {
    console.log('✅ 正确：无法转出超过已释放的金额');
}

// 等待2个区块后（应该可以使用额外10%）
console.log('\n等待一个释放周期（2个区块）...');
await new Promise(resolve => setTimeout(resolve, 360000)); // 再等待6分钟

// 现在尝试转出30%（应该成功，因为已释放30%）
console.log('\n再次尝试转出30%资金...');
tx = await Mina.transaction({
    sender,
    fee: 0.3 * 1e9,
}, async () => {
    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({
        to: zkappAccount,
        amount: UInt64.from(0.6 * 1e9)
    });
});
await tx.prove();
await tx.sign([senderKey]).send();
console.log('✅ 成功：可以转出已释放的金额');

CrowdfundingProfiler.stop().store();