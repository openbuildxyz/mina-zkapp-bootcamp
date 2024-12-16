import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import {
	CrowdFundingTiming
 } from "../task4/crowdfunding";

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

type PromiseType<T> = T extends Promise<infer U> ? U : never;

const MINA = 1e9;
const hardcapSlot = UInt64.from(100 * MINA);

let proofsEnabled = false;

const balance = (acc: Mina.TestPublicKey | PublicKey) => Mina.getBalance(acc).div(MINA).toJSON();

describe('Add', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		senderAccount: Mina.TestPublicKey,
		senderKey: PrivateKey,
		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: CrowdFundingTiming,
		endtimeSlot: UInt32,
		local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

	const withdrawBy = async (acc: Mina.TestPublicKey | PublicKey) => {
		const txn = await Mina.transaction(acc, async () => {
			await zkApp.withdraw();
		})
		await txn.prove();
		await txn.sign([deployerKey]).send();
	}

	const fundBy = async (acc: Mina.TestPublicKey | PublicKey, amount: number) => {
		const txn = await Mina.transaction(acc, async () => {
			await zkApp.fund(UInt64.from(amount * MINA));
		})
		await txn.prove();
		await txn.sign([deployerKey, senderKey]).send();
	}

	const sendCheck = async (acc: Mina.TestPublicKey | PublicKey, amount: number) => {
		const txn = await Mina.transaction(acc, async () => {
			const accUpdate = AccountUpdate.createSigned(acc);
			accUpdate.send({ to: zkAppAddress, amount: UInt64.from(amount * MINA) });
		})
		await txn.prove();
		await txn.sign([deployerKey]).send();
		console.log("Send Check Amount: ", amount)
	}

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
		console.log(`curBalance of ZkApp: ${curBalance}`)
	});

	it('correctly contribute on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		await fundBy(senderAccount, 10);

		const amount = zkApp.account.balance.getAndRequireEquals();
		expect(amount).toEqual(UInt64.from(10 * MINA));
	});

	it('send and withdraw on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		await fundBy(senderAccount, 10);

		const amount = zkApp.account.balance.getAndRequireEquals();
		expect(amount).toEqual(UInt64.from(10 * MINA));

		const senderBalance = AccountUpdate.create(senderAccount).balanceChange.equals(30 * MINA - 10 * MINA);
		expect(senderBalance).toBeTruthy();

		await fundBy(senderAccount, 90);

		console.log("Contribution total 100 Mina.")

		// Increment block height
		local.incrementGlobalSlot(30 + 1);
		const curSlot = local.getNetworkState().globalSlotSinceGenesis;
		console.log("current block height: ", curSlot.toString());

		console.log("Before withdraw: ", balance(deployerAccount));
		expect(
			Mina.transaction(senderAccount, async () => {
				console.log("bad draw by others");
				await zkApp.withdraw();
			})
		).rejects.toThrow();

		await withdrawBy(deployerAccount);
		console.log("Instant withdraw: ", balance(deployerAccount));
		for (let i = 1; i <= 5; i++) {
			local.incrementGlobalSlot(200);
			await sendCheck(deployerAccount, 10);
			console.log(`${i * 200} blocks later: `, balance(deployerAccount));
		}
	});
});
