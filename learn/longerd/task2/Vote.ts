import { Field, SmartContract, state, State, method, PublicKey, Signature, Bool, AccountUpdate, Circuit, MerkleMap, PrivateKey, MerkleMapWitness, Poseidon, Provable } from 'o1js';

export class Vote extends SmartContract {
    @state(PublicKey) deployerPublicKey = State<PublicKey>();
    @state(Field) VoteMemberMapRoot = State<Field>();
    // Number of positive votes
    @state(Field) positiveVotes = State<Field>();
    // Number of negative votes
    @state(Field) negativeVotes = State<Field>();

    init() {
        super.init();
        this.deployerPublicKey.set(this.sender.getAndRequireSignature());
        this.VoteMemberMapRoot.set(Field(0));
        this.positiveVotes.set(Field(0));
        this.negativeVotes.set(Field(0));
    }

    // vote
    @method async vote(isPositive: Field, witness: MerkleMapWitness) {
        // check member, todo: check duplicate voting
        const currentRoot = this.VoteMemberMapRoot.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        const key = Poseidon.hash(sender.toFields());
        const [root, keyWitness] = witness.computeRootAndKey(Field(1));
        Bool.and(
            currentRoot.equals(root),
            keyWitness.equals(key),
        ).assertTrue('Member validation failed');

        // check isPositive is 0 or 1
        Bool.or(
            isPositive.equals(Field(0)),
            isPositive.equals(Field(1)),
        ).assertTrue('Vote must be 0 or 1');

        // update votes. 
        const positiveVotes = this.positiveVotes.getAndRequireEquals();
        const negativeVotes = this.negativeVotes.getAndRequireEquals();
        this.positiveVotes.set(
            Provable.if(isPositive.equals(Field(1)),
                positiveVotes.add(1),
                positiveVotes
            )
        );
        this.negativeVotes.set(
            Provable.if(isPositive.equals(Field(0)),
                negativeVotes.add(1),
                negativeVotes
            )
        );

        // todo: update merkle root

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
            positive: this.positiveVotes.get(),
            negative: this.negativeVotes.get(),
        };
    }

    getMemberRoot() {
        return this.VoteMemberMapRoot.get();
    }
}