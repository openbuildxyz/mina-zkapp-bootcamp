import { Field, MerkleTree, SelfProof } from "o1js";
import { VoteProgram, MerkleTreeWitness, MainProgramState } from "./vote";


describe('vote', () => {

  const tree = new MerkleTree(4);
  tree.setLeaf(1n, Field(1));
  tree.setLeaf(2n, Field(2));
  tree.setLeaf(3n, Field(3));
  tree.setLeaf(4n, Field(4));

  const rootBefore = tree.getRoot();

  const witness = new MerkleTreeWitness(tree.getWitness(1n));

  const state = new MainProgramState({
    treeRoot: rootBefore,
    approve: Field(0),
    disapprove: Field(0)
  })
  let proof: SelfProof<void, MainProgramState>

  beforeAll(async () => {
    await VoteProgram.compile();
  });

  it('base', async () => {
    const { proof: proofBase } = await VoteProgram.base(state, witness)
    proof = proofBase

    proof.verify()

    expect(proof.publicOutput.approve).toEqual(Field(0))
    expect(proof.publicOutput.disapprove).toEqual(Field(0))
  })

  it('approve', async () => {

    const witness2 = new MerkleTreeWitness(tree.getWitness(2n));

    const { proof: proof1 } = await VoteProgram.vote(Field(2), Field(1), state, witness2, proof)
    proof1.verify()

    expect(proof1.publicOutput.approve).toEqual(Field(1))
    expect(proof1.publicOutput.disapprove).toEqual(Field(0))

    const witness3 = new MerkleTreeWitness(tree.getWitness(3n));

    const { proof: proof2 } = await VoteProgram.vote(Field(3), Field(1), state, witness3, proof1)
    proof = proof2
    proof.verify()

    expect(proof.publicOutput.approve).toEqual(Field(2))
    expect(proof.publicOutput.disapprove).toEqual(Field(0))
  })

  it('disapprove', async () => {

    const witness = new MerkleTreeWitness(tree.getWitness(4n));

    const { proof: proof1 } = await VoteProgram.vote(Field(4), Field(0), state, witness, proof)
    proof = proof1
    proof.verify()

    expect(proof.publicOutput.approve).toEqual(Field(2))
    expect(proof.publicOutput.disapprove).toEqual(Field(1))
  })
})