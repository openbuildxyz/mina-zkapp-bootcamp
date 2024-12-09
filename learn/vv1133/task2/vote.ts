import {
  SelfProof,
  Field,
  ZkProgram,
  verify,
  Proof,
  JsonProof,
  Bool,
  MerkleTree,
  MerkleWitness,
  Provable,
  Struct,
} from 'o1js';

export class VoteStruct extends Struct({
  upCnt: Field,
  downCnt: Field,
  memberTreeRoot: Field,
  //Provable.Array(PublicKey, MEMBER_CNT)
}) {}

export class VoteMerkleWitness extends MerkleWitness(8) {}

export let VoteProgram = ZkProgram({
  name: 'Vote',
  publicInput: VoteStruct, // 必须和所有method的第一个参数类型一致
  //publicOutput: Field, // 必须和所有method的返回值类型一致

  methods: {
    voteInit: {
      privateInputs: [],
      async method(input: VoteStruct) {
        input.upCnt.assertEquals(Field(0)); // constraint
        input.downCnt.assertEquals(Field(0)); // constraint
      },
    },

    voteUpdate: {
      privateInputs: [VoteMerkleWitness, Field, Bool, SelfProof],
      async method(
        input: VoteStruct,
        witness: VoteMerkleWitness,
        memId: Field,
        isUp: Bool,
        earlierProof: SelfProof<VoteStruct, void>
      ) {
        Provable.log(`1) verify`);
        earlierProof.verify();

        Provable.log(`2) check member`);
        let root = witness.calculateRoot(Field(memId));
        root.assertEquals(earlierProof.publicInput.memberTreeRoot);

        Provable.log(`3) vote update`);
        const upOrDownCnt = Provable.if(
          isUp,
          earlierProof.publicInput.upCnt,
          earlierProof.publicInput.downCnt
        );
        const inputCnt = Provable.if(isUp, input.upCnt, input.downCnt);
        upOrDownCnt.add(1).assertEquals(inputCnt);
      },
    },
  },
});

//// type sanity checks
//VoteProgram.publicInputType satisfies typeof VoteStruct;
//VoteProgram.publicOutputType satisfies Provable<void>;
//
//let VoteProof = ZkProgram.Proof(VoteProgram);
//
//console.log('program digest', await VoteProgram.digest());
//
//// step1: compile
//console.log('compiling VoteProgram...');
//console.time('VoteProgram.compile time cost ');
//let { verificationKey } = await VoteProgram.compile();
//console.timeEnd('VoteProgram.compile time cost ');
//console.log('verification key', verificationKey.data.slice(0, 10) + '..');
//
//// step2: gen proof
//console.log('proving base case...');
//
//const merkleTree = new MerkleTree(8);
//merkleTree.setLeaf(0n, Field(100));
//merkleTree.setLeaf(1n, Field(101));
//merkleTree.setLeaf(2n, Field(102));
//const memberTreeRoot = merkleTree.getRoot();
//console.log('memberRoot', memberTreeRoot);
//
//console.time('VoteProgram.voteInit time cost ');
//let input = new VoteStruct({
//  upCnt: Field(0),
//  downCnt: Field(0),
//  memberTreeRoot: Field(memberTreeRoot),
//});
//let { proof } = await VoteProgram.voteInit(input);
//console.timeEnd('VoteProgram.voteInit time cost ');
//proof = await testJsonRoundtrip(VoteProof, proof);
//
//// type sanity check
//proof satisfies Proof<VoteStruct, void>;
//
//// step3: verify
//console.log('verify...');
//console.time('verify VoteProgram time cost ');
//let ok = await verify(proof.toJSON(), verificationKey);
//console.timeEnd('verify VoteProgram time cost ');
//console.log('ok?', ok);
//
//console.log('proving account 0...');
//console.time('VoteProgram.voteUpdate time cost ');
//input.upCnt = input.upCnt.add(1);
//
//let memberId = Field(100);
//let w = merkleTree.getWitness(0n);
//let witness = new VoteMerkleWitness(w);
//({ proof } = await VoteProgram.voteUpdate(
//  input,
//  witness,
//  memberId,
//  Bool(true),
//  proof
//));
//console.timeEnd('VoteProgram.voteUpdate time cost ');
//proof = await testJsonRoundtrip(VoteProof, proof);
//
//console.log('verify...');
//ok = await verify(proof.toJSON(), verificationKey);
//console.log('ok?', ok);
//
//console.log('verify alternative...');
//ok = await VoteProgram.verify(proof);
//console.log('ok (alternative)?', ok);
//
//console.log('proving account 1...');
//input.upCnt = input.upCnt.add(1);
//memberId = Field(101);
//w = merkleTree.getWitness(1n);
//witness = new VoteMerkleWitness(w);
//({ proof } = await VoteProgram.voteUpdate(
//  input,
//  witness,
//  memberId,
//  Bool(true),
//  proof
//));
//proof = await testJsonRoundtrip(VoteProof, proof);
//
//console.log('verify...');
//ok = await verify(proof.toJSON(), verificationKey);
//console.log('ok?', ok);
//
//console.log('verify alternative...');
//ok = await VoteProgram.verify(proof);
//console.log('ok (alternative)?', ok);
//
//console.log('proving account 2...');
//input.downCnt = input.downCnt.add(1);
//memberId = Field(102);
//w = merkleTree.getWitness(2n);
//witness = new VoteMerkleWitness(w);
//({ proof } = await VoteProgram.voteUpdate(
//  input,
//  witness,
//  memberId,
//  Bool(false),
//  proof
//));
//proof = await testJsonRoundtrip(VoteProof, proof);
//
//console.log('verify...');
//ok = await verify(proof.toJSON(), verificationKey);
//console.log('ok?', ok);
//
//console.log('verify alternative...');
//ok = await VoteProgram.verify(proof);
//console.log('ok (alternative)?', ok);
//
//function testJsonRoundtrip<
//  P extends Proof<any, any>,
//  VoteProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
//>(VoteProof: VoteProof, proof: P) {
//  let jsonProof = proof.toJSON();
//  console.log(
//    'json proof',
//    JSON.stringify({
//      ...jsonProof,
//      proof: jsonProof.proof.slice(0, 10) + '..',
//    })
//  );
//  return VoteProof.fromJSON(jsonProof);
//}
