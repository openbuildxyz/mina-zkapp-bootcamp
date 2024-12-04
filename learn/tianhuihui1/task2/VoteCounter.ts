import { MerkleMapWitness, ZkProgram, SmartContract, Field, Bool, state, State, method, Poseidon, PublicKey, Signature, Struct, Circuit, Provable } from 'o1js';


export class VoteCounter extends SmartContract {
    @state(Field) approveCount = State<Field>();
    @state(Field) rejectCount = State<Field>();
    @state(Field) memberHashRoot = State<Field>(); // Merkle Root of team members

    // 初始化合约状态
    init(membersRoot: Field) {
        super.init();
        this.approveCount.set(Field(0));
        this.rejectCount.set(Field(0));
        this.memberHashRoot.set(membersRoot);
    }

    // 提交投票
    @method async submitVote(voterKey: PublicKey, vote: Bool, signature: Signature, memberHashWitness: MerkleMapWitness) {
        // 验证投票者身份
        const voterHash = Poseidon.hash(voterKey.toFields());
        const [computedRoot, _] = memberHashWitness.computeRootAndKey(voterHash);

        // 合并状态验证
        const currentRoot = this.memberHashRoot.get();
        this.memberHashRoot.requireEquals(currentRoot);
        computedRoot.assertEquals(currentRoot, '无效的团队成员');

        // 验证签名
        signature.verify(voterKey, [vote.toField()]).assertEquals(true, '无效的签名');

        // 获取当前票数
        const currentApprove = this.approveCount.get();
        const currentReject = this.rejectCount.get();
        this.approveCount.requireEquals(currentApprove);
        this.rejectCount.requireEquals(currentReject);

        // 更新票数（使用更简洁的条件更新）
        this.approveCount.set(currentApprove.add(vote.toField()));
        this.rejectCount.set(currentReject.add(vote.not().toField()));
    }

    // 查询结果
    @method.returns(Object({ approve: Field, reject: Field })) async getResults(): Promise<{ approve: Field; reject: Field }> {
        // 添加状态前置条件
        this.approveCount.requireEquals(this.approveCount.get());
        this.rejectCount.requireEquals(this.rejectCount.get());

        return {
            approve: this.approveCount.get(),
            reject: this.rejectCount.get()
        };
    }
}
