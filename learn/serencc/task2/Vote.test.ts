import { Field, MerkleTree, Proof } from 'o1js';
import { VoteCounter, VoteMerkleTree, VoteState } from './vote-counter';

describe('vote', () => {
  const tree = new MerkleTree(8);
  tree.setLeaf(1n, Field(1));
  tree.setLeaf(2n, Field(2));
  tree.setLeaf(3n, Field(3));
  tree.setLeaf(4n, Field(4));
  tree.setLeaf(5n, Field(5));
  tree.setLeaf(6n, Field(6));
  tree.setLeaf(7n, Field(7));
  tree.setLeaf(8n, Field(8));

  const root = tree.getRoot();

  const witness = new VoteMerkleTree(tree.getWitness(1n));

  const state = new VoteState({
    treeRoot: root,
    approve: Field(0),
    opposite: Field(0),
  });

  beforeAll(async () => {
    await VoteCounter.compile();
  });

  let proof: Proof<undefined, VoteState>;

  it('base case', async () => {
    proof = await VoteCounter.baseCase(state, witness);
    proof.verify();
    expect(proof.publicOutput.approve).toEqual(Field(0));
    expect(proof.publicOutput.opposite).toEqual(Field(0));
  });

  it('approve', async () => {
    const witness1 = new VoteMerkleTree(tree.getWitness(2n));

    proof = await VoteCounter.voteCase(
      Field(2),
      Field(1),
      state,
      witness1,
      proof
    );

    proof.verify();

    expect(proof.publicOutput.approve).toEqual(Field(1));
    expect(proof.publicOutput.opposite).toEqual(Field(0));

    const witness2 = new VoteMerkleTree(tree.getWitness(3n));

    proof = await VoteCounter.voteCase(
      Field(3),
      Field(1),
      state,
      witness2,
      proof
    );

    proof.verify();

    expect(proof.publicOutput.approve).toEqual(Field(2));
    expect(proof.publicOutput.opposite).toEqual(Field(0));
  });

  it('opposite', async () => {
    const witness1 = new VoteMerkleTree(tree.getWitness(4n));

    proof = await VoteCounter.voteCase(
      Field(4),
      Field(0),
      state,
      witness1,
      proof
    );

    proof.verify();

    expect(proof.publicOutput.approve).toEqual(Field(2));
    expect(proof.publicOutput.opposite).toEqual(Field(1));
  });
});
