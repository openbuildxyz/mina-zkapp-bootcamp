class VoteCounter {
    private votes: { [key: string]: 'yes' | 'no' } = {};
    private teamMembers: Set<string>;
    constructor(members: string[]) {
        this.teamMembers = new Set(members);
    }
    public vote(voter: string, vote: 'yes' | 'no'): string {
        if (!this.teamMembers.has(voter)) {
            return `${voter} 不是团队成员，无法投票。`;
        }
        if (this.votes[voter]) {
            return `${voter} 已经投过票。`;
        }
        this.votes[voter] = vote;
        return `${voter} 投票成功，选择了 ${vote === 'yes' ? '赞成' : '反对'}`;
    }
    public tallyVotes(): { yes: number; no: number } {
        let yesCount = 0;
        let noCount = 0;

        for (const vote of Object.values(this.votes)) {
            if (vote === 'yes') {
                yesCount++;
            } else {
                noCount++;
            }
        }
        return { yes: yesCount, no: noCount };
    }
}

const members = ['zhangsan', 'lisi', 'wanger'];
const voteCounter = new VoteCounter(members);
console.log(voteCounter.vote('zhangsan', 'yes'));
console.log(voteCounter.vote('lisi', 'no'));  
console.log(voteCounter.vote('wanger', 'yes')); 
console.log(voteCounter.vote('zhangsan', 'no'));

const results = voteCounter.tallyVotes();
console.log(`赞成票: ${results.yes}, 反对票: ${results.no}`);
