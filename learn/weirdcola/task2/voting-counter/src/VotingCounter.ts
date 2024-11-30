import {
  Field,
  Bool,
  SmartContract,
  State,
  state,
  method,
  PublicKey,
  UInt32,
  Poseidon,
  Provable,
  MerkleMapWitness,
  Signature,
} from 'o1js';
import { console_log } from 'o1js/dist/node/bindings/compiled/node_bindings/plonk_wasm.cjs';

export class VoteApp extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(UInt32) approveVotes = State<UInt32>(UInt32.from(0));
  @state(UInt32) rejectVotes = State<UInt32>(UInt32.from(0));
  @state(Field) whiteListTreeRoot = State<Field>(Field(0)); // Root of the Merkle tree for whitelist

  @method async initState(root: Field) {
    super.init();
    this.owner.set(this.sender.getAndRequireSignature());
    this.whiteListTreeRoot.set(root); //save the 
  }

  @method async vote(approve: Bool, signature: Signature, voterPubKey: PublicKey, witness: MerkleMapWitness) {
    //check status 
    const currentRoot = this.whiteListTreeRoot.getAndRequireEquals();
   
    let leaf_hash = Poseidon.hash(voterPubKey.toFields());
    const [root, keyWitness] = witness.computeRootAndKey(leaf_hash);
  
    currentRoot.assertEquals(root);
    keyWitness.assertEquals(leaf_hash);

    signature.verify(voterPubKey, [approve.toField()]).assertTrue(
      'invalid voter signature'
    );
    // Record the vote
    let approveVotes = this.approveVotes.getAndRequireEquals();
    let rejectVotes = this.rejectVotes.getAndRequireEquals();
    // update the votes 
    this.approveVotes.set(approveVotes.add(Provable.if(approve, UInt32.from(1), UInt32.from(0))));
    this.rejectVotes.set(rejectVotes.add(Provable.if(approve, UInt32.from(0), UInt32.from(1))));

  }
  getVoteCounts() {
    return {
      approve: this.approveVotes.get(),
      reject: this.rejectVotes.get(),
    };
  }

  getMemberRoot() {
    return this.whiteListTreeRoot.get();
  }
}
