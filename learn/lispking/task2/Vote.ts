import { Field, SmartContract, state, State, method, PublicKey, MerkleMapWitness, Bool, Poseidon } from 'o1js';

/**
 * Vote smart contract
 * See https://docs.minaprotocol.com/zkapps for more info.
 */
export class Vote extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(Field) teamMembers = State<Field>(Field(0));
  @state(Field) approveVotes = State<Field>(Field(0));
  @state(Field) rejectVotes = State<Field>(Field(0));

  init() {
    super.init();
    this.owner.set(this.sender.getAndRequireSignature());
  }

  @method async setTeamMembers(root: Field) {
    this.ensureOwner();
    this.teamMembers.set(root);
  }

  @method async approveVote(witness: MerkleMapWitness) {
    this.ensureValidMember(witness);

    const currentApproveVotes = this.approveVotes.getAndRequireEquals();
    this.approveVotes.set(currentApproveVotes.add(1));
  }

  @method async rejectVote(witness: MerkleMapWitness) {
    this.ensureValidMember(witness);

    const currentRejectVotes = this.rejectVotes.getAndRequireEquals();
    this.rejectVotes.set(currentRejectVotes.add(1));
  }

  async ensureOwner() {
    const owner = this.owner.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    sender.equals(owner).assertTrue('Not owner');
  }

  async ensureValidMember(witness: MerkleMapWitness) {
    const members = this.teamMembers.getAndRequireEquals();
    const user = this.sender.getAndRequireSignature();
    const userHash = Poseidon.hash(user.toFields());

    let [root, key] = witness.computeRootAndKey(Field(1));
    Bool.and(root.equals(members), key.equals(userHash)).assertTrue('Invalid member');
  }

  getVoteCount() {
    return {
      approve: this.approveVotes.get(),
      reject: this.rejectVotes.get(),
    };
  }

  getTeamMembers() {
    return this.teamMembers.get();
  }
}
