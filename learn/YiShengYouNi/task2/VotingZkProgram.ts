import {
  Field,
  Struct,
  Signature,
  PublicKey,
  PrivateKey,
  Bool,
  ZkProgram,
} from 'o1js';

/** 团队成员公钥列表 */
const TEAM_MEMBERS: PublicKey[] = [
  PrivateKey.random().toPublicKey(),
  PrivateKey.random().toPublicKey(),
  PrivateKey.random().toPublicKey(),
];

/** 投票类型 */
enum VoteType {
  Approve = 1, // 赞成
  Reject = 0,  // 反对
}

/** 投票数据结构 */
class Vote extends Struct({
  voter: PublicKey,   // 投票者的公钥
  voteType: Field,    // 投票类型：1 为赞成，0 为反对
}) { }

/** 零知识投票程序 */
const VotingProgram = ZkProgram({
  publicInput: Struct({
    approveCount: Field, // 赞成票数
    rejectCount: Field,  // 反对票数
  }),

  methods: {
    vote: {
      privateInputs: [Vote, Signature] as const, // 确保是只读元组类型
      async method(publicInput, [vote, signature]) {
        // 验证签名有效性
        const isValidSignature = signature.verify(vote.voter, vote.toFields());
        isValidSignature.assertEquals(true, 'Invalid signature!');

        // 验证投票者是否属于团队成员
        const isTeamMember = TEAM_MEMBERS.reduce(
          (acc, member) => acc.or(member.equals(vote.voter)),
          Bool(false)
        );
        isTeamMember.assertEquals(true, 'Voter is not a team member!');

        // 累加票数
        if (vote.voteType.equals(Field(VoteType.Approve))) {
          publicInput.approveCount = publicInput.approveCount.add(1);
        } else if (vote.voteType.equals(Field(VoteType.Reject))) {
          publicInput.rejectCount = publicInput.rejectCount.add(1);
        } else {
          throw new Error('Invalid vote type!');
        }
      },
    },
  },
});

// 编译程序
await VotingProgram.compile();
console.log('VotingProgram compiled successfully!');

export { TEAM_MEMBERS, Vote, VotingProgram, VoteType };
