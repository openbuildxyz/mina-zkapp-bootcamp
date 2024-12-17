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
      async method(members: Field, root: Field) {
        members.assertEquals(Field(0));
        return new Result({
          root,
          approveCount: Field(0),
          rejectCount: Field(0),
        });
      },
    },
    voteMethod: {
      privateInputs: [Field, Field, MyMerkleWitness, SelfProof<Field, Result>],
      async method(
        members: Field,
        vote: Field,
        member: Field,
        proofPath: MyMerkleWitness,
        earierProof: SelfProof<Field, Result>
      ): Promise<Result> {
        earierProof.verify();

        earierProof.publicInput.add(1).assertEquals(members);

        Bool.or(vote.equals(Field(0)), vote.equals(Field(1))).assertTrue();

        const { publicOutput } = earierProof;

        proofPath.calculateRoot(Poseidon.hash([member])).assertEquals(publicOutput.root);

        const approveCount = Provable.if(
          vote.equals(Field(1)),
          publicOutput.approveCount.add(Field(1)),
          publicOutput.approveCount
        );

        const rejectCount = Provable.if(
          vote.equals(Field(0)),
          publicOutput.rejectCount.add(Field(1)),
          publicOutput.rejectCount
        );

        return new Result({
          root: publicOutput.root,
          approveCount,
          rejectCount,
        });
      },
    },
  },
});
