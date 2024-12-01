import {
  Struct,
  ZkProgram,
  Field,
  Bool,
  PrivateKey,
  PublicKey,
  Signature,
  SelfProof,
  Provable,
  Circuit,
} from "o1js";

export class Voter extends Struct({
  id: PublicKey,
  voteOption: Bool,
  signature: Signature,
}) {}

export class CountVotes extends Struct({
  approveTotalCount: Field,
  rejectTotalCount: Field,
}) {}

export const memberPrivateKeys = [
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
];

export const memberIds = memberPrivateKeys.map((key) => key.toPublicKey());

export const VoteCounter = ZkProgram({
  name: "VoteCounter",
  publicInput: CountVotes,
  methods: {
    initVote: {
      privateInputs: [],
      async method(input: CountVotes) {
        input.approveTotalCount.assertEquals(Field(0));
        input.rejectTotalCount.assertEquals(Field(0));
      },
    },
    vote: {
      privateInputs: [Voter, SelfProof],
      method: async (
        input: CountVotes,
        voter: Voter,
        earlierProof: SelfProof<CountVotes, void>
      ) => {
        // 验证 earlierProof
        earlierProof.verify();

        // 检查投票者是否属于团队成员
        const message = voter.id.toFields().concat(voter.voteOption.toFields());
        voter.signature.verify(voter.id, message);

        // 更新投票统计
        const approveCount = Provable.if(voter.voteOption, Field(1), Field(0));
        earlierProof.publicInput.approveTotalCount =
          earlierProof.publicInput.approveTotalCount.add(approveCount);

        const rejectCount = Provable.if(voter.voteOption, Field(0), Field(1));
        earlierProof.publicInput.rejectTotalCount =
          earlierProof.publicInput.rejectTotalCount.add(rejectCount);

        earlierProof.publicInput.approveTotalCount.assertEquals(
          input.approveTotalCount
        );

        earlierProof.publicInput.rejectTotalCount.assertEquals(
          input.rejectTotalCount
        );
      },
    },
  },
});
