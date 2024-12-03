import { Field, MerkleTree, SelfProof } from 'o1js';
import {
  treeHeight,
  voteProgram,
  MerkleTreeWitness,
  MainProgramState,
} from './vote';

describe('vote', () => {
  const tree = new MerkleTree(treeHeight);
  tree.setLeaf(1n, Field(1));
  tree.setLeaf(2n, Field(2));
  tree.setLeaf(3n, Field(3));
  tree.setLeaf(4n, Field(4));

  const rootBefore = tree.getRoot();

  const state = new MainProgramState({
    treeRoot: rootBefore,
    agree: Field(0),
    against: Field(0),
  });
  let proof: SelfProof<void, MainProgramState>;

  beforeAll(async () => {
    await voteProgram.compile();
  });

  it('base', async () => {
    const witness = new MerkleTreeWitness(tree.getWitness(1n));
    const { proof: baseProof } = await voteProgram.base(state, witness);

    proof = baseProof;
    proof.verify();

    expect(proof.publicOutput.agree).toEqual(Field(0));
    expect(proof.publicOutput.against).toEqual(Field(0));
  });

  it('agree', async () => {
    const witness = new MerkleTreeWitness(tree.getWitness(2n));
    const { proof: agreeProof1 } = await voteProgram.vote(
      Field(2),
      Field(1),
      state,
      witness,
      proof
    );

    proof = agreeProof1;
    proof.verify();
    
    expect(proof.publicOutput.agree).toEqual(Field(1));
    expect(proof.publicOutput.against).toEqual(Field(0));
  });

  it('against', async () => {
    const witness1 = new MerkleTreeWitness(tree.getWitness(3n));
    const { proof: againstProof1 } = await voteProgram.vote(
      Field(3),
      Field(0),
      state,
      witness1,
      proof
    );
    againstProof1.verify();
    expect(againstProof1.publicOutput.agree).toEqual(Field(1));
    expect(againstProof1.publicOutput.against).toEqual(Field(1));

    const witness2 = new MerkleTreeWitness(tree.getWitness(4n));
    const { proof: againstProof2 } = await voteProgram.vote(
      Field(4),
      Field(0),
      state,
      witness2,
      againstProof1
    );
    proof = againstProof2;
    proof.verify();
    expect(proof.publicOutput.agree).toEqual(Field(1));
    expect(proof.publicOutput.against).toEqual(Field(2));
  });
});
