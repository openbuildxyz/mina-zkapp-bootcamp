import {
  Struct,
  SelfProof,
  Bool,
  UInt32,
  ZkProgram,
  verify,
  Proof,
  JsonProof,
  Provable,
  PublicKey,
  Poseidon,
  MerkleTree,
  MerkleWitness,
} from 'o1js';

// Define Merkle Tree Parameters
const MERKLE_TREE_HEIGHT = 4;
class MyMerkleWitness extends MerkleWitness(MERKLE_TREE_HEIGHT) {}

// Initialize a Merkle tree
const merkleTree = new MerkleTree(MERKLE_TREE_HEIGHT);

// Add hashed public keys to the Merkle tree
const validAddresses = [
  'B62qjJaXMmZgaNecUUrDZ384uDQGYAAoTRTX7CAQ1YrBT6yo3gbzCCJ',
  'B62qmWgnatsvVwkL1iGHuE2BhNF8piikGz6zssM3espTZaaAKqnVvCU',
  'B62qpR2vB3fNGXE4a5ACiCvcX9rKaLgUnQGT993xrCSi1BjwiPm9fM5',
  'B62qkrx1iS5TtGZoGjFzepEbgkqnHwJ2KU8dFRKwqhDWaxYzp6Vf3Fu',
].map(PublicKey.fromBase58);

// Add hashed public keys to the Merkle tree
validAddresses.forEach((address, index) => {
  const leaf = Poseidon.hash(address.toFields());
  merkleTree.setLeaf(BigInt(index), leaf);
});

// Store the Merkle root
const merkleRoot = merkleTree.getRoot();

// Define an invalid address for test
const invalidAddress = PublicKey.fromBase58(
  'B62qpdHdu7MA3B7Yh5Fg1uLjp2dKohkHcoGA7HFP3G9uuhYQBxUBZga'
);

/**
 * Vote Record consists of:
 * - `voterAddress`: Voter Address;
 * - `voteChoice`: `true` for approve vote and `false` for disapprove vote.
 */
class VoteRecord extends Struct({
  voterAddress: PublicKey,
  merkleProof: MyMerkleWitness,
  voteChoice: Bool,
}) {}

class VoteCount extends Struct({
  approveCount: UInt32,
  disapproveCount: UInt32,
}) {}

/**
 * Vote Counter Program
 */
let MyProgram = ZkProgram({
  name: 'vote-counter',
  publicInput: VoteRecord,
  publicOutput: VoteCount,

  methods: {
    resetCounter: {
      privateInputs: [],
      async method() {
        return { approveCount: new UInt32(0), disapproveCount: new UInt32(0) };
      },
    },

    count: {
      privateInputs: [SelfProof],
      async method(
        publicInput: VoteRecord,
        earlierProof: SelfProof<VoteCount, VoteCount>
      ) {
        earlierProof.verify();

        // Hash the voter address
        const voterLeaf = Poseidon.hash(publicInput.voterAddress.toFields());

        // Verify Merkle proof
        publicInput.merkleProof
          .calculateRoot(voterLeaf)
          .assertEquals(merkleRoot, 'Voter address is not in the allowed list');

        // Get the current approval number from earlier proof.
        const approveCount = earlierProof.publicOutput.approveCount;
        const disapproveCount = earlierProof.publicOutput.disapproveCount;
        Provable.asProver(() => {
          console.log('approveCount:', approveCount.toString());
          console.log('disapproveCount:', disapproveCount.toString());
        });

        // If the vote is true, increase approval number by 1; else increase disapproval number by 1.
        const newApproveCount = Provable.if(
          publicInput.voteChoice,
          approveCount.add(1),
          approveCount
        );

        const newDisapproveCount = Provable.if(
          publicInput.voteChoice,
          disapproveCount,
          disapproveCount.add(1)
        );
        Provable.asProver(() => {
          console.log(
            'publicInput.voteChoice:',
            publicInput.voteChoice.toBoolean()
          );
          console.log('new approveCount:', newApproveCount.toString());
          console.log('new disapproveCount:', newDisapproveCount.toString());
        });

        return {
          approveCount: newApproveCount,
          disapproveCount: newDisapproveCount,
        };
      },
    },
  },
});

// Type sanity checks
MyProgram.publicInputType satisfies typeof VoteRecord;
MyProgram.publicOutputType satisfies typeof VoteCount;

let MyProof = ZkProgram.Proof(MyProgram);

