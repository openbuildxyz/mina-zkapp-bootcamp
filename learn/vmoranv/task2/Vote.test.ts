import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Bool } from 'o1js';
import { Vote } from './Vote';

let proofsEnabled = false;

describe('Vote', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        senderAccount: Mina.TestPublicKey,
        senderKey: PrivateKey,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey,
        zkApp: Vote;

    beforeAll(async () => {
        if (proofsEnabled) await Vote.compile();
    });

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);
        [deployerAccount, senderAccount] = Local.testAccounts;
        deployerKey = deployerAccount.key;
        senderKey = senderAccount.key;

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new Vote(zkAppAddress);
    });

    async function localDeploy() {
        const txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkApp.deploy();
        });
        await txn.prove();
        await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    it('generates and deploys the Vote smart contract', async () => {
        await localDeploy();

        const yesVotes = zkApp.yesVotes.get();
        const noVotes = zkApp.noVotes.get();
        const memberCount = zkApp.memberCount.get();

        expect(yesVotes).toEqual(Field(0));
        expect(noVotes).toEqual(Field(0));
        expect(memberCount).toEqual(Field(0));
    });

    it('allows adding team members', async () => {
        await localDeploy();

        const txn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.addTeamMember(senderAccount);
        });
        await txn.prove();
        await txn.sign([deployerKey]).send();

        const memberCount = zkApp.memberCount.get();
        expect(memberCount).toEqual(Field(1));
    });

    it('allows team members to vote', async () => {
        await localDeploy();

        const addMemberTxn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.addTeamMember(senderAccount);
        });
        await addMemberTxn.prove();
        await addMemberTxn.sign([deployerKey]).send();

        const voteTxn = await Mina.transaction(senderAccount, async () => {
            await zkApp.vote(senderAccount, Bool(true));
        });
        await voteTxn.prove();
        await voteTxn.sign([senderKey]).send();

        const yesVotes = zkApp.yesVotes.get();
        const noVotes = zkApp.noVotes.get();

        expect(yesVotes).toEqual(Field(1));
        expect(noVotes).toEqual(Field(0));
    });

    it('prevents non-team members from voting', async () => {
        await localDeploy();

        try {
            const voteTxn = await Mina.transaction(senderAccount, async () => {
                await zkApp.vote(senderAccount, Bool(true));
            });
            await voteTxn.prove();
            await voteTxn.sign([senderKey]).send();
            expect(false).toBe(true);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('prevents double voting', async () => {
        await localDeploy();

        const addMemberTxn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.addTeamMember(senderAccount);
        });
        await addMemberTxn.prove();
        await addMemberTxn.sign([deployerKey]).send();

        const voteTxn1 = await Mina.transaction(senderAccount, async () => {
            await zkApp.vote(senderAccount, Bool(true));
        });
        await voteTxn1.prove();
        await voteTxn1.sign([senderKey]).send();

        try {
            const voteTxn2 = await Mina.transaction(senderAccount, async () => {
                await zkApp.vote(senderAccount, Bool(false));
            });
            await voteTxn2.prove();
            await voteTxn2.sign([senderKey]).send();
            expect(false).toBe(true);
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    it('correctly retrieves vote results', async () => {
        await localDeploy();

        const addMemberTxn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.addTeamMember(senderAccount);
        });
        await addMemberTxn.prove();
        await addMemberTxn.sign([deployerKey]).send();

        const voteTxn = await Mina.transaction(senderAccount, async () => {
            await zkApp.vote(senderAccount, Bool(true));
        });
        await voteTxn.prove();
        await voteTxn.sign([senderKey]).send();

        const getResultsTxn = await Mina.transaction(deployerAccount, async () => {
            await zkApp.getVoteResult();
        });
        await getResultsTxn.prove();
        await getResultsTxn.sign([deployerKey]).send();

        expect(zkApp.yesVotesResult).toEqual(Field(1));
        expect(zkApp.noVotesResult).toEqual(Field(0));
    });
});
