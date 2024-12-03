import {
    Field,
    State,
    state,
    method,
    SmartContract,
    PublicKey,
    Bool,
    Provable,
    MerkleMap,
    MerkleMapWitness,
    Poseidon
} from 'o1js';

export class Vote extends SmartContract {
    // 存储合约部署者的公钥
    @state(PublicKey) deployer = State<PublicKey>();

    // 存储赞成票数量
    @state(Field) approveCount = State<Field>();

    // 存储反对票数量
    @state(Field) opposeCount = State<Field>();

    // 存储团队成员merkle树的根
    @state(Field) memberRoot = State<Field>();

    // 初始化合约状态
    init() {
        super.init();
        this.deployer.set(this.sender.getAndRequireSignature());
        this.approveCount.set(Field(0));
        this.opposeCount.set(Field(0));
        this.memberRoot.set(Field(0));
    }

    // 添加团队成员
    @method addMember(newRoot: Field) {
        // 验证调用者是否为部署者
        const sender = this.sender.getAndRequireSignature();
        const deployer = this.deployer.getAndRequireEquals();
        deployer.equals(sender).assertTrue('只有部署者可以添加成员');

        // 更新成员merkle树根
        this.memberRoot.set(newRoot);
    }

    // 投票方法
    @method vote(isApprove: Bool, memberWitness: MerkleMapWitness) {
        // 获取当前成员根和投票者
        const currentMemberRoot = this.memberRoot.getAndRequireEquals();
        const voter = this.sender.getAndRequireSignature();

        // 验证投票者是否为团队成员
        const [witnessRoot, key] = memberWitness.computeRootAndKey(Field(1));
        const voterKey = Poseidon.hash(voter.toFields());

        // 验证成员证明
        Bool.and(
            currentMemberRoot.equals(witnessRoot),
            key.equals(voterKey)
        ).assertTrue('非团队成员不能投票');

        // 根据投票选择更新相应的计数器
        const currentApproveCount = this.approveCount.getAndRequireEquals();
        const currentOpposeCount = this.opposeCount.getAndRequireEquals();

        // 使用条件判断更新投票计数
        this.approveCount.set(
            Provable.if(isApprove, currentApproveCount.add(1), currentApproveCount)
        );
        this.opposeCount.set(
            Provable.if(isApprove, currentOpposeCount, currentOpposeCount.add(1))
        );
    }
}