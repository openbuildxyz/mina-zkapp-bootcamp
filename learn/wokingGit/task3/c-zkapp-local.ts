import { Mina, AccountUpdate, UInt64, UInt32 } from 'o1js';
import { CrowdFundingZkapp } from './c-zkapp.js';

const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// 编译合约
if (doProofs) {
  await CrowdFundingZkapp.compile();
} else {
  await CrowdFundingZkapp.analyzeMethods();
}

// 创建测试账户
let [sender, sender2] = Local.testAccounts;

let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new CrowdFundingZkapp(zkappAccount);

// 进行交易
console.log('deploy...');
let tx = await Mina.transaction(
  {
    sender,
    fee: 0.2 * 10e9,
    memo: '一笔交易',
    // nonce: 2
  },
  async () => {
    AccountUpdate.fundNewAccount(sender); // 需要为新账户创建而花费1MINA
    await zkapp.deploy({
      hardCap: UInt64.from(10 * 1e9),
      investor: sender,
      endTime: UInt32.from(5),
    }); // 部署前设置合约初始状态
  }
);
await tx.prove();
await tx.sign([sender.key, zkappAccount.key]).send().wait();

// 投资
console.log('invest...');
//设置本地 Mina 区块链长度
Local.setBlockchainLength(UInt32.from(2));
tx = await Mina.transaction(
  { sender: sender2, fee: 0.1 * 10e9, memo: 'invest' },
  async () => {
    await zkapp.invest(UInt64.from(1 * 1e9));
  }
);
await tx.prove();
await tx.sign([sender2.key]).send();
await zkapp.hardCap.fetch();

// 提款
console.log('withdraw...');
Local.setBlockchainLength(UInt32.from(8));
tx = await Mina.transaction(
  { sender: sender, fee: 0.1 * 10e9, memo: 'withdraw' },
  async () => {
    await zkapp.withdraw();
  }
);
await tx.prove();
await tx.sign([sender.key]).send();
await zkapp.hardCap.fetch();
