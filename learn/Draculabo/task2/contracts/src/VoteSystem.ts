import {
  Field,
  MerkleTree,
  MerkleWitness,
  SelfProof,
  Struct,
  ZkProgram,
  Provable,
  Poseidon,
} from 'o1js';

/**
 * 定义 Merkle 树的高度
 * 树的高度为64，意味着可以存储 2^63 个叶子节点
 */
const treeHeight = 64;

/**
 * 创建一个新的 Merkle 树实例
 * 用于存储和验证投票者的身份
 */
export const tree = new MerkleTree(treeHeight);

/**
 * 扩展 MerkleWitness 类
 * 用于生成和验证 Merkle 树的证明
 */
export class MerkleProofWitness extends MerkleWitness(treeHeight) {}

/**
 * 投票系统状态结构
 * 包含：
 * - Merkle 树根：用于验证投票者身份
 * - 反对票数：记录反对票的数量
 * - 赞成票数：记录赞成票的数量
 */
export class VoteSystem extends Struct({
  root: Field,
  rejectCount: Field,
  approveCount: Field,
}) {}

/**
 * 主程序定义
 * 实现了投票系统的核心逻辑
 */
export const mainProgram = ZkProgram({
  name: 'mainProgram',
  publicInput: Field, // 公开输入：总投票数
  publicOutput: VoteSystem, // 公开输出：投票系统状态
  methods: {
    /**
     * 基础用例方法：处理第一个投票
     * @param totalNumber - 总投票数（必须为1）
     * @param votingValue - 投票值（0表示反对，1表示赞成）
     * @param privateKey - 投票者的私钥
     * @param merkleWitness - Merkle树证明
     */
    initialVote: {
      privateInputs: [Field, Field, MerkleProofWitness],
      async method(
        totalNumber: Field,
        votingValue: Field,
        privateKey: Field,
        merkleWitness: MerkleProofWitness
      ) {
        // 确保这是第一个投票
        totalNumber.assertEquals(Field(1));

        // 计算当前的 Merkle 树根
        const currentRoot = merkleWitness.calculateRoot(
          Poseidon.hash([privateKey])
        );

        // 验证投票值是否有效（0或1）
        votingValue.assertLessThanOrEqual(Field(1));

        // 计算反对票（如果投票值<=0，则为1，否则为0）
        const v0: Field = Provable.if(
          votingValue.lessThanOrEqual(0),
          Field(1),
          Field(0)
        );

        // 计算赞成票（如果投票值>=1，则为1，否则为0）
        const v1: Field = Provable.if(
          votingValue.greaterThanOrEqual(1),
          Field(1),
          Field(0)
        );

        // 记录日志
        Provable.log(`root`, currentRoot);
        Provable.log(`rejectCount`, v0);
        Provable.log(`approveCount`, v1);

        // 返回新的投票系统状态
        return new VoteSystem({
          root: currentRoot,
          rejectCount: v0,
          approveCount: v1,
        });
      },
    },

    /**
     * 递归用例方法：处理后续投票
     * @param totalNumber - 当前总投票数
     * @param votingValue - 投票值（0表示反对，1表示赞成）
     * @param privateKey - 投票者的私钥
     * @param merkleWitness - Merkle树证明
     * @param earlierProof - 之前投票的证明
     */
    subsequentVote: {
      privateInputs: [Field, Field, MerkleProofWitness, SelfProof],
      async method(
        totalNumber: Field,
        votingValue: Field,
        privateKey: Field,
        merkleWitness: MerkleProofWitness,
        earlierProof: SelfProof<Field, VoteSystem>
      ) {
        // 验证投票序号的连续性
        earlierProof.publicInput.add(1).assertEquals(totalNumber);

        // 计算当前的 Merkle 树根
        const currentRoot = merkleWitness.calculateRoot(
          Poseidon.hash([privateKey])
        );

        // 验证之前的证明
        earlierProof.verify();

        // 验证 Merkle 树根的一致性
        earlierProof.publicOutput.root.assertEquals(
          currentRoot,
          'Provided merklewitness not correct or leaf not empty'
        );

        // 验证投票值是否有效（0或1）
        votingValue.assertLessThanOrEqual(Field(1));

        // 计算反对票
        const v0: Field = Provable.if(
          votingValue.lessThanOrEqual(0),
          Field(1),
          Field(0)
        );

        // 计算赞成票
        const v1: Field = Provable.if(
          votingValue.greaterThanOrEqual(1),
          Field(1),
          Field(0)
        );

        // 记录日志
        Provable.log(`root`, currentRoot);
        Provable.log(
          `rejectCount`,
          earlierProof.publicOutput.rejectCount.add(v0)
        );
        Provable.log(
          `approveCount`,
          earlierProof.publicOutput.approveCount.add(v1)
        );

        // 返回更新后的投票系统状态
        return new VoteSystem({
          root: currentRoot,
          rejectCount: earlierProof.publicOutput.rejectCount.add(v0),
          approveCount: earlierProof.publicOutput.approveCount.add(v1),
        });
      },
    },
  },
});
