/**
 * cznc代码说明:
 * 想找视频课里的代码做地板来修改,找到这份非常接近, 就基于这份代码做的修改. 
 * 与这份代码原来的代码不同, 我把原本代码中定义为全局变量的memberIds 放进了CountVotes 类中, 因为记得视频课里老师提到过电路里没有全局变量.
 * 代码其余部分没有做修改. 测试部分也大同小异也没有做修改.
 * @since 20241201
*/
import * as o1js from 'o1js';
import { Bool, Field, JsonProof, Proof, Provable, PublicKey, SelfProof, Struct, verify, ZkProgram } from 'o1js';
export class Voter extends Struct({
    id: Field,              // 选民id
    voteOption: Bool,       // 投票选项（true = 赞成）
}) { }

export class CountVotes extends Struct({
    totalVotesYes: Field,
    totalVotesNo: Field,
	memberIds: Field[], // 小组成员
}) { }

export let VoteProgram = o1js.ZkProgram({
    name: 'VoteProgram',
    publicInput: CountVotes,

    methods: {
        baseCase: {
            privateInputs: [],

            async method(input: CountVotes) {
                input.totalVotesYes.assertEquals(Field(0));
                input.totalVotesNo.assertEquals(Field(0));
            }
        },

        inclusiveCase: {
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
                const isMember = (earlierProof.publicInput as any).memberIds.reduce((acc, i) => acc.or(id.equals(i)), Bool(false));
                isMember.assertTrue();

                // check vote count
                const earlier = Provable.if(voteOption, earlierTotalYes, earlierTotalNo);
                const now = Provable.if(voteOption, totalVotesYes, totalVotesNo);

                earlier.add(1).assertEquals(now);
            },
        },
    },
});




VoteProgram.publicInputType satisfies typeof CountVotes;
VoteProgram.publicOutputType satisfies Provable<void>;

let VoteProof = ZkProgram.Proof(VoteProgram);

let { verificationKey } = await VoteProgram.compile();
// 小组成员
const memberIds = [Field(0), Field(1), Field(2), Field(3), Field(4)];
// 初始化投票状态
const initialVotes = new CountVotes({
    totalVotesYes: Field(0),
    totalVotesNo: Field(0),
	memberIds: memberIds,
});

let initProof = await VoteProgram.baseCase(initialVotes);
let proof = initProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

let ok = await verify(proof.toJSON(), verificationKey);
console.log('baseCase is ok ? -------   ', ok);

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
	memberIds: memberIds,
});

let voteProof = await VoteProgram.inclusiveCase(updatedVotes, voter, proof);
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

voteProof = await VoteProgram.inclusiveCase(updatedVotes, voter, proof);
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

voteProof = await VoteProgram.inclusiveCase(updatedVotes, voter, proof);
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


voteProof = await VoteProgram.inclusiveCase(updatedVotes, voter, proof);
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


voteProof = await VoteProgram.inclusiveCase(updatedVotes, voter, proof);
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
