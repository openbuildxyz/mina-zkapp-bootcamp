import { Field, SmartContract, state, State, method, PublicKey, Bool } from 'o1js';

export class Vote extends SmartContract {
    @state(Field) approvalCount = State<Field>();
    @state(Field) rejectCount = State<Field>();
    @state(Field) teamSize = State<Field>();

    public finalApprovalCount = Field(0);
    public finalRejectCount = Field(0);

    init() {
        super.init();
        this.approvalCount.set(Field(0));
        this.rejectCount.set(Field(0));
        this.teamSize.set(Field(0));
    }

    @method async registerMember(member: PublicKey) {
        const currentTeamSize = await this.teamSize.getAndRequireEquals();
        this.teamSize.set(currentTeamSize.add(Field(1)));
    }

    @method async submitVote(member: PublicKey, isApproved: Bool) {
        const currentTeamSize = await this.teamSize.getAndRequireEquals();
        currentTeamSize.assertGreaterThan(Field(0));

        const currentApprovalCount = await this.approvalCount.getAndRequireEquals();
        const currentRejectCount = await this.rejectCount.getAndRequireEquals();

        const newApprovalCount = isApproved.toField().mul(Field(1)).add(currentApprovalCount);
        const newRejectCount = isApproved.not().toField().mul(Field(1)).add(currentRejectCount);

        this.approvalCount.set(newApprovalCount);
        this.rejectCount.set(newRejectCount);
    }

    @method async getVotingResult(): Promise<void> {
        const approvalCount = await this.approvalCount.getAndRequireEquals();
        const rejectCount = await this.rejectCount.getAndRequireEquals();

        this.finalApprovalCount = approvalCount;
        this.finalRejectCount = rejectCount;

        return Promise.resolve();
    }
}
