import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import { CrowdFunding } from './CrowdFunding';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

type PromiseType<T> = T extends Promise<infer U> ? U : never;

const MINA = 1e9;
const TARGET_AMOUNT = UInt64.from(30 * MINA);

let proofsEnabled = false;

describe('CrowdFunding', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		contributorAccount: Mina.TestPublicKey,
		contributorKey: PrivateKey,
		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: CrowdFunding,
		endTimestamp: UInt32,
		local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

	beforeAll(async () => {
		if (proofsEnabled) await CrowdFunding.compile();
	});

	beforeEach(async () => {
		const Local = await Mina.LocalBlockchain({ proofsEnabled });
		Mina.setActiveInstance(Local);
		[deployerAccount, contributorAccount] = Local.testAccounts;
		deployerKey = deployerAccount.key;
		contributorKey = contributorAccount.key;

		zkAppPrivateKey = PrivateKey.random();
		zkAppAddress = zkAppPrivateKey.toPublicKey();

		zkApp = new CrowdFunding(zkAppAddress);

		endTimestamp = Local.getNetworkState().globalSlotSinceGenesis.add(30);
		local = Local;
	});

	async function localDeploy() {
		const txn = await Mina.transaction(deployerAccount, async () => {
				AccountUpdate.fundNewAccount(deployerAccount);
				await zkApp.deploy({
					beneficiary: deployerAccount,
					targetAmount: TARGET_AMOUNT,
					endTimestamp: endTimestamp
				});
		});
		await txn.prove();
		await txn.sign([deployerKey, zkAppPrivateKey]).send();
	}

	it('deploys the CrowdFunding contract with correct initial state', async () => {
		await localDeploy();

		const targetAmount = zkApp.targetAmount.get();
		expect(targetAmount).toEqual(TARGET_AMOUNT);

		const currentBalance = zkApp.account.balance.getAndRequireEquals();
		expect(currentBalance.toString()).toBe('0');
	});

	it('allows contributions within the funding period', async () => {
		await localDeploy();
		const contributionAmount = UInt64.from(10 * MINA);

		const txn = await Mina.transaction(contributorAccount, async () => {
			await zkApp.contribute(contributionAmount);
		});
		await txn.prove();
		await txn.sign([contributorKey]).send();

		const balance = zkApp.account.balance.getAndRequireEquals();
		expect(balance).toEqual(contributionAmount);
	});

	it('correctly updates contributor balance after contribution', async () => {
		await localDeploy();
		const contributionAmount = UInt64.from(10 * MINA);

		const txn = await Mina.transaction(contributorAccount, async () => {
			await zkApp.contribute(contributionAmount);
		});
		await txn.prove();
		await txn.sign([contributorKey]).send();

		const balance = zkApp.account.balance.getAndRequireEquals();
		expect(balance).toEqual(contributionAmount);

		const contributorBalance = AccountUpdate.create(contributorAccount).balanceChange;
		expect(contributorBalance.equals(30 * MINA - 10 * MINA)).toBeTruthy();
	});

	it('handles multiple contributions up to target amount', async () => {
		await localDeploy();

		// First contribution
		const txn1 = await Mina.transaction(contributorAccount, async () => {
			await zkApp.contribute(UInt64.from(10 * MINA));
		});
		await txn1.prove();
		await txn1.sign([contributorKey]).send();

		// Second contribution
		const txn2 = await Mina.transaction(contributorAccount, async () => {
			await zkApp.contribute(UInt64.from(20 * MINA));
		});
		await txn2.prove();
		await txn2.sign([contributorKey]).send();

		const finalBalance = zkApp.account.balance.getAndRequireEquals();
		expect(finalBalance).toEqual(TARGET_AMOUNT);
	});

	it('only allows beneficiary to withdraw after funding period ends', async () => {
		await localDeploy();

		// Make a contribution
		const contributionAmount = UInt64.from(10 * MINA);
		const txn = await Mina.transaction(contributorAccount, async () => {
			await zkApp.contribute(contributionAmount);
		});
		await txn.prove();
		await txn.sign([contributorKey]).send();

		// Advance time past end timestamp
		local.incrementGlobalSlot(31);

		// Non-beneficiary withdrawal should fail
		await expect(
			(async () => {
				const withdrawTxn = await Mina.transaction(contributorAccount, async () => {
					await zkApp.withdraw();
				});
				await withdrawTxn.prove();
				await withdrawTxn.sign([contributorKey]).send();
			})()
		).rejects.toThrow();

		// Beneficiary withdrawal should succeed
		const withdrawTxn = await Mina.transaction(deployerAccount, async () => {
			await zkApp.withdraw();
		});
		await withdrawTxn.prove();
		await withdrawTxn.sign([deployerKey]).send();

		const finalBalance = zkApp.account.balance.getAndRequireEquals();
		expect(finalBalance.toString()).toBe('0');
	});
});
