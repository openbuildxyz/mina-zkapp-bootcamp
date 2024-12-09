import { Field, SmartContract, state, State, method, PublicKey, Signature, Bool, AccountUpdate, Circuit, MerkleMap, PrivateKey, MerkleMapWitness, Poseidon, Provable } from 'o1js';

export class Vote extends SmartContract {
    @state(PublicKey) deployerPublicKey = State<PublicKey>();
    @state(Field) VoteMemberMapRoot = State<Field>();
    // Number of positive votes
    @state(Field) yesVotes = State<Field>();
    // Number of negative votes
    @state(Field) noVotes = State<Field>();

    init() {
        super.init();
        this.deployerPublicKey.set(this.sender.getAndRequireSignature());
        this.VoteMemberMapRoot.set(Field(0));
        this.yesVotes.set(Field(0));
        this.noVotes.set(Field(0));
    }

    // vote
    @method async vote(isYes: Field, witness: MerkleMapWitness) {
        // check member
        const currentRoot = this.VoteMemberMapRoot.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        const key = Poseidon.hash(sender.toFields());
        const [root, keyWitness] = witness.computeRootAndKey(Field(1));
        Bool.and(
            currentRoot.equals(root),
            keyWitness.equals(key),
        ).assertTrue('Member validation failed');

        // check isYes is 0 or 1
        isYes.mul(isYes.sub(Field(1))).assertEquals(Field(0));

        // update votes. yesVotes = yesVotes + isYes, noVotes = noVotes + 1 - isYes
        let currentYesVotes = this.yesVotes.getAndRequireEquals();
        this.yesVotes.set(currentYesVotes.add(isYes));

        let currentNoVotes = this.noVotes.getAndRequireEquals();
        this.noVotes.set(currentNoVotes.add(Field(1)).sub(isYes));
    }

    // update merkle root of member lists
    @method async updateMemberRoot(newRoot: Field) {
        const deployer = this.deployerPublicKey.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        sender.equals(deployer).assertTrue('Only deployer can perform this action');
        this.VoteMemberMapRoot.set(newRoot);
    }

    getVoteCounts() {
        return {
            approve: this.yesVotes.get(),
            reject: this.noVotes.get(),
        };
    }

    getMemberRoot() {
        return this.VoteMemberMapRoot.get();
    }
}