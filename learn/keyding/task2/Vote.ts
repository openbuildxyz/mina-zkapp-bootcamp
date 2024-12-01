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

export class Vote extends SmartContract {
  @state(PublicKey) deployer = State<PublicKey>();
  @state(Field) membershipMapRoot = State<Field>();
  @state(Field) upvoteCount = State<Field>();
  @state(Field) downvoteCount = State<Field>();

  init() {
    super.init();

    // 初始化部署者
    this.deployer.set(this.sender.getAndRequireSignature());

    // 初始化投票状态
    this.upvoteCount.set(Field(0));
    this.downvoteCount.set(Field(0));

    // 初始化空的 MerkleMap 根
    this.membershipMapRoot.set(new MerkleMap().getRoot());
  }

  // 添加成员
  @method async addMember(membershipWitness: MerkleMapWitness) {
    // 只有合约部署者可以添加成员
    const sender = this.sender.getAndRequireSignature();
    const deployer = this.deployer.getAndRequireEquals();
    sender.equals(deployer).assertTrue('Only deployer can add members');

    // 验证当前成员映射的根
    const currentMembershipRoot = this.membershipMapRoot.getAndRequireEquals();

    // 验证成员根
    const [membershipRoot] = membershipWitness.computeRootAndKey(Field(0));
    membershipRoot.assertEquals(currentMembershipRoot);

    // 计算新的根并更新状态
    const [newMembershipRoot] = membershipWitness.computeRootAndKey(Field(1));
    this.membershipMapRoot.set(newMembershipRoot);
  }

  // 投票
  @method async vote(voteType: Field, membershipWitness: MerkleMapWitness) {
    // 验证当前成员映射的根
    const currentMembershipRoot = this.membershipMapRoot.getAndRequireEquals();

    // 验证成员状态
    const [membershipRoot] = membershipWitness.computeRootAndKey(Field(1));
    membershipRoot.assertEquals(
      currentMembershipRoot,
      'Only team members can vote'
    );

    // 验证投票类型，voteType 只能是 0 或者 1
    Bool.or(voteType.equals(Field(0)), voteType.equals(Field(1))).assertTrue(
      'Vote type must be 0 or 1'
    );

    // 是否投赞同票
    const isUpvote = voteType.equals(Field(1));

    // 更新赞同票
    const upvoteCount = this.upvoteCount.getAndRequireEquals();
    const updatedUpvoteCount = Provable.if(
      isUpvote,
      upvoteCount.add(1),
      upvoteCount
    );

    // 更新反对票
    const downvoteCount = this.downvoteCount.getAndRequireEquals();
    const updatedDownvoteCount = Provable.if(
      isUpvote,
      downvoteCount,
      downvoteCount.add(1)
    );

    // 更新投票状态
    this.upvoteCount.set(updatedUpvoteCount);
    this.downvoteCount.set(updatedDownvoteCount);
  }
}
