import { AccountUpdate, Mina, PrivateKey, UInt32, UInt64 } from 'o1js';
import { Fundraising } from './fundraising.js';
import { getProfiler } from './utils/proifler.js';

const Fundraisingfiler = getProfiler('Fundraising zkApp');
Fundraisingfiler.start('Fundraising zkApp test flow');

function formatMina(amount: UInt64): string {
  return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

const doProof = false;

const Local = await Mina.LocalBlockchain({ proofsEnabled: doProof });
Mina.setActiveInstance(Local);

if (doProof) {
  console.log('Compiling...');
  await Fundraising.compile();
} else {
  await Fundraising.analyzeMethods();
}

let [feepayer, raiseOwner, investor1, investor2] = Local.testAccounts;

console.log('查看各账号初始余额状态:');
console.log('受益人初始余额:', formatMina(Mina.getBalance(raiseOwner)), 'MINA');
console.log('投资者1初始余额:', formatMina(Mina.getBalance(investor1)), 'MINA');
console.log('投资者2初始余额:', formatMina(Mina.getBalance(investor2)), 'MINA');

// 创建众筹合约账户
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new Fundraising(zkappAccount);

const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('deploy');
let tx = await Mina.transaction(
  {
    sender: feepayer,
    fee: 0.1 * 10e9,
    memo: '一笔交易',
    // nonce: 2
  },
  async () => {
    AccountUpdate.fundNewAccount(feepayer); // 需要为新账户创建而花费1MINA
    await zkapp.deploy({
      hardCap: UInt64.from(10 * 1e9), // 硬顶
      endTime: UInt32.from(currentSlot.add(100)), // 众筹结束时间
      raiseOwner, // 众筹发起人
    }); // 部署前设置合约初始状态
  }
);
await tx.prove();
await tx.sign([feepayer.key, zkappKey]).send();

console.log('check init state...');
console.log('投资结束时间: ' + zkapp.endTime.get().toString());
console.log('受益人地址: ' + zkapp.raiseOwner.get().toBase58());
console.log('硬顶金额: ' + formatMina(zkapp.hardCap.get()), 'MINA');
console.log(
  '已经募集了的总金额: ' + formatMina(zkapp.totalRaised.get()),
  'MINA'
);

console.log('investor1 投资 5 MINA--------');
tx = await Mina.transaction(
  {
    sender: investor1,
    fee: 0.1 * 10e9,
    memo: 'investor1投资----',
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

console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log(
  '投资者1后账户余额:',
  formatMina(Mina.getBalance(investor1)),
  'MINA'
);

console.log('\ninvestor2 投资 5 MINA...');
tx = await Mina.transaction(
  {
    sender: investor2,
    fee: 0.1 * 10e9,
    memo: 'investor2投资',
  },
  async () => {
    await zkapp.invest(UInt64.from(5 * 1e9));
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

console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log(
  '投资者2后账户余额:',
  formatMina(Mina.getBalance(investor2)),
  'MINA'
);

try {
  console.log('\ninvestor2 超额投资 5 MINA...');
  tx = await Mina.transaction(
    {
      sender: investor2,
      fee: 0.1 * 10e9,
      memo: 'investor2投资',
    },
    async () => {
      await zkapp.invest(UInt64.from(5 * 1e9));
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
} catch (e: any) {
  console.log('investor2 超额投资失败', e.message);
}
console.log('investor2 超额投资后.......');
console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log(
  'investor2 超额投资后账户余额:',
  formatMina(Mina.getBalance(investor2)),
  'MINA'
);

try {
  console.log('\n受益人在募资期间提现5 MINA...');
  tx = await Mina.transaction(
    {
      sender: raiseOwner,
      fee: 0.1 * 10e9,
      memo: '受益人提现',
    },
    async () => {
      await zkapp.withdraw(UInt64.from(5 * 1e9));
    }
  );
  await tx.prove();
  await tx
    .sign([raiseOwner.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e);
    });
} catch (e: any) {
  console.log('受益人提现失败', e.message);
}

console.log('\n受益人募资期间提现后状态:');
console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(raiseOwner)), 'MINA');

console.log('\n等待募资结束...');
Local.setBlockchainLength(UInt32.from(101));
console.log('\n募资结束...');

try {
  console.log('\n非受益人提现...');
  tx = await Mina.transaction(
    {
      sender: investor1,
      fee: 0.1 * 10e9,
      memo: '非受益人提现',
    },
    async () => {
      await zkapp.withdraw(UInt64.from(5 * 1e9));
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
} catch (e: any) {
  console.log('非受益人提现失败', e.message);
}
console.log('\n非受益人募资期间提现后状态:');
console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log('非受益人1余额:', formatMina(Mina.getBalance(investor1)), 'MINA');

try {
  console.log('\n受益人超额提现 11 MINA...');
  tx = await Mina.transaction(
    {
      sender: raiseOwner,
      fee: 0.1 * 10e9,
      memo: '受益人提现',
    },
    async () => {
      await zkapp.withdraw(UInt64.from(11 * 1e9));
    }
  );
  await tx.prove();
  await tx
    .sign([raiseOwner.key])
    .send()
    .wait()
    .then(() => {
      console.log('tx success');
    })
    .catch((e: any) => {
      console.log('tx error', e);
    });
} catch (e: any) {
  console.log('受益人超额提现失败', e.message);
}
console.log('\n受益人超额提现后状态:');
console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(raiseOwner)), 'MINA');

console.log('\n受益人正常提现 10 MINA...');
tx = await Mina.transaction(
  {
    sender: raiseOwner,
    fee: 0.1 * 10e9,
    memo: '受益人提现',
  },
  async () => {
    await zkapp.withdraw(UInt64.from(10 * 1e9));
  }
);
await tx.prove();
await tx
  .sign([raiseOwner.key])
  .send()
  .wait()
  .then(() => {
    console.log('tx success');
  })
  .catch((e: any) => {
    console.log('tx error', e);
  });
console.log('\n益人正常提现 10 MINA后状态:');
console.log('总金额: ' + formatMina(zkapp.totalRaised.get()), 'MINA');
console.log('受益人余额:', formatMina(Mina.getBalance(raiseOwner)), 'MINA');

Fundraisingfiler.stop().store();
