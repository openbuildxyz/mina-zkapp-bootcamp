/*
 * @Date: 2024-11-26 19:30:37
 * @LastEditors: TinyScript
 * @LastEditTime: 2024-11-30 22:26:28
 * @FilePath: /sudoku/Users/bzp/tiny/web3/mina-ethsz/contracts/src/vote/Vote.ts
 */
import { Bool, Field, Provable, PublicKey, SelfProof, Struct, ZkProgram, verify } from "o1js";

class VoterState extends Struct ({
  voterId: Field,
  vote: Bool
}) {}

class VoteResult extends Struct ({
  approve: Field,
  disapprove: Field
}) {}

const TeamList = [new Field(1), new Field(2), new Field(3)];

export const VoteProgram = ZkProgram({
  name: 'votor',
  publicInput: VoterState,
  publicOutput: VoteResult,
  
  methods: {
    init: {
      privateInputs: [],
      async method(publicInput: VoterState) {
        publicInput.voterId.assertEquals(new Field(0));
        return { approve: new Field(0), disapprove: new Field(0) };
      }
    },
    count: {
      privateInputs: [SelfProof],
      async method(
        publicInput: VoterState,
        earlierProof: SelfProof<VoteResult, VoteResult>
      ) {
        earlierProof.verify();

        const isTeamMember = Provable.if(
          publicInput.voterId.equals(TeamList[0])
          .or(publicInput.voterId.equals(TeamList[1]))
          .or(publicInput.voterId.equals(TeamList[2])),
          Bool(true),
          Bool(false)
        );

        // isTeamMember.assertTrue(`current voter id: ${publicInput.voterId}, is not team member`);

        const approveCount = earlierProof.publicOutput.approve;
        const disapproveCount = earlierProof.publicOutput.disapprove;

        Provable.asProver(() => {
          console.log('curr vote before data: ');
          console.log('approveCount', approveCount.toString());
          console.log('disapproveCount', disapproveCount.toString());
          console.log('==================');
        })

        const lastApproveCount = Provable.if(
          isTeamMember.and(publicInput.vote),
          approveCount.add(1),
          approveCount
        );

        const lastDisapproveCount = Provable.if(
          isTeamMember.and(publicInput.vote),
          disapproveCount,
          disapproveCount.add(1)
        );

        Provable.asProver(() => {
          console.log('curr vote result data: ');
          console.log('vote: ', publicInput.vote.toBoolean());
          console.log('lastApproveCount: ', lastApproveCount.toString())
          console.log('lastDisapproveCount: ', lastDisapproveCount.toString())
          console.log('==================');
        })

        return {
          approve: lastApproveCount,
          disapprove: lastDisapproveCount
        }
      }
    }
  }
});

const programDigest = await VoteProgram.digest();
console.log('program digest', programDigest);

console.log('compile: ');

console.time('compile time')
const { verificationKey } = await VoteProgram.compile();
console.timeEnd('compile time')

console.log('verification key: ', verificationKey.data.slice(0, 10) + '..');
console.log('===================');

console.log('prove init state: ');
console.time('init time');
const input = new VoterState({ voterId: Field(0), vote: Bool(false)});
const proof = await VoteProgram.init(input);
console.timeEnd('init time');


console.log('verify: ')
console.time('verify VoteProgram time')
const ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time')

console.log('verify result is ok: ', ok);

console.log('verify alternative: ')
console.time('verify VoteProgram time')
const okAlternative = await VoteProgram.verify(proof);
console.timeEnd('verify VoteProgram time')

console.log('verify result is ok(alternative): ', okAlternative);

console.log('init approve count: ', proof.publicOutput.approve.toString());
console.log('init disapprove count: ', proof.publicOutput.disapprove.toString());

console.log('init state finished.');
console.log('===================');

console.log('first prove: ');

const voteStateFirst = new VoterState({ voterId: Field(1), vote: Bool(true)});
const proofFirst = await VoteProgram.count(voteStateFirst, proof);
const okFirst = await verify(proofFirst.toJSON(), verificationKey);

console.log('first approve result: ', proofFirst.publicOutput.approve.toString());
console.log('first disapprove result: ', proofFirst.publicOutput.disapprove.toString());

console.log(
  'first prove result: ', 
  okFirst 
  && proofFirst.publicOutput.approve.toString() === '1' 
  && proofFirst.publicOutput.disapprove.toString() === '0'
);
console.log('first prove finished.');

console.log('===================');

console.log('second prove: ');
const voteStateSecond = new VoterState({ voterId: Field(2), vote: Bool(false)});
const proofSecond = await VoteProgram.count(voteStateSecond, proofFirst);
const okSecond = await verify(proofSecond.toJSON(), verificationKey);

console.log('second approve result: ', proofSecond.publicOutput.approve.toString());
console.log('second disapprove result: ', proofSecond.publicOutput.disapprove.toString());
console.log(
  'second prove result: ', 
  okSecond
  && proofSecond.publicOutput.approve.toString() === '1' 
  && proofSecond.publicOutput.disapprove.toString() === '1'
)
console.log('second prove finished.');

console.log('===================');

console.log('third prove: ');
const voteStateThird = new VoterState({ voterId: Field(3), vote: Bool(false)});
const proofThird = await VoteProgram.count(voteStateThird, proofSecond);
const okThird = await verify(proofThird.toJSON(), verificationKey);

console.log('third approve result: ', proofThird.publicOutput.approve.toString());
console.log('third disapprove result: ', proofThird.publicOutput.disapprove.toString());
console.log(
  'third prove result: ',
  okThird
  && proofThird.publicOutput.approve.toString() === '1' 
  && proofThird.publicOutput.disapprove.toString() === '2'
)

console.log('third prove finished.');
console.log('===================');

console.log('fourth prove: ');
const voteStateFourth = new VoterState({ voterId: Field(4), vote: Bool(false)});
const proofFourth = await VoteProgram.count(voteStateFourth, proofSecond);
const okFourth = await verify(proofFourth.toJSON(), verificationKey);

console.log('fourth approve result: ', proofFourth.publicOutput.approve.toString());
console.log('fourth disapprove result: ', proofFourth.publicOutput.disapprove.toString());
console.log(
  'fourth prove result: ',
  okFourth
  && proofFourth.publicOutput.approve.toString() === '1' 
  && proofFourth.publicOutput.disapprove.toString() === '2'
)

console.log('fourth prove finished.');
console.log('===================');

console.log('approve count total: ', proofFourth.publicOutput.approve.toString());
console.log('disapprove count total: ', proofFourth.publicOutput.disapprove.toString());