console.log('program digest', await MyProgram.digest());

console.log('compiling MyProgram...');
console.time('MyProgram.compile time cost ');
let { verificationKey } = await MyProgram.compile();
console.timeEnd('MyProgram.compile time cost ');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');
console.log(
  '============================================================================================='
);

console.log('proving initial state...');
console.time('MyProgram.resetCounter time cost ');

// Create a VoteRecord with the Merkle proof
const voterIndex1 = 0; // Index of the voter in the validAddresses array
const voteRecord1 = new VoteRecord({
  voterAddress: validAddresses[voterIndex1],
  merkleProof: new MyMerkleWitness(merkleTree.getWitness(BigInt(voterIndex1))),
  voteChoice: Bool(true),
});

let proof = await MyProgram.resetCounter(voteRecord1);
console.timeEnd('MyProgram.resetCounter time cost ');
proof = await testJsonRoundtrip(MyProof, proof);

// type sanity check
proof satisfies Proof<VoteRecord, VoteCount>;

console.log('verifying ...');
console.time('verify MyProgram time cost ');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);

console.log('verifying alternative ...');
ok = await MyProgram.verify(proof);
console.log('ok (alternative)?', ok);
console.log(
  'initial approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'initial disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  '============================================================================================='
);

// Step 1: Input {validAddresses[0], true}
console.log('proving step 1...');
proof = await MyProgram.count(voteRecord1, proof);
console.log('verifying step 1...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 1 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 1 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 1 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '1' &&
    proof.publicOutput.disapproveCount.toString() === '0'
);
console.log(
  '============================================================================================='
);

// Step 2: Input {validAddresses[1], false}
console.log('proving step 2...');

// Generate a Merkle proof for a voter address
const voterIndex2 = 1;
const voteRecord2 = new VoteRecord({
  voterAddress: validAddresses[voterIndex2],
  merkleProof: new MyMerkleWitness(merkleTree.getWitness(BigInt(voterIndex2))),
  voteChoice: Bool(false),
});
proof = await MyProgram.count(voteRecord2, proof);
console.log('verifying step 2...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 2 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 2 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 2 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '1' &&
    proof.publicOutput.disapproveCount.toString() === '1'
);
console.log(
  '============================================================================================='
);

// Step 3: Input {validAddresses[2], true}
console.log('proving step 3...');

// Generate a Merkle proof for a voter address
const voterIndex3 = 2;
const voteRecord3 = new VoteRecord({
  voterAddress: validAddresses[voterIndex3],
  merkleProof: new MyMerkleWitness(merkleTree.getWitness(BigInt(voterIndex3))),
  voteChoice: Bool(true),
});
proof = await MyProgram.count(voteRecord3, proof);
console.log('verifying step 3...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 3 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 3 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 3 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '2' &&
    proof.publicOutput.disapproveCount.toString() === '1'
);
console.log(
  '============================================================================================='
);

// Step 4: Reset Counter
console.log('proving step 4...');
proof = await MyProgram.resetCounter(voteRecord3);
console.log('verifying step 4...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 4 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 4 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 4 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '0' &&
    proof.publicOutput.disapproveCount.toString() === '0'
);
console.log(
  '============================================================================================='
);

// Step 5: Input {validAddresses[3], false}
console.log('proving step 5...');

// Generate a Merkle proof for a voter address
const voterIndex4 = 3;
const voteRecord4 = new VoteRecord({
  voterAddress: validAddresses[voterIndex4],
  merkleProof: new MyMerkleWitness(merkleTree.getWitness(BigInt(voterIndex4))),
  voteChoice: Bool(false),
});
proof = await MyProgram.count(voteRecord4, proof);
console.log('verifying step 5...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 5 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 5 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 5 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '0' &&
    proof.publicOutput.disapproveCount.toString() === '1'
);
console.log(
  '============================================================================================='
);

// Step 6: Input {invalid address, true}
console.log('proving step 6...');
const voteRecord5 = new VoteRecord({
  voterAddress: invalidAddress,
  merkleProof: new MyMerkleWitness(merkleTree.getWitness(BigInt(voterIndex4))),
  voteChoice: Bool(true),
});
proof = await MyProgram.count(voteRecord5, proof);

/**
 * Helper function
 */
function testJsonRoundtrip<
  P extends Proof<any, any>,
  MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'json proof',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '..',
    })
  );
  return MyProof.fromJSON(jsonProof);
}
