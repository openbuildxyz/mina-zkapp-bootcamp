import {
  Field,
  Provable,
  SelfProof,
  Struct,
  MerkleWitness,
  ZkProgram,
} from 'o1js';


export class MerkleTreeWitness extends MerkleWitness(4) { }
export class MainProgramState extends Struct({
  treeRoot: Field,
  approve: Field,
  disapprove: Field,
}) { }

export const VoteProgram = ZkProgram({
  name: 'VoteProgram',
  publicOutput: MainProgramState,
  methods: {
    base: {
      privateInputs: [MainProgramState, MerkleTreeWitness],

      async method (
        state: MainProgramState,
        merkleWitness: MerkleTreeWitness
      ) {
        const currentRoot = merkleWitness.calculateRoot(Field(1));
        state.treeRoot.assertEquals(
          currentRoot,
          'Provided merklewitness not correct or leaf not empty'
        );
        const { approve, disapprove } = state;
        approve.assertEquals(Field(0));
        disapprove.assertEquals(Field(0));

        return {
          publicOutput: new MainProgramState({
            treeRoot: currentRoot,
            approve,
            disapprove
          })
        }
      },
    },

    vote: {
      privateInputs: [Field, Field, MainProgramState, MerkleTreeWitness, SelfProof],

      async method (
        member: Field,
        voteStatus: Field,
        state: MainProgramState,
        merkleWitness: MerkleTreeWitness,
        earlierProof: SelfProof<void, MainProgramState>
      ) {
        // 验证之前的电路
        earlierProof.verify();

        // 验证投票者是否是团队成员
        const currentRoot = merkleWitness.calculateRoot(member);
        state.treeRoot.assertEquals(currentRoot, 'It is not a part of this group')
        // 判断投票输入是否是 1 or 0
        voteStatus.assertLessThanOrEqual(Field(1));
        // 投票累加
        const approve = Provable.if(voteStatus.equals(Field(1)), earlierProof.publicOutput.approve.add(1), earlierProof.publicOutput.approve)

        const disapprove = Provable.if(voteStatus.equals(Field(0)), earlierProof.publicOutput.disapprove.add(1), earlierProof.publicOutput.disapprove)

        return {
          publicOutput: new MainProgramState({
            treeRoot: currentRoot,
            approve,
            disapprove
          })
        }
      },
    },
  },
});