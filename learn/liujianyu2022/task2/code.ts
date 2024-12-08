import * as o1js from 'o1js';

import {
    Bool,
    Field,
    JsonProof,
    Proof,
    Provable,
    PublicKey,
    SelfProof,
    Struct,
    verify,
    ZkProgram
} from 'o1js';

export class Voter extends Struct({
    id: Field,              // the id for voter
    voteOption: Bool,       // the option for vote, true for approve    false for disapprove
}) { }

const memberIds = [Field(0), Field(1), Field(2), Field(3)];

export class CountVotes extends Struct({
    totalVotesYes: Field,
    totalVotesNo: Field,
}) { }

export let Vote = o1js.ZkProgram({
    name: 'Vote',

    publicInput: CountVotes,

    methods: {
        initVote: {
            privateInputs: [],

            async method(input: CountVotes) {
                input.totalVotesYes.assertEquals(Field(0));
                input.totalVotesNo.assertEquals(Field(0));
            }
        },

        vote: {
            privateInputs: [Voter, SelfProof],

            async method(
                publicInput: CountVotes,
                privateInput: Voter,
                earlierProof: SelfProof<Field, void>,
            ) {
                earlierProof.verify();
                const earlierTotalYes = (earlierProof.publicInput as any).totalVotesYes;
                const earlierTotalNo = (earlierProof.publicInput as any).totalVotesNo;
                const { totalVotesYes, totalVotesNo } = publicInput;
                const { id, voteOption } = privateInput;

                // check member in group
                const isMember = memberIds.reduce((acc, i) => acc.or(id.equals(i)), Bool(false));
                isMember.assertTrue();

                // check vote count
                const earlier = Provable.if(voteOption, earlierTotalYes, earlierTotalNo);
                const now = Provable.if(voteOption, totalVotesYes, totalVotesNo);

                earlier.add(1).assertEquals(now);
            },
        },
    },
});




Vote.publicInputType satisfies typeof CountVotes;
Vote.publicOutputType satisfies Provable<void>;

let VoteProof = ZkProgram.Proof(Vote);

let { verificationKey } = await Vote.compile();

// 初始化投票状态
const initialVotes = new CountVotes({
    totalVotesYes: Field(0),
    totalVotesNo: Field(0),
});

let initProof = await Vote.initVote(initialVotes);

let proof = initProof.proof as Proof<CountVotes, void>
proof = await testJsonRoundtrip(VoteProof, proof);

let ok = await verify(proof.toJSON(), verificationKey);

ok = await Vote.verify(proof);


//  id: 0 vote true
let voter = new Voter({ id: Field(0), voteOption: Bool(true) });

let updatedVotes = new CountVotes({
    totalVotesYes: Field(1),
    totalVotesNo: Field(0),
});

let voteProof = await Vote.vote(updatedVotes, voter, proof);
proof = voteProof.proof as Proof<CountVotes, void>
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);

ok = await Vote.verify(proof);


// id: 1 vote true
voter.id = Field(1);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(0);

voteProof = await Vote.vote(updatedVotes, voter, proof);
proof = voteProof.proof as Proof<CountVotes, void>;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);

ok = await Vote.verify(proof);

//  id: 3 vote false
voter.id = Field(3);
voter.voteOption = Bool(false);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(1);

voteProof = await Vote.vote(updatedVotes, voter, proof);
proof = voteProof.proof as Proof<CountVotes, void>;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);


ok = await Vote.verify(proof);


// id: 2 vote true
voter.id = Field(2);
voter.voteOption = Bool(false);
updatedVotes.totalVotesYes = Field(2);
updatedVotes.totalVotesNo = Field(2);


voteProof = await Vote.vote(updatedVotes, voter, proof);
proof = voteProof.proof as Proof<CountVotes, void>;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);


ok = await Vote.verify(proof);


function testJsonRoundtrip<P extends Proof<any, any>, VoteProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }>(VoteProof: VoteProof, proof: P) {
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