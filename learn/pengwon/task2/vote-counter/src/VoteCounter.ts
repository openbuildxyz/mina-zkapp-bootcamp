// VoteCounter.ts
import {
    Field,
    Bool,
    ZkProgram,
    Circuit,
    Provable,
} from 'o1js';

class VoteCounter extends Circuit {
    addVote(
        approvalVotes: Field,
        disapprovalVotes: Field,
        voterId: Field,
        isApproval: Bool,
        teamMembers: Field[],
        votedVoters: Field[]
    ): [Field, Field, Field[]] {
        // 检查是否为团队成员
        let isMember = Bool(false);
        for (let member of teamMembers) {
            isMember = isMember.or(member.equals(voterId));
        }
        isMember.assertTrue("Voter is not a team member");

        // 检查是否已投票
        let hasVoted = Bool(false);
        for (let voted of votedVoters) {
            hasVoted = hasVoted.or(voted.equals(voterId));
        }
        hasVoted.assertFalse("Voter has already voted");

        // 更新票数
        let newApproval = approvalVotes;
        let newDisapproval = disapprovalVotes;
        if (isApproval.toBoolean()) {
            newApproval = approvalVotes.add(1);
        } else {
            newDisapproval = disapprovalVotes.add(1);
        }

        // 记录已投票者
        const newVotedVoters = votedVoters.concat([voterId]);

        return [newApproval, newDisapproval, newVotedVoters];
    }
}

const voteCounterProgram = ZkProgram({
    name: "VoteCounter",
    publicInput: Provable.Array(Field, 2), // approvalVotes, disapprovalVotes
    privateInputs: [Field, Bool, [Field], [Field]], // voterId, isApproval, teamMembers, votedVoters
    methods: {
        addVote: {
            privateInputs: [Field, Bool, Provable.Array(Field, 100), Provable.Array(Field, 100)],
            async method(publicInput: Field[], voterId: Field, isApproval: Bool, teamMembers: Field[], votedVoters: Field[]): Promise<void> {
                const [approvalVotes, disapprovalVotes] = publicInput;
                await new VoteCounter().addVote(approvalVotes, disapprovalVotes, voterId, isApproval, teamMembers, votedVoters);
            }
        }
    }
});

export { voteCounterProgram as voteCounter };