import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  MerkleWitness,
  Provable,
  PublicKey,
  assert,
} from "o1js";

export class TeamMemberWitness extends MerkleWitness(20) {}

export class VotingCounter extends SmartContract {
  @state(Field) approveVotes = State<Field>();
  @state(Field) rejectVotes = State<Field>();
  @state(Field) merkleRoot = State<Field>();
  @state(PublicKey) deployer = State<PublicKey>();

  @method async init() {
    super.init();
    this.deployer.set(this.sender.getAndRequireSignature());
    this.approveVotes.set(Field(0));
    this.rejectVotes.set(Field(0));
    this.merkleRoot.set(Field(0));
  }

  @method async setTeam(newMerkleRoot: Field) {
    // 新root不能为0
    assert(newMerkleRoot != Field(0), "Root wrong");
    // 检查权限
    this.sender
      .getAndRequireSignature()
      .equals(this.deployer.getAndRequireEquals())
      .assertTrue("Not deployer");

    this.merkleRoot.set(newMerkleRoot);
  }

  @method async vote(
    voteType: Bool,
    memberHash: Field,
    witness: TeamMemberWitness
  ) {
    // 当前root不能为0
    this.merkleRoot.get().assertNotEquals(Field(0), "Root not set");

    // 检查成员
    witness
      .calculateRoot(memberHash)
      .assertEquals(this.merkleRoot.getAndRequireEquals(), "Fake member");

    // 更新票数
    this.approveVotes.set(
      this.approveVotes.getAndRequireEquals().add(voteType.toField())
    );
    const newVote: Field = Provable.if(voteType, Field(0), Field(1));
    this.rejectVotes.set(this.rejectVotes.getAndRequireEquals().add(newVote));
  }
}
