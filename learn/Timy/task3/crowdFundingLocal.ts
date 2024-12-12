/*
 * @Date: 2024-12-09 11:33:27
 * @LastEditors: TinyScript
 * @LastEditTime: 2024-12-12 15:42:07
 * @FilePath: /sudoku/Users/bzp/tiny/web3/mina-ethsz/contracts/src/crowdFunding/crowdFundingLocal.ts
 */

import { AccountUpdate, Mina, UInt32, UInt64 } from "o1js";
import { CrowdFunding } from "./crowdFunding.js";
import { TestPublicKey } from "o1js/dist/node/lib/mina/local-blockchain";
console.log('正在初始化合约基本设置...');
const MINA = 1e9;
const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);
console.log('正在编译合约...');
await CrowdFunding.compile();
// 生成测试账户
const [deployer, donor1, donor2, beneficiary] = Local.testAccounts;

console.log('账户及余额信息:');
console.log('deployer:', deployer.toBase58());
console.log('deployer balance:', formatBalance(deployer));
console.log('donor1:', donor1.toBase58());
console.log('donor1 balance:', formatBalance(donor1));
console.log('donor2:', donor2.toBase58());
console.log('donor2 balance:', formatBalance(donor2));
console.log('beneficiary:', beneficiary.toBase58());
console.log('beneficiary balance:', formatBalance(beneficiary));
console.log('======================================')

const zkappAccount = Mina.TestPublicKey.random();
const zkapp = new CrowdFunding(zkappAccount);


console.log('正在获取当前全局Slot信息...');
const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('正在准备合约部署...');
console.log('[合约发起人] 正在创建交易对象...');
const deployTx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * MINA, memo: '部署众筹合约' },
  async () => {
    AccountUpdate.fundNewAccount(deployer);

    console.log('[合约发起人] 正在部署当前合约...');
    await zkapp.deploy({
      fundingCap: UInt64.from(1_000_000_000_000),
      endTime: UInt32.from(currentSlot.add(1_000))
    })
  }
)

console.log('[合约发起人] 正在生成当前交易的零知识证明...');
// 生成零知识证明，确保当前交易的有效性
await deployTx.prove();
console.log('[合约发起人] 正在签署交易并发送到Mina区块网络...');
// 使用私钥进行交易签署，并发送到Mina网络
await deployTx.sign([deployer.key, zkappAccount.key]).send();

console.log('[合约发起人] 合约已完成部署，正在初始化状态...');
console.log('[合约发起人] 总捐募:');
console.log(zkapp.totalRaised.get().div(1e9).toString(), 'MINA');
console.log('[合约发起人] 募捐金额上限:')
console.log(zkapp.fundingCap.get().div(1e9).toString(), 'block height');
console.log('[合约发起人] 合约所有者:');
console.log(zkapp.owner.get().toBase58());
console.log('======================================')

// 1号捐赠人向当前活动发起募捐
console.log('[1号捐赠人] 正在发起捐赠，计划捐赠50 Mina...');
const contributeTx1 = await Mina.transaction(
  { sender: donor1, fee: 0.1 * MINA, memo: '1号捐赠人的贡献值' },
  async () => {
    await zkapp.contribute(UInt64.from(50 * MINA));
  }
)


console.log('[1号捐赠人] 正在生成交易的零知识证明...');
await contributeTx1.prove();
console.log('[1号捐赠人] 正在对发起的交易进行签署，并发送到Mina网络...');
await contributeTx1.sign([donor1.key]).send();
console.log('[1号捐赠人] 完成捐款后的总募捐额度:')
console.log(zkapp.totalRaised.get().div(MINA).toString());

console.log('[1号捐赠人] 合约已募捐金额:', formatBalance(zkappAccount))
console.log('[1号捐赠人] 合约部署人金额:', formatBalance(donor1))

console.log('======================================')

console.log('[2号捐赠人] 正在发起捐赠，计划捐赠70 Mina...')
const donor2Tx = Mina.transaction(
  { sender: donor2, fee: 0.1 * MINA, memo: '2号捐赠人的贡献值' },
  async () => {
    await zkapp.contribute(UInt64.from(70 * MINA));
  }
)

console.log('[2号捐赠人] 正在生成交易的zk ...');
await donor2Tx.prove();
console.log('[2号捐赠人] 正在对发起的交易进行签署，并发送到Mina网络...');
await donor2Tx.sign([donor2.key]).send();
console.log('[2号捐赠人] 完成捐款后的总募捐额度:');
console.log(zkapp.totalRaised.get().div(MINA).toString());
console.log('[2号捐赠人] 合约已募捐金额:', formatBalance(zkappAccount));
console.log('[2号捐赠人] 合约部署人金额:', formatBalance(donor2));

console.log('======================================')

console.log('[合约提现] 模拟募捐阶段结束场景...')
Local.setBlockchainLength(UInt32.from(1_001));
console.log('[合约提现] 合约所有者提现募捐金额...');
const withdrawTx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * MINA, memo: '提现募捐金额' },
  async () => {
    console.log('[合约提现] 正在将合约所有人资金转给受益人账户...');
    await zkapp.withdraw(beneficiary);
  }
)

console.log('[合约提现] 正在生成提现交易的zk...');
await withdrawTx.prove();
console.log('[合约提现] 正在对发起的交易进行签署，并发送到Mina网络...');
await withdrawTx.sign([deployer.key]).send();

console.log('[合约提现] 已完成提现...');
console.log('[合约提现] 合约余额信息:', formatBalance(zkappAccount));
console.log('[合约提现] 受益人余额信息:', formatBalance(beneficiary));
console.log('======================================')

console.log('[最终阶段] 余额结算:')
console.log('[最终阶段] 合约所有者:', formatBalance(deployer));
console.log('[最终阶段] 1号捐赠人:', formatBalance(donor1));
console.log('[最终阶段] 2号捐赠人:', formatBalance(donor2));
console.log('[最终阶段] 受益人:', formatBalance(beneficiary));

console.log('======================================')

const account = Mina.getAccount(zkappAccount);
console.log(JSON.stringify(account, null, 2));



function formatBalance(account: TestPublicKey) {
  const balance = Mina.getBalance(account).toBigInt();
  return (Number(balance) / MINA).toFixed(2) + 'MINA'
}