// 设计一个简单的投票统计器用于小团队内部投票，要求能累积统计出赞成票和反对票的票数。
// 考虑检查投票者属于团队成员，假设队员不会重复投票。

import {
  Field,
  Bool,
  Struct,
  SelfProof,
  ZkProgram,
  Provable,
  Proof,
  JsonProof,
  verify,
} from 'o1js';

export class Voter extends Struct({
  id: Field, // id
  voteOption: Bool, // assist true against: false
}) {}
export class VoteCounts extends Struct({
  totalVotesYes: Field,
  totalVotesNo: Field,
}) {}

const memberIds = [Field(0), Field(1), Field(2), Field(3)];

/**
 * 投票统计器，统计赞成票和反对票。
 */
let VoteProgram = ZkProgram({
  name: 'Vote-Program',
  publicInput: VoteCounts,

  methods: {
    initVote: {
      privateInputs: [],
      async method(initVote: VoteCounts) {
        initVote.totalVotesYes.assertEquals(Field(0));
        initVote.totalVotesNo.assertEquals(Field(0));
      },
    },
    vote: {
      privateInputs: [Voter, SelfProof],
      async method(
        publicInput: VoteCounts,
        privateInput: Voter,
        earlierProof: SelfProof<Bool, VoteCounts>
      ) {
        Provable.log(`1) earlierProof.verify`);
        earlierProof.verify();

        Provable.log(`2) check member`);
        const { id, voteOption } = privateInput;
        const isMember = memberIds.reduce(
          (acc, i) => acc.or(id.equals(i)),
          Bool(false)
        );
        isMember.assertTrue();

        Provable.log(`3) earlierProof.publicOutput.vote.add`);
        const earlyTotalYes = (earlierProof.publicInput as any).totalVotesYes;
        const earlyTotalNo = (earlierProof.publicInput as any).totalVotesNo;

        const { totalVotesYes, totalVotesNo } = publicInput;

        // check vote count
        const earlier = Provable.if(voteOption, earlyTotalYes, earlyTotalNo);
        const now = Provable.if(voteOption, totalVotesYes, totalVotesNo);

        earlier.add(1).assertEquals(now);
      },
    },
  },
});

VoteProgram.publicInputType satisfies typeof VoteCounts;
VoteProgram.publicOutputType satisfies Provable<void>;

let VoteProof = ZkProgram.Proof(VoteProgram);

console.log('compiling VoteProgram...');
let { verificationKey } = await VoteProgram.compile();
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

// init
console.log('proving base case...');
const initialVotes = new VoteCounts({
  totalVotesYes: Field(0),
  totalVotesNo: Field(0),
});
let { proof } = await VoteProgram.initVote(initialVotes);
proof = await testJsonRoundtrip(VoteProof, proof);

// type sanity check
proof satisfies Proof<VoteCounts, void>;

console.log('verify...');
let ok = await verify(proof.toJSON(), verificationKey);
console.log('initVote ok?', ok);

console.log('verify alternative...');
ok = await VoteProgram.verify(proof);
console.log('ok (alternative)?', ok);

console.log('member 1 vote yes');
let voter = new Voter({
  id: Field(0),
  voteOption: Bool(true),
});
let updatedVotes = new VoteCounts({
  totalVotesYes: Field(1),
  totalVotesNo: Field(0),
});

let voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log(`id: ${voter.id} vote is ok ?  ${ok}`);
console.log(
  `Now votes is:  Yes: ${updatedVotes.totalVotesYes} No: ${updatedVotes.totalVotesNo}`
);
ok = await VoteProgram.verify(proof);
console.log('verify ok?', ok, '\n');

console.log('member 2 vote no');
voter = new Voter({
  id: Field(1),
  voteOption: Bool(false),
});
updatedVotes = new VoteCounts({
  totalVotesYes: Field(1),
  totalVotesNo: Field(1),
});

voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log(`id: ${voter.id} vote is ok ?  ${ok}`);
console.log(
  `Now votes is:  Yes: ${updatedVotes.totalVotesYes} No: ${updatedVotes.totalVotesNo}`
);
ok = await VoteProgram.verify(proof);
console.log('verify ok?', ok, '\n');

console.log('member 3 vote yes');
voter = new Voter({
  id: Field(2),
  voteOption: Bool(true),
});
updatedVotes = new VoteCounts({
  totalVotesYes: Field(2),
  totalVotesNo: Field(1),
});

voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log(`id: ${voter.id} vote is ok ?  ${ok}`);
console.log(
  `Now votes is:  Yes: ${updatedVotes.totalVotesYes} No: ${updatedVotes.totalVotesNo}`
);
ok = await VoteProgram.verify(proof);
console.log('verify ok?', ok, '\n');

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
