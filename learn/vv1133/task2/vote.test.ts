import { VoteProgram, VoteStruct, VoteMerkleWitness } from './vote';
import { ZkProgram, MerkleTree, Bool, Field, Proof, JsonProof } from 'o1js';

function testJsonRoundtrip<
  P extends Proof<any, any>,
  VoteProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(VoteProof: VoteProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'json proof',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '..',
    })
  );
  return VoteProof.fromJSON(jsonProof);
}

describe('Vote', () => {
  let input: VoteStruct,
    verificationKey: {
      data: string;
      hash: Field;
    },
    proof: any,
    merkleTree: MerkleTree;
  let VoteProof = ZkProgram.Proof(VoteProgram);

  beforeAll(async () => {
    console.log('compile start');
    ({ verificationKey } = await VoteProgram.compile());
    merkleTree = new MerkleTree(8);
    merkleTree.setLeaf(0n, Field(100));
    merkleTree.setLeaf(1n, Field(101));
    merkleTree.setLeaf(2n, Field(102));
    const memberTreeRoot = merkleTree.getRoot();
    //console.log('memberRoot', memberTreeRoot);

    input = new VoteStruct({
      upCnt: Field(0),
      downCnt: Field(0),
      memberTreeRoot: memberTreeRoot,
    });
  });

  it('vote init', async () => {
    ({ proof } = await VoteProgram.voteInit(input));
    proof = await testJsonRoundtrip(VoteProof, proof);
    let verify = await VoteProgram.verify(proof);
    expect(verify).toEqual(true);
  });

  it('vote up', async () => {
    input.upCnt = input.upCnt.add(1);
    let memberId = Field(101);
    let w = merkleTree.getWitness(1n);
    let witness = new VoteMerkleWitness(w);
    ({ proof } = await VoteProgram.voteUpdate(
      input,
      witness,
      memberId,
      Bool(true),
      proof
    ));
    proof = await testJsonRoundtrip(VoteProof, proof);
    let verify = await VoteProgram.verify(proof);
    expect(verify).toEqual(true);
  });

  it('vote down', async () => {
    input.downCnt = input.downCnt.add(1);
    let memberId = Field(102);
    let w = merkleTree.getWitness(2n);
    let witness = new VoteMerkleWitness(w);
    ({ proof } = await VoteProgram.voteUpdate(
      input,
      witness,
      memberId,
      Bool(false),
      proof
    ));
    proof = await testJsonRoundtrip(VoteProof, proof);
    let verify = await VoteProgram.verify(proof);
    expect(verify).toEqual(true);
  });

  //it('member without authority should fail', async () => {
  //  input.downCnt = input.downCnt.add(1);
  //  let memberId = Field(1000);
  //  let w = merkleTree.getWitness(100n);
  //  let witness = new VoteMerkleWitness(w);
  //  ({ proof } = await VoteProgram.voteUpdate(
  //    input,
  //    witness,
  //    memberId,
  //    Bool(false),
  //    proof
  //  ));
  //  proof = await testJsonRoundtrip(VoteProof, proof);
  //  let verify = await VoteProgram.verify(proof);
  //  expect(verify).toEqual(false);
  //});
});
