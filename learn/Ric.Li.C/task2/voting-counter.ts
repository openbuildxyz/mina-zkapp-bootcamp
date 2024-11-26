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
} from 'o1js';

/**
 * Voting state consists of:
 * - `voterID`: Vote ID.
 * - `vote`: `true` for approve vote and `false` for disapprove vote.
 */
class VotingState extends Struct({
  voterID: Field,
  vote: Bool,
}) {}

class VotingCount extends Struct({
  approveNumber: Field,
  disapproveNumber: Field,
}) {}

/**
 * Voting Counter Program
 */
let MyProgram = ZkProgram({
  name: 'voting-counter',
  publicInput: VotingState,
  publicOutput: VotingCount,

  methods: {
    initialState: {
      privateInputs: [],
      async method(publicInput: VotingState) {
        publicInput.voterID.assertEquals(new Field(0)); // constraint
        return { approveNumber: new Field(0), disapproveNumber: new Field(0) };
      },
    },

    count: {
      privateInputs: [SelfProof],
      async method(
        publicInput: VotingState,
        earlierProof: SelfProof<VotingCount, VotingCount>
      ) {
        earlierProof.verify();

        // Assume there are only 100 voters.
        // Voter ID should bigger than 0, and less than or equal to 100.
        publicInput.voterID.assertGreaterThan(0);
        publicInput.voterID.assertLessThanOrEqual(100);

        // Get the current approval number from earlier proof.
        let approveCount = earlierProof.publicOutput.approveNumber;
        let disapproveCount = earlierProof.publicOutput.disapproveNumber;
        Provable.asProver(() => {
          console.log('approveCount:', approveCount.toString());
          console.log('disapproveCount:', disapproveCount.toString());
        });

        // If the vote is true, increase approval number by 1; else increase disapproval number by 1.
        let newApproveCount = Provable.if(
          publicInput.vote,
          approveCount.add(1),
          approveCount
        );

        let newDisapproveCount = Provable.if(
          publicInput.vote,
          disapproveCount,
          disapproveCount.add(1)
        );
        Provable.asProver(() => {
          console.log('publicInput.vote:', publicInput.vote.toBoolean());
          console.log('new approveCount:', newApproveCount.toString());
          console.log('new disapproveCount:', newDisapproveCount.toString());
        });

        return {
          approveNumber: newApproveCount,
          disapproveNumber: newDisapproveCount,
        };
      },
    },
  },
});

// Type sanity checks
MyProgram.publicInputType satisfies typeof VotingState;
MyProgram.publicOutputType satisfies typeof VotingCount;

let MyProof = ZkProgram.Proof(MyProgram);

console.log('program digest', await MyProgram.digest());

console.log('compiling MyProgram...');
console.time('MyProgram.compile time cost ');
let { verificationKey } = await MyProgram.compile();
console.timeEnd('MyProgram.compile time cost ');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');
console.log(
  '======================================================================================'
);

console.log('proving initial state...');
console.time('MyProgram.initialState time cost ');
let input = new VotingState({ voterID: Field(0), vote: Bool(false) });
let proof = await MyProgram.initialState(input);
console.timeEnd('MyProgram.initialState time cost ');
proof = await testJsonRoundtrip(MyProof, proof);

// type sanity check
proof satisfies Proof<VotingState, VotingCount>;

console.log('verify...');
console.time('verify MyProgram time cost ');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);

console.log('verify alternative...');
ok = await MyProgram.verify(proof);
console.log('ok (alternative)?', ok);
console.log(
  'initial approve count is',
  proof.publicOutput.approveNumber.toString()
);
console.log(
  'initial disapprove count is',
  proof.publicOutput.disapproveNumber.toString()
);
console.log(
  '======================================================================================'
);

// Step 1: Input {1, true}
console.log('proving step 1...');
let votingState1 = new VotingState({ voterID: Field(1), vote: Bool(true) });
proof = await MyProgram.count(votingState1, proof);
console.log('verify step 1...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 1 approve count is',
  proof.publicOutput.approveNumber.toString()
);
console.log(
  'step 1 disapprove count is',
  proof.publicOutput.disapproveNumber.toString()
);
console.log(
  'step 1 ok?',
  ok &&
    proof.publicOutput.approveNumber.toString() === '1' &&
    proof.publicOutput.disapproveNumber.toString() === '0'
);
console.log(
  '======================================================================================'
);

// Step 2: Input {2, false}
console.log('proving step 2...');
let votingState2 = new VotingState({ voterID: Field(2), vote: Bool(false) });
proof = await MyProgram.count(votingState2, proof);
console.log('verify step 2...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 2 approve count is',
  proof.publicOutput.approveNumber.toString()
);
console.log(
  'step 2 disapprove count is',
  proof.publicOutput.disapproveNumber.toString()
);
console.log(
  'step 2 ok?',
  ok &&
    proof.publicOutput.approveNumber.toString() === '1' &&
    proof.publicOutput.disapproveNumber.toString() === '1'
);
console.log(
  '======================================================================================'
);

// Step 3: Input {3, true}
console.log('proving step 3...');
let votingState3 = new VotingState({ voterID: Field(3), vote: Bool(true) });
proof = await MyProgram.count(votingState3, proof);
console.log('verify step 3...');
ok = await verify(proof.toJSON(), verificationKey);
console.log(
  'step 3 approve count is',
  proof.publicOutput.approveNumber.toString()
);
console.log(
  'step 3 disapprove count is',
  proof.publicOutput.disapproveNumber.toString()
);
console.log(
  'step 3 ok?',
  ok &&
    proof.publicOutput.approveNumber.toString() === '2' &&
    proof.publicOutput.disapproveNumber.toString() === '1'
);

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
