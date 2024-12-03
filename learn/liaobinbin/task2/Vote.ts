import {
  PublicKey,
  SmartContract,
  method,
  State,
  state,
  Field,
  Bool,
  MerkleMapWitness,
  Poseidon,
  Provable,
} from 'o1js';

export class Vote extends SmartContract {
  @state(PublicKey)
  deployer = State<PublicKey>();

  @state(Field)
  agreeCount = State<Field>();

  @state(Field)
  disagreeCount = State<Field>();

  @state(Field)
  member = State<Field>();

  init() {
    super.init();
    this.deployer.set(this.sender.getAndRequireSignature());
    this.agreeCount.set(Field(0));
    this.disagreeCount.set(Field(0));
    this.member.set(Field(0));
  }

  @method
  async addMember(member: Field) {
    const sender = this.sender.getAndRequireSignature();
    const deployer = this.deployer.getAndRequireEquals();

    deployer.equals(sender).assertTrue('Only deployer can add member.');

    this.member.set(member);
  }

  @method
  async vote(result: Bool, memberWitness: MerkleMapWitness) {
    const currentMember = this.member.getAndRequireEquals();
    const voter = this.sender.getAndRequireSignature();

    const voteKey = Poseidon.hash(voter.toFields());

    const [witness, key] = memberWitness.computeRootAndKey(Field(1));

    // NOTE: 这个key 不知道怎么校验不对
    // key.equals(voteKey).assertTrue('is same');

    witness.equals(currentMember).assertTrue("Not team member can't vote.");

    const latestAgreeCount = this.agreeCount.getAndRequireEquals();
    const latestDisagreeCount = this.disagreeCount.getAndRequireEquals();

    this.agreeCount.set(
      Provable.if(result, latestAgreeCount.add(1), latestAgreeCount)
    );
    this.disagreeCount.set(
      Provable.if(result, latestDisagreeCount, latestDisagreeCount.add(1))
    );
  }
}
