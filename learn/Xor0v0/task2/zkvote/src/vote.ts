import * as o1js from 'o1js';
import { Bool, Field, JsonProof, Proof, Provable, PublicKey, SelfProof, Struct, verify, ZkProgram } from 'o1js';

export class Voter extends Struct({
    id: Field,              // 选民id
    voteOption: Bool,       // 投票选项（true = 赞成）
}) { }

const memberIds = [Field(0), Field(1), Field(2), Field(3), Field(4)];

export class CountVotes extends Struct({
    totalVotesYes: Field,
    totalVotesNo: Field,
    voted: Bool,          // 用于追踪是否已投票
}) { }

export let VoteProgram = o1js.ZkProgram({
    name: 'VoteProgram',
    publicInput: CountVotes,

    methods: {
        initVote: {
            privateInputs: [],

            async method(input: CountVotes) {
                input.totalVotesYes.assertEquals(Field(0));
                input.totalVotesNo.assertEquals(Field(0));
                input.voted.assertEquals(Bool(false)); // 初始化所有人未投票
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
                const earlierVoted = (earlierProof.publicInput as any).voted;
                const { totalVotesYes, totalVotesNo, voted } = publicInput;
                const { id, voteOption } = privateInput;

                // check member in group
                const isMember = memberIds.reduce((acc, i) => acc.or(id.equals(i)), Bool(false));
                isMember.assertTrue();

                // check if already voted (voted field should be 0 if not voted yet)
                const hasVoted = voted.equals(Bool(true));
                hasVoted.assertFalse(); // 确保选民还没有投票

                // check vote count
                const earlier = Provable.if(voteOption, earlierTotalYes, earlierTotalNo);
                const now = Provable.if(voteOption, totalVotesYes, totalVotesNo);

                earlier.add(1).assertEquals(now);

                // Update the voted status to 1 to mark as voted
                const newVotedStatus = Bool(true);
                newVotedStatus.assertEquals(voted); // 更新为已投票
            },
        },
    },
});