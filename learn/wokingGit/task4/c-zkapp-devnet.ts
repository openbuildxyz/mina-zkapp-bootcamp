import {
  PrivateKey,
  Mina,
  AccountUpdate,
  fetchAccount,
  UInt64,
  UInt32,
} from 'o1js';
import { CrowdFundingZkapp } from './a-zkapp.js';

// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
});
Mina.setActiveInstance(network);

const senderKey = PrivateKey.fromBase58(
  'EKEpsnfaAnAV2wU5pMBp66rQvXDoAfGHza9d2MQ7awB5bDapWqNA'
);
const sender = senderKey.toPublicKey();

const senderKey2 = PrivateKey.fromBase58(
  'EKDxVDiryKdAXKzvsJy7sv82c4Zgx4nZXU5MoJL5JhHfXXh3o66v'
);
const sender2 = senderKey2.toPublicKey();

// 支付账户的信息
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(
  `Using the fee payer account ${sender.toBase58()} with nonce: ${
    accountDetails?.nonce
  } and balance: ${accountDetails?.balance}.`
);

// 编译
console.log('compile');
await CrowdFundingZkapp.compile();

// 生成一个随机私钥，用于管理账户。
// 基于私钥生成一个公钥，作为账户的标识。
// 使用这个公钥初始化一个零知识应用实例，可能用于构建智能合约
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdFundingZkapp(zkappAccount);

const endBlockchainLength = 411843;

// 进行交易
console.log('deploy...');
let tx = await Mina.transaction(
  {
    sender,
    fee: 0.5 * 10e9,
    memo: '一笔交易',
    // nonce: 2
  },
  async () => {
    AccountUpdate.fundNewAccount(sender); // 需要为新账户创建而花费1MINA
    await zkapp.deploy({
      hardCap: UInt64.from(20 * 1e9),
      investor: sender,
      endTime: UInt32.from(endBlockchainLength),
    }); // 部署前设置合约初始状态
  }
);
await tx.prove();
await tx.sign([senderKey, zkappKey]).send().wait();

// 投资
console.log('invest...');
//设置本地 Mina 区块链长度
tx = await Mina.transaction(
  { sender: sender2, fee: 0.5 * 10e9, memo: 'invest' },
  async () => {
    await zkapp.invest(UInt64.from(1 * 1e9));
  }
);
await tx.prove();
await tx.sign([senderKey2]).send();
await zkapp.hardCap.fetch();

// 提款
// console.log('withdraw...');
// tx = await Mina.transaction(
//   { sender: sender, fee: 0.1 * 10e9, memo: 'withdraw' },
//   async () => {
//     await zkapp.withdraw();
//   }
// );
// await tx.prove();
// await tx.sign([senderKey]).send();
// await zkapp.hardCap.fetch();
