import { Vote } from './Vote';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, MerkleMap, Bool, Poseidon } from 'o1js';

describe('Vote Contract', () => {
    let deployerAccount: Mina.TestPublicKey,
        account1: Mina.TestPublicKey,
        account2: Mina.TestPublicKey,
        zkApp: Vote,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey;

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);

        [deployerAccount, account1, account2] = Local.testAccounts;

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new Vote(zkAppAddress);
        await deployContract();
    });

    async function deployContract() {
        const txn = await Mina.transaction({
            sender: deployerAccount,
        }, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkApp.deploy();
        });
        await txn.prove();
        await txn.sign([deployerAccount.key, zkAppPrivateKey]).send();
    }

    it('should initialize with zero votes', async () => {
        const approveVotes = await zkApp.approveVotes.get();
        const rejectVotes = await zkApp.rejectVotes.get();

        expect(approveVotes).toEqual(Field(0));
        expect(rejectVotes).toEqual(Field(0));
    });

    it('should add a new member successfully', async () => {
        const memberMap = new MerkleMap();
        const memberAddress = Poseidon.hash(account1.toFields());
        memberMap.set(memberAddress, Field(6));
        const witness = memberMap.getWitness(memberAddress);

        const txn = await Mina.transaction({
            sender: deployerAccount,
        }, async () => {
            zkApp.addMember(witness);
        });
        await txn.prove();
        await txn.sign([deployerAccount.key]).send();

        const newRoot = await zkApp.memberRoot.get();
        expect(newRoot).toEqual(memberMap.getRoot());
    });

    it('should allow member to submit approve vote', async () => {
        // Setup member
        const memberMap = new MerkleMap();
        const memberAddress = Field(123);
        const witness = memberMap.getWitness(memberAddress);

        // Add member
        let txn = await Mina.transaction({
            sender: deployerAccount,
        }, async () => {
            zkApp.addMember(witness);
        });
        await txn.prove();
        await txn.sign([deployerAccount.key]).send();

        // Submit vote
        txn = await Mina.transaction({
            sender: deployerAccount,
        }, async () => {
            zkApp.submitVote(Bool(true), memberAddress, witness);
        });
        await txn.prove();
        await txn.sign([deployerAccount.key]).send();

        const approveVotes = zkApp.approveVotes.get();
        expect(approveVotes).toEqual(Field(1));
    });
});
