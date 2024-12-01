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
} from 'o1js';

// Define the set of valid addresses (hashed public keys).
const validAddresses = [
  'B62qjJaXMmZgaNecUUrDZ384uDQGYAAoTRTX7CAQ1YrBT6yo3gbzCCJ',
  'B62qmWgnatsvVwkL1iGHuE2BhNF8piikGz6zssM3espTZaaAKqnVvCU',
  'B62qpR2vB3fNGXE4a5ACiCvcX9rKaLgUnQGT993xrCSi1BjwiPm9fM5',
  'B62qkrx1iS5TtGZoGjFzepEbgkqnHwJ2KU8dFRKwqhDWaxYzp6Vf3Fu',
].map(PublicKey.fromBase58);

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
  approveCount: UInt32,
  disapproveCount: UInt32,
}) {}

function toBool(b: boolean): Bool {
  if(b){
    return Bool(true);
  }else{
    return  Bool(false);
  }
  
}
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

        // Check if the voter address is valid.
        const userAddress = publicInput.voterAddress;
        const isValidAddress = Provable.if(
          userAddress
            .equals(validAddresses[0])
            .or(userAddress.equals(validAddresses[1]))
            .or(userAddress.equals(validAddresses[2]))
            .or(userAddress.equals(validAddresses[3])),
          Bool(true),
          Bool(false)
        );

        // const isValidAddress = Provable.if(
        //   toBool(validAddresses.includes(userAddress)),
        //   Bool(true),
        //   Bool(false)
        // );
        
        isValidAddress.assertTrue('Voter address is not in the allowed list');

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
const initialInput = new VoteRecord({
  voterAddress: validAddresses[0],
  voteChoice: Bool(true),
});
let proof = await MyProgram.resetCounter(initialInput);
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
const voteRecord1 = new VoteRecord({
  voterAddress: validAddresses[0],
  voteChoice: Bool(true),
});
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
const voteRecord2 = new VoteRecord({
  voterAddress: validAddresses[1],
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
const voteRecord3 = new VoteRecord({
  voterAddress: validAddresses[2],
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
const resetInput = new VoteRecord({
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
const voteRecord5 = new VoteRecord({
  voterAddress: validAddresses[3],
  voteChoice: Bool(false),
});
proof = await MyProgram.count(voteRecord5, proof);
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
console.log('verifying step 6...');
const voteRecord6 = new VoteRecord({
  voterAddress: invalidAddress,
  voteChoice: Bool(true),
});

try {
  proof = await MyProgram.count(voteRecord6, proof);
  throw new Error('Expected revert but did not happen.');
} catch (error) {
  // console.log('Caught error:', error); // Log the entire error object

  if (error instanceof Error) {
    // console.log('Error message:', error.message); // Log the error message separately
    if (error.message.includes('Voter address is not in the allowed list')) {
      console.log('step 6 is ok');
    } else {
      console.error('Unexpected error message:', error.message);
    }
  } else {
    console.error('Unexpected error type:', error);
  }
}

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