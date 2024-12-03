import {
  Bool,
  Field,
  JsonProof,
  MerkleTree,
  MerkleWitness,
  Proof,
  Provable,
  SelfProof,
  Struct,
  verify,
  ZkProgram,
} from 'o1js';

class VoteData extends Struct({
  teamRoot: Field,
  supportCount: Field,
  againstCount: Field,
}) {}

class MyMerkleWitness extends MerkleWitness(8) {}

const VoteProgram = ZkProgram({
  name: 'vote-program',
  publicOutput: VoteData,

  methods: {
    initState: {
      privateInputs: [Field],
      async method(treeRoot: Field) {
        const voteData = new VoteData({
          teamRoot: treeRoot,
          supportCount: Field(0),
          againstCount: Field(0),
        });

        voteData.supportCount.assertEquals(0);
        voteData.againstCount.assertEquals(0);

        return {
          publicOutput: voteData,
        };
      },
    },

    vote: {
      privateInputs: [MyMerkleWitness, Field, Bool, SelfProof],
      async method(
        merkleWitness: MyMerkleWitness,
        teamMember: Field,
        isSupport: Bool,
        prevProof: SelfProof<MyMerkleWitness, VoteData>
      ) {
        prevProof.verify();

        const voteData = { ...prevProof.publicOutput };

        const memberRoot = merkleWitness.calculateRoot(teamMember);
        voteData.teamRoot.assertEquals(memberRoot, 'teamMember 不属于该团队');

        voteData.supportCount = Provable.if(
          isSupport,
          voteData.supportCount.add(1),
          voteData.supportCount
        );
        voteData.againstCount = Provable.if(
          isSupport.not(),
          voteData.againstCount.add(1),
          voteData.againstCount
        );

        return {
          publicOutput: voteData,
        };
      },
    },
  },
});

// test cases

VoteProgram.publicOutputType satisfies Provable<VoteData>;

// let MyProof = ZkProgram.Proof(VoteProgram);

console.log('program digest', await VoteProgram.digest());

console.log('compiling VoteProgram...');
console.time('VoteProgram.compile time cost ');

let { verificationKey } = await VoteProgram.compile();

console.timeEnd('VoteProgram.compile time cost ');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

const tree = new MerkleTree(8);
tree.setLeaf(1n, Field(1));
tree.setLeaf(2n, Field(2));
tree.setLeaf(3n, Field(3));

const treeRoot = tree.getRoot();

console.log('proving base case...');
console.time('VoteProgram.initState time cost ');
let { proof } = await VoteProgram.initState(treeRoot);
console.timeEnd('VoteProgram.initState time cost ');
// proof = await testJsonRoundtrip(MyProof, proof);

console.log(
  'proving step 0...',
  `supportCount: ${proof.publicOutput.supportCount}`,
  `againstCount: ${proof.publicOutput.againstCount}`
);

console.log('verify...');
console.time('verify VoteProgram time cost ');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time cost ');
console.log('ok?', ok);

console.log('verify alternative...');
ok = await VoteProgram.verify(proof);
console.log('ok (alternative)?', ok);

console.log('proving step 1...');
console.time('VoteProgram.vote time cost ');
const witness_1 = new MyMerkleWitness(tree.getWitness(1n));
proof = (await VoteProgram.vote(witness_1, Field(1), Bool(true), proof)).proof;
console.timeEnd('VoteProgram.vote time cost ');
// proof = await testJsonRoundtrip(MyProof, proof);

console.log('verify...');
ok = await verify(proof, verificationKey);
console.log('ok?', ok);

console.log('verify alternative...');
ok = await VoteProgram.verify(proof);
console.log('ok (alternative)?', ok);

proof.publicOutput.supportCount.assertEquals(1);
proof.publicOutput.againstCount.assertEquals(0);
console.log('proving step 1 ok');

console.log('proving step 2...');
const witness_2 = new MyMerkleWitness(tree.getWitness(2n));
proof = (await VoteProgram.vote(witness_2, Field(2), Bool(false), proof)).proof;
// proof = await testJsonRoundtrip(MyProof, proof);

console.log('verify...');
ok = await verify(proof.toJSON(), verificationKey);

console.log('proving step 2...', 'ok?', ok);

console.log(
  'final result...',
  proof.publicOutput.supportCount.equals(1),
  proof.publicOutput.againstCount.equals(1)
);

console.log('proving step 3...');
const witness_3 = new MyMerkleWitness(tree.getWitness(4n));
proof = (await VoteProgram.vote(witness_3, Field(4), Bool(false), proof)).proof;
// proof = await testJsonRoundtrip(MyProof, proof);

console.log('verify...');
ok = await verify(proof.toJSON(), verificationKey);

console.log('proving step 2...', 'ok?', ok);

// function testJsonRoundtrip<
//   P extends Proof<any, any>,
//   MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
// >(MyProof: MyProof, proof: P) {
//   let jsonProof = proof.toJSON();
//   console.log(
//     'json proof',
//     JSON.stringify({
//       ...jsonProof,
//       proof: jsonProof.proof.slice(0, 10) + '..',
//     })
//   );
//   return MyProof.fromJSON(jsonProof);
// }
