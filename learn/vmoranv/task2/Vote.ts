import { Field, SmartContract, state, State, method, PublicKey, Bool } from 'o1js';

export class Vote extends SmartContract {
    @state(Field) yesVotes = State<Field>();
    @state(Field) noVotes = State<Field>();
    @state(Field) memberCount = State<Field>();
    public yesVotesResult = Field(0);
    public noVotesResult = Field(0);

    init() {
        super.init();
        this.yesVotes.set(Field(0));
        this.noVotes.set(Field(0));
        this.memberCount.set(Field(0));
    }

    @method async addTeamMember(member: PublicKey) {
        const currentCount = await this.memberCount.getAndRequireEquals();
        this.memberCount.set(currentCount.add(Field(1)));
    }

    @method async vote(voter: PublicKey, isYes: Bool) {
        const currentYesVotes = await this.yesVotes.getAndRequireEquals();
        const currentNoVotes = await this.noVotes.getAndRequireEquals();
        const memberCount = await this.memberCount.getAndRequireEquals();

        memberCount.assertGreaterThan(Field(0));

        const newYesVotes = isYes.toField().mul(Field(1)).add(currentYesVotes);
        const newNoVotes = isYes.not().toField().mul(Field(1)).add(currentNoVotes);

        this.yesVotes.set(newYesVotes);
        this.noVotes.set(newNoVotes);
    }

    @method getVoteResult(): Promise<void> {
        const yesVotes = this.yesVotes.getAndRequireEquals();
        const noVotes = this.noVotes.getAndRequireEquals();
        this.yesVotesResult = yesVotes;
        this.noVotesResult = noVotes;
        return Promise.resolve();
    }
}
