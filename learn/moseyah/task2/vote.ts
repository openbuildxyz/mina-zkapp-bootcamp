import {
  Provable,
  ZkProgram,
  Field,
  Bool,
  SelfProof,
  Struct,
  MerkleMapWitness,
} from 'o1js';

export class VoteClass extends Struct({
  agreeCount: Field,
  disAgreeCount: Field,
  memberTreeRoot: Field,
}) { }

export let VoteProgram = ZkProgram({
  name: 'voteProgram',
  publicInput: VoteClass, // 只能定义一个公开参数

  methods: {
    init: {
      privateInputs: [],
      async method(input: VoteClass) {
        input.agreeCount.assertEquals(Field(0)); // constraint
        input.disAgreeCount.assertEquals(Field(0)); // constraint
      },
    },
    vote: {
      privateInputs: [Bool, MerkleMapWitness, SelfProof],
      async method(
        input: VoteClass,
        isAgree: Bool,
        memberWitness: MerkleMapWitness,
        preProof: SelfProof<Field, void>
      ) {
        // verify preProof
        preProof.verify();

        // check member
        let [root] = memberWitness.computeRootAndKey(Field(1));
        root.assertEquals((preProof.publicInput as any).memberTreeRoot)

        // check vote
        const x = Provable.if(
          isAgree,
          (preProof.publicInput as any).agreeCount,
          (preProof.publicInput as any).disAgreeCount
        );
        const inputCount = Provable.if(isAgree, input.agreeCount, input.disAgreeCount);
        x.add(1).assertEquals(inputCount);
      },
    },
  },
});
