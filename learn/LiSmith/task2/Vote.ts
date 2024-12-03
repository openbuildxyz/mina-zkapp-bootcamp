import { Field, SmartContract, state, State, MerkleMapWitness, method,  Poseidon, Bool,  Provable, PublicKey } from 'o1js';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class Vote extends SmartContract {
  @state(PublicKey) deployer = State<PublicKey>();
  @state(Field) memberHashRoot = State<Field>(); // Merkle Root of team members

  @state(Field) approveCount = State<Field>(Field(0));
  @state(Field) rejectCount = State<Field>(Field(0));

  init() {
    super.init();
    this.deployer.set(this.sender.getAndRequireSignature());
    this.memberHashRoot.set(Field(0));
  }

  @method async vote(approve: Field, memberWitness: MerkleMapWitness ) {
    
    Bool.or(
      approve.equals(Field(0)),
      approve.equals(Field(1)),
    ).assertTrue('Vote must be 0 or 1');

    const currentMemberRoot = this.memberHashRoot.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    const key = Poseidon.hash(sender.toFields());
    const [root, keyWitness] = memberWitness.computeRootAndKey(Field(1));
    Bool.and(currentMemberRoot.equals(root), keyWitness.equals(key)).assertTrue(
      'Member validation failed'
    );


    const approveCount = this.approveCount.getAndRequireEquals();
    const rejectCount = this.rejectCount.getAndRequireEquals();
    this.approveCount.set(
      Provable.if(approve.equals(Field(1)),
        approveCount.add(1),
        approveCount
      )
    );
    this.rejectCount.set(
      Provable.if(approve.equals(Field(0)),
        rejectCount.add(1),
        rejectCount
      )
    );
  }


  @method async addMember(newRoot: Field) {
    const deployer = this.deployer.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    sender.equals(deployer).assertTrue('Only deployer can add members');

    this.memberHashRoot.set(newRoot);
  }


  getVoteCounts() {
    return {
      approve: this.approveCount.get(),
      reject: this.rejectCount.get(),
    };
  }
}
