import { MerkleMapWitness, ZkProgram, SmartContract, Field, Bool, state, State, method, Poseidon, PublicKey, Signature, Struct, Circuit, Provable } from 'o1js';


export class VoteCounter extends SmartContract {
  @state(Field) approveCount = State<Field>();
  @state(Field) rejectCount = State<Field>();
  @state(Field) memberHashRoot = State<Field>(); // Merkle Root of team members

  // 初始化合约状态
  init(membersRoot?: Field) {
    super.init();
    if (membersRoot) {
        this.approveCount.set(Field(0));
        this.rejectCount.set(Field(0));
        this.memberHashRoot.set(membersRoot);
    }
  }

  // 提交投票
  @method async submitVote(voterKey: PublicKey, vote: Bool, signature: Signature, memberHashWitness: MerkleMapWitness) {
    // 验证签名
    const message = vote.toField();
    signature.verify(voterKey, [message]).assertEquals(true, 'Invalid signature');

    // 验证投票者是否是团队成员
    this.memberHashRoot.requireEquals(this.memberHashRoot.get());
    const root = this.memberHashRoot.get();
    const [computedRoot] = memberHashWitness.computeRootAndKey(Poseidon.hash(voterKey.toFields()));
    computedRoot.assertEquals(root, 'Voter is not a valid team member'); // 若不匹配则交易失败

    // 更新票数

    this.approveCount.requireEquals(this.approveCount.get());
    this.rejectCount.requireEquals(this.rejectCount.get());

    const approveCount = this.approveCount.get();
    const rejectCount = this.rejectCount.get();

    this.approveCount.set(
        Provable.if(vote,
            approveCount.add(1),
            approveCount
        )
    );
    this.rejectCount.set(
        Provable.if(vote.not(),
            rejectCount.add(1),
            rejectCount
        )
    );
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
