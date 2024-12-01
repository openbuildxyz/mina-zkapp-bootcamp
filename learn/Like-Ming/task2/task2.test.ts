import { AccountUpdate, MerkleMap, Field, Mina, PrivateKey, PublicKey, Bool, Poseidon, Signature, MerkleTree } from 'o1js';
import { task2 } from './task2';

let proofsEnabled = false;

/**
 * 初始化MerkleMap
 * 
 * 该函数接受一个公钥数组作为输入，将每个公钥映射到MerkleMap中
 * MerkleMap是一种数据结构，用于高效地存储和验证大量数据的完整性
 * 
 * @param members 公钥数组，代表需要被映射的成员
 * @returns 返回初始化后的MerkleMap
 */
function initializeMerkleMap(members: PublicKey[]) {
  const merkleMap = new MerkleMap();

  members.forEach((member, index) => {
    const hashedMember = Poseidon.hash(member.toFields());
    merkleMap.set(Field(index), hashedMember);
  });

  return merkleMap;
}

describe('task2', () => {
  let deployerAccount: Mina.TestPublicKey,
      deployerKey: PrivateKey,
      senderAccount: Mina.TestPublicKey,
      senderKey: PrivateKey,
      zkAppAddress: PublicKey,
      zkAppPrivateKey: PrivateKey,
      zkApp: task2,
      teamMembers: PrivateKey[],
      merkleMap: MerkleMap,
      memberRoot: Field;

  beforeAll(async () => {
    if (proofsEnabled) await task2.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    // 初始化团队成员
    teamMembers = [PrivateKey.random(), PrivateKey.random(), PrivateKey.random()];
    const memberPublicKeys = teamMembers.map((key) => key.toPublicKey());
    merkleMap = initializeMerkleMap(memberPublicKeys);
    memberRoot = merkleMap.getRoot();

    zkApp = new task2(zkAppAddress);
  });

  /**
   * 部署ZK应用
   */
  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
      await zkApp.init(memberRoot);
    });

    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  /**
   * 提交投票
   * 
   * @param voter 投票者私钥
   * @param vote 投票内容（支持/反对）
   * @param voterIndex 投票者在merkleMap的key
   */
  async function castVote(voter: PrivateKey, vote: Bool, voterIndex: number) {
    const signature = Signature.create(voter, [vote.toField()]);
    const witness = merkleMap.getWitness(Field(voterIndex));

    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.castVote(voter.toPublicKey(), vote, signature, witness);
    });

    await txn.prove();
    await txn.sign([senderKey]).send();
  }

  it('部署智能合约', async () => {
    await localDeploy();
    const results = await zkApp.getCurrentResults();
    expect(results.support).toEqual(Field(0));
    expect(results.oppose).toEqual(Field(0));
  });

  it('处理韭菜的投票信息', async () => {
    await localDeploy();
    // 提交第一个成员的投票
    await castVote(teamMembers[0], Bool(true), 0);
    // 提交第二个成员的投票
    await castVote(teamMembers[1], Bool(false), 1);

    const results = await zkApp.getCurrentResults();
    expect(results.support).toEqual(Field(1));
    expect(results.oppose).toEqual(Field(1));
  });

  it('新韭菜你没资格投票！', async () => {
    await localDeploy();
    await expect(async () => {
      await castVote(PrivateKey.random(), Bool(true), 99); // 使用不存在的索引
    }).rejects.toThrow('新韭菜你没资格投票！');
  });

  it('处理老韭菜投票', async () => {
    await localDeploy();

    // 所有成员都投支持票
    for (let i = 0; i < teamMembers.length; i++) {
      await castVote(teamMembers[i], Bool(true), i);
    }

    const results = await zkApp.getCurrentResults();
    expect(results.support).toEqual(Field(3));
    expect(results.oppose).toEqual(Field(0));
  });

  it('更新老韭菜投票信息', async () => {
    await localDeploy();

    // 投赞成票
    await castVote(teamMembers[0], Bool(true), 0);
    // 投反对票
    await castVote(teamMembers[1], Bool(false), 1);
    // 投赞成票
    await castVote(teamMembers[2], Bool(true), 2);

    const results = await zkApp.getCurrentResults();
    expect(results.support).toEqual(Field(2));
    expect(results.oppose).toEqual(Field(1));
  });
});
