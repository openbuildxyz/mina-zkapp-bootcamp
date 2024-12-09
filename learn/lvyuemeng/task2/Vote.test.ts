import { AccountUpdate, Bool, Field, Mina, PrivateKey, Provable, PublicKey } from 'o1js';
import { VoteBox, Voter, Members } from './store';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('Add', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		senderAccount: Mina.TestPublicKey,
		senderKey: PrivateKey,
		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: VoteBox,
		members: Members;

	beforeAll(async () => {
		if (proofsEnabled) await VoteBox.compile();
	});

	beforeEach(async () => {
		const Local = await Mina.LocalBlockchain({ proofsEnabled });
		Mina.setActiveInstance(Local);
		[deployerAccount, senderAccount] = Local.testAccounts;
		deployerKey = deployerAccount.key;
		senderKey = senderAccount.key;

		zkAppPrivateKey = PrivateKey.random();
		zkAppAddress = zkAppPrivateKey.toPublicKey();
		zkApp = new VoteBox(zkAppAddress);
		members = new Members({ members: [] });
	});

	async function localDeploy() {
		const txn = await Mina.transaction(deployerAccount, async () => {
			AccountUpdate.fundNewAccount(deployerAccount);
			await zkApp.deploy();
		});
		await txn.prove();
		// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
		await txn.sign([deployerKey, zkAppPrivateKey]).send();
	}

	it('generates and deploys the `Vote` smart contract', async () => {
		await localDeploy();
		const nowUp = zkApp.up.get();
		const nowDown = zkApp.down.get();
		expect(nowUp).toEqual(Field(0));
		expect(nowDown).toEqual(Field(0));
	});

	it('correctly updates the up state on the `Vote` smart contract', async () => {
		await localDeploy();

		// update transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			const voter = Voter.from(senderAccount);
			members.members = members.members.concat([voter]);
			await zkApp.register(members);
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const txn_add = await Mina.transaction(senderAccount, async () => {
			const voter = Voter.from(senderAccount);
			await zkApp.addUp(voter, members);
		});
		await txn_add.prove();
		await txn_add.sign([senderKey]).send();

		const updatedUp = zkApp.up.get();
		const updatedDown = zkApp.down.get();
		expect(updatedUp).toEqual(Field(1));
		expect(updatedDown).toEqual(Field(0));
	});

	it('correctly updates the down state on the `Vote` smart contract', async () => {
		await localDeploy();

		// update transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			const voter = Voter.from(senderAccount);
			members.members = members.members.concat([voter]);
			await zkApp.register(members);
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const txn_down = await Mina.transaction(senderAccount, async () => {
			const voter = Voter.from(senderAccount);
			await zkApp.addDown(voter, members);
		});
		await txn_down.prove();
		await txn_down.sign([senderKey]).send();

		const updatedUp = zkApp.up.get();
		const updatedDown = zkApp.down.get();
		expect(updatedUp).toEqual(Field(0));
		expect(updatedDown).toEqual(Field(1));
	});

	it('unregister updates failed on the `Vote` smart contract', async () => {
		await localDeploy();

		const action = async () => {
			const txn = await Mina.transaction(senderAccount, async () => {
				const voter = Voter.from(senderAccount);
				await zkApp.addUp(voter, members);
			});
			await txn.prove()
			await txn.sign([senderKey]).send();
		};

		await expect(action()).rejects.toThrow("undefined is not an object (evaluating 'obj[k]')");

		const updatedUp = zkApp.up.get();
		const updatedDown = zkApp.down.get();
		expect(updatedUp).toEqual(Field(0));
		expect(updatedDown).toEqual(Field(0));
	});
});
