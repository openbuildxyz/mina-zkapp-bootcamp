import {
  PrivateKey,
  PublicKey,
  Mina,
  AccountUpdate,
  Bool,
  Signature,
} from 'o1js';
import { VotingSystem } from './vote-system.js';

console.log('正在启动投票系统测试...\n');

async function submitVote(
  zkApp: VotingSystem, 
  senderKey: PrivateKey, 
  senderAccount: PublicKey, 
  voteChoice: boolean,
  voterNumber: number
) {
  console.log(`\n提交第 ${voterNumber} 号投票者的${voteChoice ? '赞成' : '反对'}票...`);
  const voterPrivateKey = PrivateKey.random();
  const voterPublicKey = voterPrivateKey.toPublicKey();
  const choice = Bool(voteChoice);
  const signature = Signature.create(voterPrivateKey, [choice.toField()]);

  console.time(`投票 ${voterNumber} 证明时间`);
  const voteTxn = await Mina.transaction(senderAccount, async () => {
    await zkApp.vote(voterPublicKey, signature, choice);
  });
  await voteTxn.prove();
  console.timeEnd(`投票 ${voterNumber} 证明时间`);
  await voteTxn.sign([senderKey]).send();
  console.log(`投票 ${voterNumber} 已提交！`);
}

async function main() {
  try {
    // 设置本地区块链
    const Local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(Local);
    
    // 获取测试账户
    const deployerKey = Local.testAccounts[0].key;
    const deployerAccount = deployerKey.toPublicKey();
    const senderKey = Local.testAccounts[1].key;
    const senderAccount = senderKey.toPublicKey();

    // 为合约创建公私钥对
    const zkAppPrivateKey = PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();

    // 创建智能合约实例
    const zkApp = new VotingSystem(zkAppAddress);

    console.log('编译合约中...');
    console.time('编译时间');
    await VotingSystem.compile();
    console.timeEnd('编译时间');

    console.log('\n部署合约...');
    console.log('生成证明...');
    console.time('证明生成时间');
    const deployTxn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await deployTxn.prove();
    console.timeEnd('证明生成时间');
    
    console.log('发送交易...');
    await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
    console.log('合约部署成功！');

    console.log('\n开始投票流程...');
    console.time('开始投票证明时间');
    const startVoteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.startVoting();
    });
    await startVoteTxn.prove();
    console.timeEnd('开始投票证明时间');
    await startVoteTxn.sign([senderKey]).send();
    console.log('投票已开始！');

    // 多轮投票测试
    await submitVote(zkApp, senderKey, senderAccount, true, 1);  // 赞成票
    await submitVote(zkApp, senderKey, senderAccount, false, 2); // 反对票
    await submitVote(zkApp, senderKey, senderAccount, true, 3);  // 赞成票
    await submitVote(zkApp, senderKey, senderAccount, true, 4);  // 赞成票
    await submitVote(zkApp, senderKey, senderAccount, false, 5); // 反对票

    // 显示中间结果
    const results = await zkApp.getVoteResults();
    console.log('\n当前投票结果:');
    console.log('赞成票:', results.yesVotes.toString());
    console.log('反对票:', results.noVotes.toString());

    console.log('\n结束投票...');
    console.time('结束投票证明时间');
    const endVoteTxn = await Mina.transaction(senderAccount, async () => {
      await zkApp.endVoting();
    });
    await endVoteTxn.prove();
    console.timeEnd('结束投票证明时间');
    await endVoteTxn.sign([senderKey]).send();
    console.log('投票已结束！');

    // 显示最终结果
    const finalResults = await zkApp.getVoteResults();
    console.log('\n最终投票结果:');
    console.log('赞成票:', finalResults.yesVotes.toString());
    console.log('反对票:', finalResults.noVotes.toString());

  } catch (error) {
    console.error('\n执行过程中出现错误:', error);
  }
}

main()
  .then(() => {
    console.log('\n程序执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n程序执行失败:', error);
    process.exit(1);
  });