import { Field, Struct, MerkleWitness, ZkProgram, SelfProof, Provable, Bool } from "o1js";

/**
 * Voting Counter
 * Count the total number of votes in favor and against.
 * Verify that the voter belongs to the team members.
 */

/**
 * @param height Height of the Merkle Tree that this Witness belongs to.
 */
export class VoteMerkleTree extends MerkleWitness(8) {}

export class VoteState extends Struct({
  treeRoot: Field,
  approve: Field,
  opposite: Field,
}) {}

export let VoteCounter = ZkProgram({
  name: "VoteCounter",
  publicOutput: VoteState,
  methods: {
    baseCase: {
      privateInputs: [VoteState, VoteMerkleTree],
      async method(state: VoteState, merkleWitness: VoteMerkleTree) {
        const computedRoot = merkleWitness.calculateRoot(Field(1));
        state.treeRoot.assertEquals(computedRoot, "The merklewitness is not valid");

        state.approve.assertEquals(Field(0));
        state.opposite.assertEquals(Field(0));

        return new VoteState({
          treeRoot: computedRoot,
          approve: Field(0),
          opposite: Field(0),
        });
      },
    },

    voteCase: {
      privateInputs: [Field, Field, VoteState, VoteMerkleTree, SelfProof],

      async method(
        voter: Field,
        voteState: Field,
        state: VoteState,
        merkleWitness: VoteMerkleTree,
        earlierProof: SelfProof<void, VoteState>
      ) {
        earlierProof.verify();

        const computedRoot = merkleWitness.calculateRoot(voter);
        state.treeRoot.assertEquals(computedRoot, "This voter is not a member of the team.");

        Bool.or(voteState.equals(Field(1)), voteState.equals(Field(0))).assertTrue(
          "Invalid vote state"
        );

        const approve = Provable.if(
          voteState.equals(Field(1)),
          earlierProof.publicOutput.approve.add(1),
          earlierProof.publicOutput.approve
        );

        const opposite = Provable.if(
          voteState.equals(Field(0)),
          earlierProof.publicOutput.opposite.add(1),
          earlierProof.publicOutput.opposite
        );

        return new VoteState({
          treeRoot: computedRoot,
          approve,
          opposite,
        });
      },
    },
  },
});
