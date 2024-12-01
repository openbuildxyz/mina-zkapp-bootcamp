import {
    Field,
    SmartContract,
    state,
    State,
    method,
    Provable,
    PublicKey,
    MerkleMapWitness,
    Bool,
    MerkleMap,
    Poseidon,
} from 'o1js';

export class VoteContract extends SmartContract {
    @state(PublicKey) deployer = State<PublicKey>();
    @state(Field) approveVotes = State<Field>();  // 赞同票
    @state(Field) opposeVotes = State<Field>();  // 反对票
    @state(Field) votedMembersRoot = State<Field>(); // Merkle Root of voted members

    init() {
        super.init();
        this.deployer.set(this.sender.getAndRequireSignature());
        this.approveVotes.set(Field(0));
        this.opposeVotes.set(Field(0));
        this.votedMembersRoot.set(new MerkleMap().getRoot());
    }
    @method async AddMember(
        newMemberRoot: MerkleMapWitness,
    ) {
        const sender = this.sender.getAndRequireSignature();
        const deployer = this.deployer.getAndRequireEquals();
        sender.equals(deployer).assertTrue('只有部署者才能添加成员。');

        // 验证新成员的Merkle Root是否正确
        const currentRoot = this.votedMembersRoot.getAndRequireEquals();
        const [membershipRoot] = newMemberRoot.computeRootAndKey(Field(0));
        membershipRoot.assertEquals(currentRoot);
        const [newMembershipRoot] = newMemberRoot.computeRootAndKey(Field(1));
        this.votedMembersRoot.set(newMembershipRoot);
    }

    @method async Vote(
        voteOption: Bool,
        membershipWitness: MerkleMapWitness

    ) {
        // 验证投票者是团队成员，只能团队内成员投票
        const currentMembershipRoot = this.votedMembersRoot.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        const key = Poseidon.hash(sender.toFields());
        const [root, keyWitness] = membershipWitness.computeRootAndKey(Field(1))
        Bool.and(currentMembershipRoot.equals(root), keyWitness.equals(key)).assertTrue('成员验证失败');

        // 更新投票
        const currentApproveVotes = this.approveVotes.getAndRequireEquals();
        const newApproveState = Provable.if(new Bool(voteOption), currentApproveVotes.add(Field(1)), currentApproveVotes);
        this.approveVotes.set(newApproveState);
        const currentOpposeVotes = this.opposeVotes.getAndRequireEquals();
        const newOpposeState = Provable.if(new Bool(!voteOption), currentOpposeVotes.add(Field(1)), currentOpposeVotes);
        this.opposeVotes.set(newOpposeState);
    }

    // 查询投票结果
    @method async GetVoteResult() {
        const approveVotes = this.approveVotes.getAndRequireEquals();
        const opposeVotes = this.opposeVotes.getAndRequireEquals();
    }
}
