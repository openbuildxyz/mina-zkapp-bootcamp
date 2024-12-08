import { VoteContract } from '../src/VoteContract';
import {
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
    PublicKey,
    MerkleMap,
    Poseidon,
    Bool,
} from 'o1js';

describe('VoteContract', () => {
    let deployerAccount: Mina.TestPublicKey,
        account2: Mina.TestPublicKey,
        account3: Mina.TestPublicKey;
    let zkAppAddress: PublicKey, zkAppPrivateKey: PrivateKey;
    let zkApp: VoteContract;
    let memberMap: MerkleMap;

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);
        [deployerAccount, account2, account3] = Local.testAccounts;
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new VoteContract(zkAppAddress);
        memberMap = new MerkleMap();
    });

    async function localDeploy() {
        const txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkApp.deploy();
        });
        await txn.prove();
        await txn.sign([deployerAccount.key, zkAppPrivateKey]).send();
    }

    it('只允许部署者才能添加投票成员', async () => {
        await localDeploy();
        const member1Field = Poseidon.hash(account2.toFields());
        const member1Witness = memberMap.getWitness(member1Field);
        await expect(async () => {
            const txn = await Mina.transaction(account2, async () => {
                await zkApp.AddMember(member1Witness);
            });
            await txn.prove();
            await txn.sign([account2.key]).send();
        }).rejects.toThrow('只有部署者才能添加成员');
        const txn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.AddMember(member1Witness);
        });
        await txn.prove();
        await txn.sign([deployerAccount.key]).send();
        memberMap.set(member1Field, Field(1));
        const updatedMembershipRoot = zkApp.votedMembersRoot.get();
        expect(memberMap.getRoot()).toEqual(updatedMembershipRoot);
    });

    it('只能允许部署者添加的成员投票', async () => {
        await localDeploy();
        const address2 = Poseidon.hash(account2.toFields());
        memberMap.set(address2, Field(6));
        const witness2 = memberMap.getWitness(address2);
        let txn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.AddMember(witness2);
        });
        await txn.prove();
        await txn.sign([deployerAccount.key]).send();

        txn = await Mina.transaction(account2, async () => {
            await zkApp.Vote(Bool(true), witness2);
        });
        await txn.prove();
        await txn.sign([account2.key]).send();

        const approveVotes = zkApp.approveVotes.get();
        const opposeVotes = zkApp.opposeVotes.get();
        expect(approveVotes).toEqual(Field(1));
        expect(opposeVotes).toEqual(Field(0));
    });

    it('不应该允许非会员投票', async () => {
        await localDeploy();
        const address2 = Poseidon.hash(account2.toFields());
        const witness2 = memberMap.getWitness(address2);
        expect(async () => {
            const txn = await Mina.transaction(account2, async () => {
                await zkApp.Vote(Bool(true), witness2);
            });
            await txn.prove();
            await txn.sign([account2.key]).send();
        }).rejects.toThrow('成员验证失败');
        const approveVotes = zkApp.approveVotes.get();
        const opposeVotes = zkApp.opposeVotes.get();
        expect(approveVotes).toEqual(Field(0));
        expect(opposeVotes).toEqual(Field(0));
    });
});
