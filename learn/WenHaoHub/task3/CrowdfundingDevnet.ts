import {
  PrivateKey,
  Mina,
  AccountUpdate,
  UInt64,
  UInt32,
  fetchAccount,
} from 'o1js';
import { getProfiler } from './profiler.js';
import { CrowdFundingZkapp } from './Crowdfunding.js';

const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

// 辅助函数：格式化 MINA 金额
function formatMina(amount: UInt64): string {
  return (Number(amount) / 1e9).toString();
}

// sender
const senderKey = PrivateKey.fromBase58('EKErEGrh5sisJaLEbApyvYcyGHzerEE9LR7TGr3gsujzZbC1tQxi');
const sender = senderKey.toPublicKey();

console.log('获取付款账户信息...');
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(
  `使用付款账户 ${sender.toBase58()} nonce: ${accountDetails?.nonce} 余额: ${
    accountDetails?.balance
  }`
);

// 编译合约
console.log('编译合约...');
await CrowdFundingZkapp.compile();

// 创建众筹合约账户
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdFundingZkapp(zkappAccount);

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

// 设置结束时间（当前时间 + 100个区块）

async function getCurrentBlockHeight(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.minascan.io/node/devnet/v1/graphql',
      {
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
              `,
        }),
      }
    );
    const data = await response.json();
    if (
      !data.data?.bestChain?.[0]?.protocolState?.consensusState?.blockHeight
    ) {
      throw new Error('无法获取区块高度');
    }
    return parseInt(
      data.data.bestChain[0].protocolState.consensusState.blockHeight
    );
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
let tx = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 1e9,
    memo: '众筹合约部署',
  },
  async () => {
    AccountUpdate.fundNewAccount(sender);
    await zkapp.deploy({
      beneficiary: sender, // 受益人（部署账户就是被投资人）
      endTime: endBlockHeight,
      targetAmount: UInt64.from(10 * 1e9), // 10 MINA
    });
  }
);
await tx.prove();
let txn = await tx.sign([senderKey, zkappKey]).send();
await txn.wait();

// 检查初始状态和事件
await fetchAccount({ publicKey: zkappAccount });
console.log('受益人地址:', zkapp.beneficiary.get().toBase58());
console.log('当前区块高度:', formatMina(zkapp.targetAmount.get()), 'MINA');
console.log('结束时间:', zkapp.endTime.get().toString(), '区块高度');

// 投资
console.log('\n投资 2 MINA...');
tx = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 1e9,
    memo: '投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(2 * 1e9));
  }
);
await tx.prove();
txn = await tx.sign([senderKey]).send();
await txn.wait();

// 等待众筹结束
console.log('\n等待众筹结束...');
const endTime = zkapp.endTime.get();
const hardCap = zkapp.targetAmount.get();

while (true) {
  try {
    // 检查是否达到硬顶
    await fetchAccount({ publicKey: zkappAccount });
    const currentBalance = Mina.getBalance(zkappAccount);

    // 打印详细状态
    console.log('\n当前众筹状态:');
    console.log(
      `当前募集: ${formatMina(currentBalance)} / ${formatMina(hardCap)} MINA`
    );
    console.log(
      `完成度: ${((Number(currentBalance) / Number(hardCap)) * 100).toFixed(
        2
      )}%`
    );

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
    await new Promise((resolve) => setTimeout(resolve, 180000)); // 等待3分钟
  } catch (error) {
    console.error('检查状态时出错:', error);
    await new Promise((resolve) => setTimeout(resolve, 60000)); // 等待1分钟
  }
}

// 提现
console.log('\n执行提现...');
tx = await Mina.transaction(
  {
    sender,
    fee: 0.1 * 1e9,
    memo: '提现',
  },
  async () => {
    await zkapp.withdraw();
  }
);
await tx.prove();
txn = await tx.sign([senderKey]).send();
await txn.wait();

// 检查提现事件
console.log('\n检查提现事件:');
let events = await zkapp.fetchEvents();
printEvents(events);

// 检查最终状态
await fetchAccount({ publicKey: zkappAccount });
console.log(
  '\n提现后合约余额:',
  formatMina(Mina.getBalance(zkappAccount)),
  'MINA'
);

CrowdfundingProfiler.stop().store();
