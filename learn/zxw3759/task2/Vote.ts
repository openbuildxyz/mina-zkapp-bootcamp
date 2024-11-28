import {
  Field,
  ZkProgram,
  state,
  State,
  method,
  Provable,
  Bool,
  SmartContract,
  MerkleMap,
  PublicKey,
  Poseidon,
  MerkleMapWitness,
} from 'o1js';

export class Vote extends SmartContract {
  @state(PublicKey) deployer = State<PublicKey>();
  // 赞成票
  @state(Field) approveNum = State<Field>();
  // 返回票
  @state(Field) opposeNum = State<Field>();
  // 成员
  @state(Field) memberMapRoot = State<Field>();
  init() {
    super.init();
    // 初始化部署者
    this.deployer.set(this.sender.getAndRequireSignature());
    this.approveNum.set(Field(0));
    this.opposeNum.set(Field(0));
    this.memberMapRoot.set(Field(0));
  }
  // 添加成员
  @method async addMember(newRoot: Field) {
    const sender = this.sender.getAndRequireSignature();
    const deployer = this.deployer.getAndRequireEquals();
    sender.equals(deployer).assertTrue('Only deployer can add members');
    this.memberMapRoot.set(newRoot);
  }

  @method async count(result: Bool, memberWitness: MerkleMapWitness) {
    const currentMemberRoot = this.memberMapRoot.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    // 验证是否为团队成员
    const key = Poseidon.hash(sender.toFields());
    const [root, keyWitness] = memberWitness.computeRootAndKey(Field(1));
    Bool.and(currentMemberRoot.equals(root), keyWitness.equals(key)).assertTrue(
      'Member validation failed'
    );

    const currentApprove = this.approveNum.getAndRequireEquals();
    const newApproveState = Provable.if(
      new Bool(result),
      currentApprove.add(1),
      currentApprove
    );
    this.approveNum.set(newApproveState);

    const currentOppose = this.opposeNum.getAndRequireEquals();
    const newOpposeState = Provable.if(
      new Bool(result),
      currentOppose,
      currentOppose.add(1)
    );
    this.opposeNum.set(newOpposeState);
  }
}
