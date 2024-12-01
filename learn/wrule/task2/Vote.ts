import { Bool, Field, MerkleMapWitness, method, Poseidon, Provable, PublicKey, SmartContract, state, State } from 'o1js';

export class Vote extends SmartContract {
  @state(PublicKey) deployer = State<PublicKey>();
  @state(Field) memberMapRoot = State<Field>(Field(0));
  @state(Field) approveCount = State<Field>(Field(0));
  @state(Field) rejectCount = State<Field>(Field(0));

  init() {
    super.init();
    this.deployer.set(this.sender.getAndRequireSignature());
  }

  @method async vote(isApprove: Field, witness: MerkleMapWitness) {
    // 验证isApprove是否合法
    Bool.or(
      isApprove.equals(Field(0)),
      isApprove.equals(Field(1)),
    ).assertTrue('Vote must be 0 or 1');

    // 验证成员存在
    const currentRoot = this.memberMapRoot.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    const key = Poseidon.hash(sender.toFields());
    const [root, keyWitness] = witness.computeRootAndKey(Field(1));
    Bool.and(
      currentRoot.equals(root),
      keyWitness.equals(key),
    ).assertTrue('Member validation failed');

    // 更新投票计数
    const approveCount = this.approveCount.getAndRequireEquals();
    const rejectCount = this.rejectCount.getAndRequireEquals();
    this.approveCount.set(
      Provable.if(isApprove.equals(Field(1)),
        approveCount.add(1),
        approveCount
      )
    );
    this.rejectCount.set(
      Provable.if(isApprove.equals(Field(0)),
        rejectCount.add(1),
        rejectCount
      )
    );
  }

  @method async updateMemberRoot(newRoot: Field) {
    const deployer = this.deployer.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    sender.equals(deployer).assertTrue('Only deployer can perform this action');
    this.memberMapRoot.set(newRoot);
  }

  getVoteCounts() {
    return {
      approve: this.approveCount.get(),
      reject: this.rejectCount.get(),
    };
  }

  getMemberRoot() {
    return this.memberMapRoot.get();
  }
}
