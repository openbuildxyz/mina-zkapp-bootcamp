import { Field, SmartContract, state, State, method, PublicKey, Struct, Bool, Poseidon, Provable, Circuit } from 'o1js';


export class Voter extends Struct({
  publicKey: PublicKey,
  voted: Bool
}) {
  static from(publicKey: PublicKey) {
    return new Voter({
      publicKey,
      voted: Bool(false)
    });
  }
  hash() {
    return Poseidon.hash(this.publicKey.toFields());
  }
}

export class Members extends Struct({
  members: [Voter]
}) {
  hash() {
    return Poseidon.hash(this.members.map((voter) => voter.hash()));
  }
}

export class VoteBox extends SmartContract {
  @state(Field) up = State<Field>();
  @state(Field) down = State<Field>();
  @state(Field) membersHash = State<Field>();

  init() {
    super.init();
    this.membersHash.set(Field(0));
    this.up.set(Field(0));
    this.down.set(Field(0));
  }

  @method async register(members: Members) {
    this.membersHash.set(members.hash());
  }

  @method async addUp(voter: Voter, members: Members) {
    const nowUp = this.up.getAndRequireEquals();
    const membersHash = this.membersHash.getAndRequireEquals();

    membersHash.assertEquals(members.hash(), "membersHash");

    const foundMember = members.members
      .map(m => m.publicKey.equals(voter.publicKey))
      .reduce((acc, curr) => Bool.or(acc, curr), Bool(false));

    foundMember.assertTrue("Voter isn't a member");

    // Update voted status
    members.members = members.members.map(m => new Voter({
      publicKey: m.publicKey,
      voted: Bool.or(m.voted, m.publicKey.equals(voter.publicKey))
    }));

    this.up.set(nowUp.add(1));
  }


  @method async addDown(voter: Voter, members: Members) {
    const nowDown = this.up.getAndRequireEquals();
    const membersHash = this.membersHash.getAndRequireEquals();

    membersHash.assertEquals(members.hash(), "membersHash");

    const foundMember = members.members
      .map(m => m.publicKey.equals(voter.publicKey))
      .reduce((acc, curr) => Bool.or(acc, curr), Bool(false));

    foundMember.assertTrue("Voter isn't a member");

    // Update voted status
    members.members = members.members.map(m => new Voter({
      publicKey: m.publicKey,
      voted: Bool.or(m.voted, m.publicKey.equals(voter.publicKey))
    }));

    this.down.set(nowDown.add(1));

  }
}

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class Add extends SmartContract {
  @state(Field) num = State<Field>();
  @state(Field) down = State<Field>();
  @state(Field) membersHash = State<Field>();
  init() {
    super.init();
    this.num.set(Field(1));
    this.down.set(Field(0));
  }

  @method async update() {
    const currentState = this.num.getAndRequireEquals();
    const newState = currentState.add(2);
    const downState = this.down.getAndRequireEquals();
    this.down.set(downState.add(1));
    this.num.set(newState);
  }
}