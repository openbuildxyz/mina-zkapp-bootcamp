import { Field, SmartContract, state, State, method, PublicKey, Bool } from 'o1js';

export class Vote extends SmartContract {
    @state(Field) yesVotes = State<Field>();
    @state(Field) noVotes = State<Field>();
    @state(Field) memberCount = State<Field>();
    @state(Set<PublicKey>) teamMembers = State<Set<PublicKey>>();
    public yesVotesResult = Field(0);
    public noVotesResult = Field(0);

    init() {
        super.init();
        this.yesVotes.set(Field(0));
        this.noVotes.set(Field(0));
        this.memberCount.set(Field(0));
    }


    @method async voteForYes(voter: PublicKey, isYes: Bool) {
        const currentYesVotes = await this.yesVotes.getAndRequireEquals();
        const memberCount = await this.memberCount.getAndRequireEquals();

        memberCount.assertGreaterThan(Field(0));

        const newYesVotes = Field(1).add(currentYesVotes);

        this.yesVotes.set(newYesVotes);
    }

    @method async voteForNo(voter: PublicKey, isYes: Bool) {
        const currentNoVotes = await this.noVotes.getAndRequireEquals();
        const memberCount = await this.memberCount.getAndRequireEquals();

        memberCount.assertGreaterThan(Field(0));

        const newNoVotes = Field(1).add(currentNoVotes);

        this.noVotes.set(newNoVotes);
    }

    @method getVoteResult(): Promise<void> {
        const yesVotes = this.yesVotes.getAndRequireEquals();
        const noVotes = this.noVotes.getAndRequireEquals();
        this.yesVotesResult = yesVotes;
        this.noVotesResult = noVotes;
        return Promise.resolve();
    }

    @method async addTeamMember(member: PublicKey) {
        const currentCount = await this.memberCount.getAndRequireEquals();
        this.memberCount.set(currentCount.add(Field(1)));
    
        // 将新成员添加到 teamMembers 集合中
        const members = await this.teamMembers.getAndRequireEquals();
        members.add(member);
        this.teamMembers.set(members);
    }

    //check whether team member
    @method async isMember(voter: PublicKey): Promise<Bool> {
        const members = await this.teamMembers.getAndRequireEquals();
        return members.has(voter);
    }
}
