import { Result, VoteProgram, MyMerkleWitness } from './vote';
import { SelfProof, Field, MerkleTree, Poseidon } from 'o1js';

describe('VoteProgram', () => {
  let merkleTree: MerkleTree;
  let root: Field;
  let initialProof: SelfProof<Field, Result>;
  const TREE_HEIGHT = 8;
  const INITIAL_MEMBER_INDEX = 0n;

  beforeAll(async () => {
    await VoteProgram.compile();
    
    merkleTree = new MerkleTree(TREE_HEIGHT);
    const initialLeaf = Poseidon.hash([Field(0)]);
    merkleTree.setLeaf(INITIAL_MEMBER_INDEX, initialLeaf);
    root = merkleTree.getRoot();

    initialProof = await VoteProgram.init(Field(0), root);
  });

  test('should initialize VoteProgram correctly', async () => {
    const { publicOutput } = await initialProof;
    
    expect(publicOutput).toEqual({
      root: root,
      approveCount: Field(0),
      rejectCount: Field(0)
    });
  });

  test('should process a vote correctly', async () => {
    const memberValue = Field(1);
    const member = Poseidon.hash([memberValue]);
    const proofPath = new MyMerkleWitness(
      merkleTree.getWitness(INITIAL_MEMBER_INDEX)
    );
    
    merkleTree.setLeaf(INITIAL_MEMBER_INDEX, member);
    const newRoot = merkleTree.getRoot();

    const vote = Field(1);
    const resultProof = await VoteProgram.voteMethod(
      memberValue,
      vote,
      member,
      proofPath,
      initialProof
    );

    const { publicOutput } = resultProof;
    expect(publicOutput.root.equals(newRoot)).toBeTruthy();
    expect(publicOutput.approveCount.equals(Field(1))).toBeTruthy();
    expect(publicOutput.rejectCount.equals(Field(0))).toBeTruthy();
  });

  test('should reject invalid vote', async () => {
    const memberValue = Field(1);
    const member = Poseidon.hash([memberValue]);
    const invalidVote = Field(2);
    const proofPath = new MyMerkleWitness(
      merkleTree.getWitness(INITIAL_MEMBER_INDEX)
    );

    await expect(async () => {
      await VoteProgram.voteMethod(
        memberValue,
        invalidVote,
        member,
        proofPath,
        initialProof
      );
    }).rejects.toThrow();
  });
});