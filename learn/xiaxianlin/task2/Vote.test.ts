import { Bool, MerkleTree, Poseidon, PrivateKey, Proof } from 'o1js';
import { MerkleWitness20, Vote, VoteState } from './Vote.js';

describe('Vote', () => {
  it('ok', async () => {
    const memberTree = new MerkleTree(20);
    const members = [PrivateKey.random(), PrivateKey.random(), PrivateKey.random()];
    members.forEach((m, i) => memberTree.setLeaf(BigInt(i), Poseidon.hash(m.toPublicKey().toFields())));

    const vote = async (index: number, result: boolean, lastState: VoteState, lastProof: Proof<VoteState, void>) => {
      const member = members[index];
      const memberWitness = new MerkleWitness20(memberTree.getWitness(BigInt(index)));
      const nextState = VoteState.create(lastState, Bool(result), member.toPublicKey(), memberWitness);
      const { proof } = await Vote.vote(nextState, lastProof, Bool(result), member.toPublicKey(), memberWitness);
      return { state: nextState, proof };
    };

    await Vote.compile();

    let state = VoteState.init(memberTree.getRoot());
    let { proof } = await Vote.init(state);

    for (let i = 0; i < members.length; i++) {
      const res = await vote(i, i % 2 === 0, state, proof);
      state = res.state;
      proof = res.proof;
    }

    expect(proof.publicInput.agree.toString()).toEqual('2');
    expect(proof.publicInput.reject.toString()).toEqual('1');
    const ok = await Vote.verify(proof);
    expect(ok).toBeTruthy();
  });
});
