import { Account, AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type Field } from 'o1js';
import { endTime, CrowdFunding, sleep } from '../task2/crowdfunding';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

const MINA = 1e9;
const hour = 60 * 60 * 1000;
const second_2 = 2 * 1000;
const targetAmountRequired = 100 * MINA;

let proofsEnabled = false;

describe('Add', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		senderAccount: Mina.TestPublicKey,
		senderKey: PrivateKey,
		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: CrowdFunding,
		targetAmount: UInt64,
		endtime: Field

	beforeAll(async () => {
		if (proofsEnabled) await CrowdFunding.compile();
		targetAmount = UInt64.from(targetAmountRequired);
		endtime = endTime(hour);
	});

	beforeEach(async () => {
		const Local = await Mina.LocalBlockchain({ proofsEnabled });
		Mina.setActiveInstance(Local);
		[deployerAccount, senderAccount] = Local.testAccounts;
		deployerKey = deployerAccount.key;
		senderKey = senderAccount.key;

		zkAppPrivateKey = PrivateKey.random();
		zkAppAddress = zkAppPrivateKey.toPublicKey();
		zkApp = new CrowdFunding(zkAppAddress);
	});

	async function localDeploy(endtime: Field) {
		const txn = await Mina.transaction(deployerAccount, async () => {
			AccountUpdate.fundNewAccount(deployerAccount);
			await zkApp.deploy();
			await zkApp.initState(targetAmount, endtime, deployerAccount);
		});
		await txn.prove();
		// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
		(await txn.sign([deployerKey, zkAppPrivateKey]).send());
	}

	it('generates and deploys the `CrowdFunding` smart contract', async () => {
		await localDeploy(endtime);
		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(0));

		const targetAmount = zkApp.targetAmount.get();
		expect(targetAmount).toEqual(UInt64.from(targetAmountRequired));

		const endtime_ = zkApp.endTime.get();
		expect(endtime_).toEqual(endtime);
	});

	it('correctly contribute on the `CrowdFunding` smart contract', async () => {
		await localDeploy(endtime);

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(10 * MINA));
	});

	it('correctly reduce sender account on the `CrowdFunding` smart contract', async () => {
		await localDeploy(endtime);

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();
	});

	it('correctly reduce sender account on the `CrowdFunding` smart contract', async () => {
		await localDeploy(endtime);

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();
	});


	it('withdraw on the `CrowdFunding` smart contract', async () => {
		// 1 hour ago for testing
		await localDeploy(endTime(-hour));

		await expect(
			Mina.transaction(senderAccount, async () => {
				await zkApp.fund(UInt64.from(10 * MINA));
			})
		).rejects.toThrow("Crowdfunding period has ended");

		const withdrawTxn = await Mina.transaction(deployerAccount, async () => {
			await zkApp.withdraw();
		})
		await withdrawTxn.prove();
		await withdrawTxn.sign([deployerKey]).send();

		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(0));

		const receiverBalance = AccountUpdate.create(senderAccount).balanceChange.equals(0);
		expect(receiverBalance).toBeTruthy();
	});

	it('send and withdraw on the `CrowdFunding` smart contract', async () => {
		await localDeploy(endTime(second_2));

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.amount.get();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();

		await sleep(second_2 * 2);

		const withdrawTxn = await Mina.transaction(deployerAccount, async () => {
			console.log("withdraw");
			await zkApp.withdraw();
		})
		await withdrawTxn.prove();
		await withdrawTxn.sign([deployerKey]).send();

		const receiverBalance = AccountUpdate.create(senderAccount).balanceChange.equals(10 * MINA);
		expect(receiverBalance).toBeTruthy();
	});
});
