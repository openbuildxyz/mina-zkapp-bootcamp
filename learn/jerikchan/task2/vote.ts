import {
  Bool,
  Field,
  MerkleWitness,
  Poseidon,
  Provable,
  SelfProof,
  Struct,
  ZkProgram,
} from 'o1js';

export class MyMerkleWitness extends MerkleWitness(8) {}

export class Result extends Struct({
  approveCount: Field,
  rejectCount: Field,
  root: Field,
}) {}

export const VoteProgram = ZkProgram({
  name: 'vote-program',
  publicInput: Field,
  publicOutput: Result,
  methods: {
    init: {
      privateInputs: [Field],
      async method(
        members: Field,
        root: Field
      ) {
        members.assertEquals(Field(0));
        return new Result({
          root,
          approveCount: Field(0),
          rejectCount: Field(0),
        });
      },
    },
    voteMethod: {
      privateInputs: [Field, Field, MyMerkleWitness, SelfProof<Field, Result>, Field],
      async method(
        members: Field,
        vote: Field,
        member: Field,
        proofPath: MyMerkleWitness,
        earlierProof: SelfProof<Field, Result>,
        votedMask: Field
      ): Promise<Result> {
        earlierProof.verify();

        earlierProof.publicInput.add(1).assertEquals(members);

        votedMask.equals(Field(0)).assertTrue("Already voted");

        Bool.or(vote.equals(Field(0)), vote.equals(Field(1))).assertTrue("Invalid vote value");

        proofPath.calculateRoot(Poseidon.hash([member])).assertEquals(publicOutput.root);

        const approveCount = publicOutput.approveCount.add(vote);
        const rejectCount = publicOutput.rejectCount.add(Field(1).sub(vote));

        return new Result({
          root: publicOutput.root,
          approveCount,
          rejectCount,
        });
      },
    },
  },
});