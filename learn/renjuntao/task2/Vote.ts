import { Bool, Field, MerkleMapWitness, method, Poseidon, PublicKey, SmartContract, state, State } from 'o1js';

export default class Vote extends SmartContract {
    @state(PublicKey) deployerPublicKey = State<PublicKey>();
    // 赞成
    @state(Field) yesVotes = State<Field>();
    // 反对
    @state(Field) noVotes = State<Field>();
    // 成员证明
    @state(Field) VoteMemberMapRoot = State<Field>();

    init() {
        super.init();
        this.deployerPublicKey.set(this.sender.getAndRequireSignature());
        this.yesVotes.set(Field(0));
        this.noVotes.set(Field(0));
        this.VoteMemberMapRoot.set(Field(0));
    }

    @method async vote(ticket: Field, witness: MerkleMapWitness) {
        // 成员检测
        const currentRoot = this.VoteMemberMapRoot.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        const key = Poseidon.hash(sender.toFields());
        const [root, keyWitness] = witness.computeRootAndKey(Field(1));
        Bool.and(
            currentRoot.equals(root),
            keyWitness.equals(key),
        ).assertTrue('Member validation failed');

        // 参数验证
        ticket.equals(Field(0)).or(ticket.equals(Field(1))).assertTrue('isYes must be 0 or 1');

        // 获取当前的“是”票和“否”票数量
        const currentYesVotes = this.yesVotes.getAndRequireEquals();
        const currentNoVotes = this.noVotes.getAndRequireEquals();

        // 更新票数
        this.yesVotes.set(currentYesVotes.add(ticket));
        this.noVotes.set(currentNoVotes.add(Field(1).sub(ticket)));
    }

    @method async updateMemberRoot(newRoot: Field) {
        const deployer = this.deployerPublicKey.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        sender.equals(deployer).assertTrue('Only deployer can perform this action');
        this.VoteMemberMapRoot.set(newRoot);
    }

    getVoteCounts() {
        return {
            approve: this.yesVotes.get(),
            reject: this.noVotes.get(),
        };
    }

    getMemberRoot() {
        return this.VoteMemberMapRoot.get();
    }
}