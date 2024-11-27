import {
  Struct,
  SelfProof,
  Bool,
  Field,
  ZkProgram,
  verify,
  Proof,
  JsonProof,
  Provable,
  PublicKey,
} from 'o1js';

// Define the set of valid addresses (hashed public keys).
const validAddresses = [
  PublicKey.fromBase58(
    'B62qjJaXMmZgaNecUUrDZ384uDQGYAAoTRTX7CAQ1YrBT6yo3gbzCCJ'
  ),
  PublicKey.fromBase58(
    'B62qmWgnatsvVwkL1iGHuE2BhNF8piikGz6zssM3espTZaaAKqnVvCU'
  ),
  PublicKey.fromBase58(
    'B62qpR2vB3fNGXE4a5ACiCvcX9rKaLgUnQGT993xrCSi1BjwiPm9fM5'
  ),
  PublicKey.fromBase58(
    'B62qkrx1iS5TtGZoGjFzepEbgkqnHwJ2KU8dFRKwqhDWaxYzp6Vf3Fu'
  ),
];

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
  voteChoice: Bool,
}) {}

class VoteCount extends Struct({
  approveCount: Field,
  disapproveCount: Field,
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
        return { approveCount: new Field(0), disapproveCount: new Field(0) };
      },
    },

    count: {
      privateInputs: [SelfProof],
      async method(
        publicInput: VoteRecord,
        earlierProof: SelfProof<VoteCount, VoteCount>
      ) {
        earlierProof.verify();

        // Check if the voter address is valid.
        let userAddress = publicInput.voterAddress;
        let isValidAddress = Provable.if(
          userAddress
            .equals(validAddresses[0])
            .or(userAddress.equals(validAddresses[1]))
            .or(userAddress.equals(validAddresses[2]))
            .or(userAddress.equals(validAddresses[3])),
          Bool(true),
          Bool(false)
        );
        isValidAddress.assertTrue('not valid voter');

        // Get the current approval number from earlier proof.
        let approveCount = earlierProof.publicOutput.approveCount;
        let disapproveCount = earlierProof.publicOutput.disapproveCount;
        Provable.asProver(() => {
          console.log('approveCount:', approveCount.toString());
          console.log('disapproveCount:', disapproveCount.toString());
        });

        // If the vote is true, increase approval number by 1; else increase disapproval number by 1.
        let newApproveCount = Provable.if(
          publicInput.voteChoice,
          approveCount.add(1),
          approveCount
        );

        let newDisapproveCount = Provable.if(
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
let input = new VoteRecord({
  voterAddress: validAddresses[0],
  voteChoice: Bool(true),
});
let proof = await MyProgram.resetCounter(input);
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
let VoteRecord1 = new VoteRecord({
  voterAddress: validAddresses[0],
  voteChoice: Bool(true),
});
proof = await MyProgram.count(VoteRecord1, proof);
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
let VoteRecord2 = new VoteRecord({
  voterAddress: validAddresses[1],
  voteChoice: Bool(false),
});
proof = await MyProgram.count(VoteRecord2, proof);
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
let VoteRecord3 = new VoteRecord({
  voterAddress: validAddresses[2],
  voteChoice: Bool(true),
});
proof = await MyProgram.count(VoteRecord3, proof);
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
let resetInput = new VoteRecord({
  voterAddress: validAddresses[3],
  voteChoice: Bool(false),
});
proof = await MyProgram.resetCounter(resetInput);
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
let VoteRecord5 = new VoteRecord({
  voterAddress: validAddresses[3],
  voteChoice: Bool(false),
});
proof = await MyProgram.count(VoteRecord5, proof);
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
let VoteRecord6 = new VoteRecord({
  voterAddress: invalidAddress,
  voteChoice: Bool(true),
});
proof = await MyProgram.count(VoteRecord6, proof);
console.log('verifying step 6...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 6 approve count is',
  proof.publicOutput.approveCount.toString()
);
console.log(
  'step 6 disapprove count is',
  proof.publicOutput.disapproveCount.toString()
);
console.log(
  'step 6 ok?',
  ok &&
    proof.publicOutput.approveCount.toString() === '0' &&
    proof.publicOutput.disapproveCount.toString() === '1'
);

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
