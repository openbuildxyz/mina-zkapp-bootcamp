import { Mina, AccountUpdate, UInt64, PrivateKey, UInt32 } from 'o1js';
import { getProfiler } from './profiler.js';
import { CrowdFundingZkapp } from './Crowdfunding.js';

const CrowdProfiler = getProfiler('Crowd-Funding zkApp');
CrowdProfiler.start('Crowd-Funding zkApp test flow');

// 创建本地测试环境
const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// 编译合约
if (doProofs) {
  await CrowdFundingZkapp.compile();
} else {
  await CrowdFundingZkapp.analyzeMethods();
}

// 获取测试账户
let [deployer, beneficiary, investor1, investor2] = Local.testAccounts;

function formatMina(amount: UInt64): string {
  return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

// 记录各个账户余额
console.log('\n初始余额状态:');
console.log(
  '受益人初始余额:',
  formatMina(Mina.getBalance(beneficiary)),
  'MINA'
);
console.log('投资者1初始余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('投资者2初始余额:', formatMina(Mina.getBalance(investor2)), 'MINA');

// 创建众筹合约账户
let zkappKey = PrivateKey.random(); // 创建私钥
let zkappAccount = zkappKey.toPublicKey(); // 生成公钥
let zkapp = new CrowdFundingZkapp(zkappAccount); // 创建zkApp实例

// 获取当前区块高度
const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('deploy');
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.1 * 10e9,
    memo: '众筹合约部署',
  },
  async () => {
    // 为众筹合约账户创建账户
    AccountUpdate.fundNewAccount(deployer);
    // 部署众筹合约
    await zkapp.deploy({
      beneficiary: beneficiary, // 受益人
      targetAmount: UInt64.from(100 * 1e9), // 100 MINA
      endTime: UInt32.from(currentSlot.add(100)), // 当前区块高度加100  众筹就结束
    });
  }
);
await tx.prove();
// 签名并发送交易（私钥签名）
await tx.sign([deployer.key, zkappKey]).send().wait();

console.log('众筹结束区块高度: ' + zkapp.endTime.get().toString());
console.log('受益人地址: ' + zkapp.beneficiary.get().toBase58());
console.log('目标金额: ' + formatMina(zkapp.targetAmount.get()), 'MINA');
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');


console.log('\n投资人1 - 投资 5 MINA...');
// tx = await Mina.transaction(investor1, async () => {
tx = await Mina.transaction(
  {
    sender: investor1,
    fee: 0.1 * 10e9,
    memo: '投资人1投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(5 * 1e9)); // 5_000_000_000
  }
);
await tx.prove();
await tx
  .sign([investor1.key])
  .send()
  .wait()
  .then(() => {
    console.log('tx success');
  })
  .catch((e: any) => {
    console.log('tx error', e);
  });

console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '投资者1后账户余额:',
  formatMina(Mina.getBalance(investor1)),
  'MINA'
);

console.log('--------------------------------');

console.log('\n投资人2 - 投资 10 MINA...');
tx = await Mina.transaction(
  {
    sender: investor2,
    fee: 0.1 * 10e9,
    memo: '投资人2投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(10 * 1e9));
  }
);
await tx.prove();
await tx
  .sign([investor2.key])
  .send()
  .wait()
  .then(() => {
    console.log('tx success');
  })
  .catch((e: any) => {
    console.log('tx error', e);
  });

console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '投资者2后账户余额:',
  formatMina(Mina.getBalance(investor2)),
  'MINA'
);

console.log('--------------------------------');
console.log('\n投资人1 - 再投 8 MINA...');
tx = await Mina.transaction(
  {
    sender: investor1,
    fee: 0.1 * 10e9,
    memo: '投资人1投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(8 * 1e9));
  }
);
await tx.prove();
await tx
  .sign([investor1.key])
  .send()
  .wait()
  .then(() => {
    console.log('tx success');
  })
  .catch((e: any) => {
    console.log('tx error', e);
  });
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '投资者1后账户余额:',
  formatMina(Mina.getBalance(investor1)),
  'MINA'
);

console.log('--------------------------------');

console.log('\n投资人2 - 投资 0 MINA...');
try {
  tx = await Mina.transaction(
    {
      sender: investor2,
      fee: 0.1 * 10e9,
      memo: '投资人2投资',
    },
    async () => {
      await zkapp.invest(UInt64.zero);
    }
  );
  await tx.prove();
  await tx
    .sign([investor2.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e.message);
    });
} catch (e: any) {
  console.log(e.message);
}
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '投资者2后账户余额:',
  formatMina(Mina.getBalance(investor2)),
  'MINA'
);

console.log('--------------------------------');

console.log('\n投资人2 - 投资超过目前总金额，投 80 MINA...');
try {
  tx = await Mina.transaction(
    {
      sender: investor2,
      fee: 0.1 * 10e9,
      memo: '投资人2投资',
    },
    async () => {
      await zkapp.invest(UInt64.from(80 * 1e9));
    }
  );
  await tx.prove();
  await tx
    .sign([investor2.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e.message);
    });
} catch (e: any) {
  console.log(e.message);
}
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '投资者2后账户余额:',
  formatMina(Mina.getBalance(investor2)),
  'MINA'
);

console.log('--------------------------------');

console.log('\n受益人 - 在时间结束前提取资金...');
try {
  tx = await Mina.transaction(
    {
      sender: beneficiary,
      fee: 0.1 * 10e9,
      memo: '受益人提取资金',
    },
    async () => {
      await zkapp.withdraw();
    }
  );
  await tx.prove();
  await tx
    .sign([beneficiary.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e.message);
    });
} catch (e: any) {
  console.log(e.message);
}

console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(beneficiary)), 'MINA');

console.log('--------------------------------');

console.log('\n设置区块高度超过100，模拟到了可提现高度...');
// 模拟时间流逝
// 设置区块高度超过100
Local.setBlockchainLength(UInt32.from(101));

console.log('>>>>>>>>>>>> 众筹结束 <<<<<<<<<<');
console.log('\n提现前状态:');
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log(
  '受益人当前余额:',
  formatMina(Mina.getBalance(beneficiary)),
  'MINA'
);
console.log(
  '当前区块高度:',
  Local.getNetworkState().globalSlotSinceGenesis.toString()
);

console.log('--------------------------------');
console.log('\n非受益人提现，投资人1提现...');
try {
  tx = await Mina.transaction(
    {
      sender: beneficiary,
      fee: 0.1 * 10e9,
      memo: '受益人提现',
    },
    async () => {
      await zkapp.withdraw();
    }
  );
  await tx.prove();
  await tx
    .sign([investor1.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e.message);
    });
} catch (e: any) {
  console.log(e.message);
}

console.log('\n提现后状态:');
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('投资者1余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(beneficiary)), 'MINA');

console.log('--------------------------------');

console.log('\n受益人提现...');
tx = await Mina.transaction(
  {
    sender: beneficiary,
    fee: 0.1 * 10e9,
    memo: '受益人提现',
  },
  async () => {
    await zkapp.withdraw();
  }
);
await tx.prove();
await tx
  .sign([beneficiary.key])
  .send()
  .wait()
  .then(() => {
    console.log('tx success');
  })
  .catch((e: any) => {
    console.log('tx error', e.message);
  });

console.log('\n提现后状态:');
console.log('当前总金额: ' + formatMina(zkapp.totalAmount.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(beneficiary)), 'MINA');

CrowdProfiler.stop().store();