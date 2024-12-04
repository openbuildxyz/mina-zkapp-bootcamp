import { Result, VoteProgram, MyMerkleWitness } from './vote';
import { SelfProof, Field, MerkleTree, Poseidon } from 'o1js';

describe('VoteProgram', () => {
  let merkleTree: MerkleTree;
  let root: Field;
  let initialProof: SelfProof<Field, Result>;

  beforeAll(async () => {
    // 初始化 Merkle Tree
    merkleTree = new MerkleTree(8);
    const initialLeaf = Poseidon.hash([Field(0)]);
    merkleTree.setLeaf(0n, initialLeaf);
    root = merkleTree.getRoot();

    // 生成初始证明
    await VoteProgram.compile();
    initialProof = await VoteProgram.init(Field(0), root);
  });

  test('should initialize VoteProgram correctly', async () => {
    const { publicOutput } = await initialProof;
    expect(publicOutput.root).toEqual(root);
    expect(publicOutput.approveCount).toEqual(Field(0));
    expect(publicOutput.rejectCount).toEqual(Field(0));
  });

  test('should process a vote correctly', async () => {
    // 新增成员的叶子节点
    const member = Poseidon.hash([Field(1)]);
    console.log('xxx:', merkleTree.getWitness(0n));
    const proofPath = new MyMerkleWitness(merkleTree.getWitness(0n)); // 假设成员在位置 0
    merkleTree.setLeaf(0n, member); // 更新 Merkle Tree

    const newRoot = merkleTree.getRoot();
    const vote = Field(1); // 表示支持票
    const resultProof = await VoteProgram.voteMethod(
      Field(1), // 成员数量
      vote, // 投票值
      member, // 成员标识
      proofPath, // Merkle 证明路径
      initialProof // 之前的证明
    );

    const { publicOutput } = resultProof;

    expect(publicOutput.root.equals(newRoot)).toBeTruthy(); // 验证根是否正确
    expect(publicOutput.approveCount.equals(Field(1))).toBeTruthy();
    expect(publicOutput.rejectCount.equals(Field(0))).toBeTruthy();
  });

  test('should reject invalid vote', async () => {
    // 模拟无效投票
    const invalidVote = Field(2); // 非法投票值
    const member = Poseidon.hash([Field(1)]);
    const proofPath = new MyMerkleWitness(merkleTree.getWitness(0n));

    await expect(
      VoteProgram.voteMethod(
        Field(1),
        invalidVote,
        member,
        proofPath,
        initialProof
      )
    ).rejects.toThrow(); // 非法投票应抛出异常
  });
});
