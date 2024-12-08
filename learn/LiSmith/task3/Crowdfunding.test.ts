import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import { CrowdFunding } from './Crowdfunding';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

type PromiseType<T> = T extends Promise<infer U> ? U : never;

const MINA = 1e9;
const hardcapSlot = UInt64.from(30 * MINA);

let proofsEnabled = false;

describe('Crowdfunding', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		senderAccount: Mina.TestPublicKey,
		senderKey: PrivateKey,
		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: CrowdFunding,
		endtimeSlot: UInt32,
		local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

	beforeAll(async () => {
		if (proofsEnabled) await CrowdFunding.compile();
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

		endtimeSlot = Local.getNetworkState().globalSlotSinceGenesis.add(30);
		local = Local
	});

	async function localDeploy() {
		const txn = await Mina.transaction(deployerAccount, async () => {
			AccountUpdate.fundNewAccount(deployerAccount);
			await zkApp.deploy({ receiver: deployerAccount, hardcap: hardcapSlot, endtime: endtimeSlot });
		});
		await txn.prove();
		// this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
		(await txn.sign([deployerKey, zkAppPrivateKey]).send());
	}

	it('generates and deploys the `CrowdFunding` smart contract', async () => {
		await localDeploy();
		const targetAmount = zkApp.hardcap.get();
		expect(targetAmount).toEqual(UInt64.from(hardcapSlot));

		const curBalance = zkApp.account.balance.getAndRequireEquals();
		console.log(`curBalance: ${curBalance}`)
	});

	it('correctly contribute on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.account.balance.getAndRequireEquals();
		expect(amount).toEqual(UInt64.from(10 * MINA));
	});

	it('correctly reduce sender account on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.account.balance.getAndRequireEquals();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();

		const overtxn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(30 * MINA));
		});
		await overtxn.prove();
		await overtxn.sign([senderKey]).send();

		const amount2 = zkApp.account.balance.getAndRequireEquals();
		expect(amount2).toEqual(UInt64.from(30 * MINA));

		const senderBalance_2 = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 20 * MINA);
		expect(senderBalance_2).toBeTruthy();
	});


	it('send and withdraw on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		// contribute transaction
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();

		const amount = zkApp.account.balance.getAndRequireEquals();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();

		local.incrementGlobalSlot(30 + 1);
		const curSlot = local.getNetworkState().globalSlotSinceGenesis;
		console.log("current block height: ", curSlot.toString());

		expect(
			Mina.transaction(senderAccount, async () => {
				console.log("bad draw by others");
				await zkApp.withdraw();
			})
		).rejects.toThrow();

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