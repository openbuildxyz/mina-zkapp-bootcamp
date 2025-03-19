import { VoteProgram, CountVotes, Voter } from './vote.js';
import { Bool, Field, JsonProof, Proof, Provable, PublicKey, SelfProof, Struct, verify, ZkProgram } from 'o1js';

VoteProgram.publicInputType satisfies typeof CountVotes;
VoteProgram.publicOutputType satisfies Provable<void>;

let VoteProof = ZkProgram.Proof(VoteProgram);

let { verificationKey } = await VoteProgram.compile();
// 初始化投票状态
const initialVotes = new CountVotes({
    totalVotesYes: Field(0),
  totalVotesNo: Field(0),
  voted: Bool(false),
});

let initProof = await VoteProgram.initVote(initialVotes);
let proof = initProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

let ok = await verify(proof.toJSON(), verificationKey);
console.log('initVote is ok ? -------   ', ok);

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');


//  id: 0 vote true
let voter = new Voter({
    id: Field(0),
    voteOption: Bool(true), // 投票赞成
});

let updatedVotes = new CountVotes({
    totalVotesYes: Field(1),
  totalVotesNo: Field(0),
  voted: Bool(true),
});

let voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote is ok ? ------- ', ok);
console.log('Now score Yes:No is ', updatedVotes.totalVotesYes.toBigInt(), ' : ', updatedVotes.totalVotesNo.toBigInt());

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');



// id: 1 vote true
voter.id = Field(1);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(0);

voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote is ok ? ------- ', ok);
console.log('Now score Yes:No is ', updatedVotes.totalVotesYes.toBigInt(), ' : ', updatedVotes.totalVotesNo.toBigInt());

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');

//  id: 3 vote false
voter.id = Field(3);
voter.voteOption = Bool(false);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(1);

voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote is ok ? ------- ', ok);
console.log('Now score Yes:No is ', updatedVotes.totalVotesYes.toBigInt(), ' : ', updatedVotes.totalVotesNo.toBigInt());

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');



// id: 2 vote true
voter.id = Field(2);
voter.voteOption = Bool(false);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(2);


voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote is ok ? ------- ', ok);
console.log('Now score Yes:No is ', updatedVotes.totalVotesYes.toBigInt(), ' : ', updatedVotes.totalVotesNo.toBigInt());

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');

// id: 4 vote true
voter.id = Field(4);
voter.voteOption = Bool(true);
updatedVotes.totalVotesYes = Field(3);
updatedVotes.totalVotesNo = Field(2);


voteProof = await VoteProgram.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote is ok ? ------- ', ok);
console.log('Now score Yes:No is ', updatedVotes.totalVotesYes.toBigInt(), ' : ', updatedVotes.totalVotesNo.toBigInt());

ok = await VoteProgram.verify(proof);
console.log('verify ok ? -------   ', ok, '\n-------------------');


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

