import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  Provable,
  PublicKey,
  MerkleMapWitness,
  MerkleMap,
} from 'o1js';

export class VoteSystem extends SmartContract {
  @state(PublicKey) administrator = State<PublicKey>();
  @state(Field) participantTreeRoot = State<Field>();
  @state(Field) approvalCount = State<Field>();
  @state(Field) rejectionCount = State<Field>();

  init() {
    super.init();
    // 初始化合约管理员
    this.administrator.set(this.sender.getAndRequireSignature());
    // 设置初始投票计数为零
    this.approvalCount.set(Field(0));
    this.rejectionCount.set(Field(0));
    // 初始化空的参与者注册表
    this.participantTreeRoot.set(new MerkleMap().getRoot());
  }

  // 在投票系统中注册新参与者
  @method async registerParticipant(registryWitness: MerkleMapWitness) {
    // 验证管理员权限
    const sender = this.sender.getAndRequireSignature();
    const admin = this.administrator.getAndRequireEquals();
    sender.equals(admin).assertTrue('Only administrator can register participants');

    // 验证当前参与者注册表状态
    const currentRegistryRoot = this.participantTreeRoot.getAndRequireEquals();

    // 验证参与者状态
    const [registryRoot] = registryWitness.computeRootAndKey(Field(0));
    registryRoot.assertEquals(currentRegistryRoot);

    // 更新注册表添加新参与者
    const [newRegistryRoot] = registryWitness.computeRootAndKey(Field(1));
    this.participantTreeRoot.set(newRegistryRoot);
  }

  // 为当前提案提交投票
  @method async submitVote(choice: Field, registryWitness: MerkleMapWitness) {
    // 验证当前参与者注册表状态
    const currentRegistryRoot = this.participantTreeRoot.getAndRequireEquals();

    // 验证参与者资格
    const [registryRoot] = registryWitness.computeRootAndKey(Field(1));
    registryRoot.assertEquals(currentRegistryRoot, 'Only registered participants can vote');

    // 验证投票选择（必须是0或1）
    Bool.or(choice.equals(Field(0)), choice.equals(Field(1))).assertTrue('input must be 0 or 1');

    // 检查是否为赞成票
    const isApproval = choice.equals(Field(1));

    // 更新赞成票计数
    const currentApprovals = this.approvalCount.getAndRequireEquals();
    const updatedApprovals = Provable.if(
      isApproval,
      currentApprovals.add(1),
      currentApprovals
    );

    // 更新反对票计数
    const currentRejections = this.rejectionCount.getAndRequireEquals();
    const updatedRejections = Provable.if(
      isApproval,
      currentRejections,
      currentRejections.add(1)
    );

    // 提交更新后的投票计数
    this.approvalCount.set(updatedApprovals);
    this.rejectionCount.set(updatedRejections);
  }
}
