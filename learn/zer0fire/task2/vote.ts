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
  @state(Field) enVoteCount = State<Field>();
  @state(Field) deVoteCount = State<Field>();

  init() {
    super.init();

    this.deployer.set(this.sender.getAndRequireSignature());
    this.enVoteCount.set(Field(0));
    this.deVoteCount.set(Field(0));
    this.membershipMapRoot.set(new MerkleMap().getRoot());
  }

  @method async addMember(membershipWitness: MerkleMapWitness) {
    const sender = this.sender.getAndRequireSignature();
    const deployer = this.deployer.getAndRequireEquals();
    sender.equals(deployer).assertTrue('Only deployer can add members');

    const currentMembershipRoot = this.membershipMapRoot.getAndRequireEquals();

    const [membershipRoot] = membershipWitness.computeRootAndKey(Field(0));
    membershipRoot.assertEquals(currentMembershipRoot);

    const [newMembershipRoot] = membershipWitness.computeRootAndKey(Field(1));
    this.membershipMapRoot.set(newMembershipRoot);
  }

  @method async vote(voteType: Field, membershipWitness: MerkleMapWitness) {
    const currentMembershipRoot = this.membershipMapRoot.getAndRequireEquals();

    const [membershipRoot] = membershipWitness.computeRootAndKey(Field(1));
    membershipRoot.assertEquals(
      currentMembershipRoot,
      'Only team members can vote'
    );

    Bool.or(voteType.equals(Field(0)), voteType.equals(Field(1))).assertTrue(
      'Vote type must be 0 or 1'
    );

    const isUpvote = voteType.equals(Field(1));
    const upvoteCount = this.enVoteCount.getAndRequireEquals();
    const updatedUpvoteCount = Provable.if(
      isUpvote,
      upvoteCount.add(1),
      upvoteCount
    );

    const downvoteCount = this.deVoteCount.getAndRequireEquals();
    const updatedDownvoteCount = Provable.if(
      isUpvote,
      downvoteCount,
      downvoteCount.add(1)
    );

    this.enVoteCount.set(updatedUpvoteCount);
    this.deVoteCount.set(updatedDownvoteCount);
  }
}