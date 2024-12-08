import {
  Field,
  Provable,
  SelfProof,
  Struct,
  MerkleWitness,
  ZkProgram,
} from 'o1js';

export const treeHeight = 64;

export class MerkleTreeWitness extends MerkleWitness(treeHeight) {}

export class MainProgramState extends Struct({
  treeRoot: Field,
  agree: Field,
  against: Field,
}) {}

export const voteProgram = ZkProgram({
  name: 'voteProgram',
  publicOutput: MainProgramState,
  methods: {
    base: {
      privateInputs: [MainProgramState, MerkleTreeWitness],

      async method(state: MainProgramState, merkleWitness: MerkleTreeWitness) {
        const currentRoot = merkleWitness.calculateRoot(Field(1));

        state.treeRoot.assertEquals(
          currentRoot,
          'Provided merklewitness not correct or leaf not empty'
        );

        const { agree, against } = state;
        
        agree.assertEquals(Field(0));
        against.assertEquals(Field(0));

        return {
          publicOutput: new MainProgramState({
            treeRoot: currentRoot,
            agree,
            against,
          }),
        };
      },
    },

    vote: {
      privateInputs: [
        Field,
        Field,
        MainProgramState,
        MerkleTreeWitness,
        SelfProof,
      ],

      async method(
        member: Field,
        voteValue: Field,
        state: MainProgramState,
        merkleWitness: MerkleTreeWitness,
        earlierProof: SelfProof<void, MainProgramState>
      ) {
        earlierProof.verify();

        const currentRoot = merkleWitness.calculateRoot(member);

        state.treeRoot.assertEquals(
          currentRoot,
          'The current voter is not a team member'
        );

        voteValue.assertLessThanOrEqual(Field(1));

        const agree = Provable.if(
          voteValue.equals(Field(1)),
          earlierProof.publicOutput.agree.add(1),
          earlierProof.publicOutput.agree
        );

        const against = Provable.if(
          voteValue.equals(Field(0)),
          earlierProof.publicOutput.against.add(1),
          earlierProof.publicOutput.against
        );

        Provable.log('treeRoot', currentRoot);
        Provable.log('agree', agree);
        Provable.log('against', against);

        return {
          publicOutput: new MainProgramState({
            treeRoot: currentRoot,
            agree,
            against,
          }),
        };
      },
    },
  },
});
