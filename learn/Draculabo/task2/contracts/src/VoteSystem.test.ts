import {
  mainProgram,
  MerkleProofWitness,
  tree,
  VoteSystem,
} from './VoteSystem';
import { Field, Poseidon } from 'o1js';

describe('VoteSystem', () => {
  // 测试数据初始化
  const testKeys = [123n, 456n, 789n, 101112n, 131415n, 161718n];

  beforeAll(async () => {
    // 设置 Merkle Tree 叶子节点
    for (let i = 0; i < testKeys.length; i++) {
      tree.setLeaf(BigInt(i), Poseidon.hash([Field(testKeys[i])]));
    }
    // 编译程序
    console.log('Compiling program...');
    await mainProgram.compile();
  });

  describe('Initial Vote Tests', () => {
    it('should correctly process first vote (approve)', async () => {
      const totalNumber = Field(1);
      const votingValue = Field(1); // approve vote
      const privateKey = Field(testKeys[0]);
      const merkleWitness = new MerkleProofWitness(tree.getWitness(0n));

      // 执行基础用例
      const proof = await mainProgram.initialVote(
        totalNumber,
        votingValue,
        privateKey,
        merkleWitness
      );

      // 验证证明
      const ok = await mainProgram.verify(proof);
      expect(ok).toBe(true);

      // 验证投票结果
      expect(proof.publicOutput.approveCount).toEqual(Field(1));
      expect(proof.publicOutput.rejectCount).toEqual(Field(0));
    });

    it('should correctly process first vote (reject)', async () => {
      const totalNumber = Field(1);
      const votingValue = Field(0); // reject vote
      const privateKey = Field(testKeys[0]);
      const merkleWitness = new MerkleProofWitness(tree.getWitness(0n));

      // 执行基础用例
      const proof = await mainProgram.initialVote(
        totalNumber,
        votingValue,
        privateKey,
        merkleWitness
      );

      // 验证证明
      const ok = await mainProgram.verify(proof);
      expect(ok).toBe(true);

      // 验证投票结果
      expect(proof.publicOutput.approveCount).toEqual(Field(0));
      expect(proof.publicOutput.rejectCount).toEqual(Field(1));
    });
  });

  describe('Subsequent Vote Tests', () => {
    it('should correctly process multiple votes', async () => {
      // 第一票 (approve)
      let totalNumber = Field(1);
      let votingValue = Field(1);
      let privateKey = Field(testKeys[0]);
      let merkleWitness = new MerkleProofWitness(tree.getWitness(0n));

      let proof = await mainProgram.initialVote(
        totalNumber,
        votingValue,
        privateKey,
        merkleWitness
      );

      // 第二票 (reject)
      totalNumber = totalNumber.add(1);
      votingValue = Field(0);
      privateKey = Field(testKeys[1]);
      merkleWitness = new MerkleProofWitness(tree.getWitness(1n));

      proof = await mainProgram.subsequentVote(
        totalNumber,
        votingValue,
        privateKey,
        merkleWitness,
        // 这里要将上次的证明结果传进来
        proof
      );

      // 验证第二次投票后的结果
      expect(proof.publicOutput.approveCount).toEqual(Field(1));
      expect(proof.publicOutput.rejectCount).toEqual(Field(1));

      // 第三票 (reject)
      totalNumber = totalNumber.add(1);
      votingValue = Field(0);
      privateKey = Field(testKeys[2]);
      merkleWitness = new MerkleProofWitness(tree.getWitness(2n));

      proof = await mainProgram.subsequentVote(
        totalNumber,
        votingValue,
        privateKey,
        merkleWitness,
        proof
      );

      // 验证最终投票结果
      const ok = await mainProgram.verify(proof);
      expect(ok).toBe(true);
      expect(proof.publicOutput.approveCount).toEqual(Field(1));
      expect(proof.publicOutput.rejectCount).toEqual(Field(2));
    });
  });

  describe('Merkle Tree Tests', () => {
    it('should correctly verify Merkle witness', async () => {
      const witness = tree.getWitness(0n);
      const merkleWitness = new MerkleProofWitness(witness);
      const privateKey = Field(testKeys[0]);
      const calculatedRoot = merkleWitness.calculateRoot(
        Poseidon.hash([privateKey])
      );

      expect(calculatedRoot).toEqual(tree.getRoot());
    });
  });
});
