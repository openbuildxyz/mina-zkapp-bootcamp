import { Bool, MerkleTree, Poseidon, PrivateKey, Proof } from 'o1js';
import { MerkleWitness20, Vote, VoteState } from './Vote.js';

describe('Vote', () => {
  it('ok', async () => {
    const members = generateRandomMembers(3);
    const memberTree = createMerkleTree(members);

    const vote = async (index: number, result: boolean, lastState: VoteState, lastProof: Proof<VoteState, void>) => {
      const member = members[index];
      return await castVote(member, index, result, lastState, lastProof, memberTree);
    };

    await Vote.compile();

    let state = VoteState.init(memberTree.getRoot());
    let { proof } = await Vote.init(state);

    for (let i = 0; i < members.length; i++) {
      const res = await vote(i, i % 2 === 0, state, proof);
      state = res.state;
      proof = res.proof;
    }

    checkResults(proof, '2', '1');
  });
});

function generateRandomMembers(count: number): PrivateKey[] {
  return Array.from({ length: count }, () => PrivateKey.random());
}

function createMerkleTree(members: PrivateKey[]): MerkleTree {
  const tree = new MerkleTree(20);
  members.forEach((member, index) => {
    tree.setLeaf(BigInt(index), Poseidon.hash(member.toPublicKey().toFields()));
  });
  return tree;
}

async function castVote(
  member: PrivateKey,
  index: number,
  result: boolean,
  lastState: VoteState,
  lastProof: Proof<VoteState, void>,
  memberTree: MerkleTree
) {
  const memberWitness = new MerkleWitness20(memberTree.getWitness(BigInt(index)));
  const nextState = VoteState.create(lastState, Bool(result), member.toPublicKey(), memberWitness);
  const { proof } = await Vote.vote(nextState, lastProof, Bool(result), member.toPublicKey(), memberWitness);
  return { state: nextState, proof };
}

function checkResults(proof: Proof<VoteState, void>, expectedAgree: string, expectedReject: string) {
  expect(proof.publicInput.agree.toString()).toEqual(expectedAgree);
  expect(proof.publicInput.reject.toString()).toEqual(expectedReject);
  const ok = await Proof.verify(proof);
  expect(ok).toBeTruthy();
}
