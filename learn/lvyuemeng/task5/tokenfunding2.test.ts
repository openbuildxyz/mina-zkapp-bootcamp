
import { AccountUpdate, Bool, Mina, PrivateKey, PublicKey, TokenContract, UInt32, UInt64, UInt8, type Field } from 'o1js';
import { FungibleTokenFunding } from "../task5/tokenfunding2";
import { FungibleToken } from '../task5/FungibleToken';
import { FungibleTokenAdmin } from '../task5/FungibleTokenAdmin';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

type PromiseType<T> = T extends Promise<infer U> ? U : never;

const MINA = 1e9;
const FEE = 1e8;
const hardcapSlot = UInt64.from(100 * MINA);

let proofsEnabled = false;

const balance = (acc: Mina.TestPublicKey | PublicKey) => Mina.getBalance(acc).div(MINA).toJSON();

describe('Add', () => {
	let deployerAccount: Mina.TestPublicKey,
		deployerKey: PrivateKey,
		senderAccount: Mina.TestPublicKey,
		senderKey: PrivateKey,
		test: Mina.TestPublicKey,
		testKey: PrivateKey,
		seller: Mina.TestPublicKey,
		sellerKey: PrivateKey,

		zkAppAddress: PublicKey,
		zkAppPrivateKey: PrivateKey,
		zkApp: FungibleTokenFunding,

		AdminAddr: PublicKey,
		AdminKey: PrivateKey,
		Admin: FungibleTokenAdmin,
		token: FungibleToken,
		tokenKey: PrivateKey,
		tokenAddr: PublicKey,
		tokenId: Field,

		endtimeSlot: UInt32,
		local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

	const fundBy = async (amount: number) => {
		const txn = await Mina.transaction(senderAccount, async () => {
			AccountUpdate.fundNewAccount(senderAccount);
			await zkApp.fund(UInt64.from(amount * MINA));
		})
		await txn.prove();
		await txn.sign([sellerKey, senderKey, tokenKey]).send().wait();
	}

	beforeAll(async () => {
		if (proofsEnabled) {
			await FungibleToken.compile()
			await FungibleTokenAdmin.compile()
			await FungibleTokenFunding.compile()
		}
	});

	beforeEach(async () => {
		const Local = await Mina.LocalBlockchain({ proofsEnabled });
		Mina.setActiveInstance(Local);
		[deployerAccount, senderAccount, test, seller] = Local.testAccounts;
		deployerKey = deployerAccount.key;
		senderKey = senderAccount.key;
		testKey = test.key
		sellerKey = seller.key

		const tokenKeys = PrivateKey.randomKeypair();
		const ownerKeys = PrivateKey.randomKeypair();

		AdminAddr = ownerKeys.publicKey;
		AdminKey = ownerKeys.privateKey;
		Admin = new FungibleTokenAdmin(AdminAddr);
		token = new FungibleToken(tokenKeys.publicKey);
		tokenAddr = tokenKeys.publicKey
		tokenKey = tokenKeys.privateKey
		tokenId = token.deriveTokenId();

		zkAppPrivateKey = PrivateKey.random();
		zkAppAddress = zkAppPrivateKey.toPublicKey();
		zkApp = new FungibleTokenFunding(zkAppAddress);

		endtimeSlot = Local.getNetworkState().globalSlotSinceGenesis.add(30);
		local = Local
	});

	async function localDeploy() {
		const txn = await Mina.transaction({ sender: deployerAccount, fee: FEE }, async () => {
			AccountUpdate.fundNewAccount(deployerAccount, 3);
			await Admin.deploy({ adminPublicKey: AdminAddr });
			await token.deploy({ symbol: "Dog", src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts", allowUpdates: false });
			await token.initialize(AdminAddr, UInt8.from(9), Bool(false))
		});
		await txn.prove();
		(await txn.sign([deployerKey, zkAppPrivateKey, tokenKey, AdminKey]).send());

		const txn_d = await Mina.transaction({ sender: deployerAccount, fee: FEE }, async () => {
			AccountUpdate.fundNewAccount(deployerAccount);
			await zkApp.deploy({
				seller: seller, hardcap: hardcapSlot, endtime: endtimeSlot,
				fungible: tokenAddr
			});
		});
		await txn_d.prove();
		(await txn_d.sign([deployerKey, zkAppPrivateKey]).send());

		const mint = await Mina.transaction(deployerAccount, async () => {
			AccountUpdate.fundNewAccount(deployerAccount, 1);
			await token.mint(seller, UInt64.from(100 * MINA))
		})
		await mint.prove()
		mint.sign([deployerKey, AdminKey])
		await mint.send().wait();
		console.log("seller: ", ((await token.getBalanceOf(seller)).toBigInt()))
	}

	it('deploy contracts and basic mint', async () => {
		await localDeploy();
		const targetAmount = zkApp.hardcap.get();
		expect(targetAmount).toEqual(UInt64.from(hardcapSlot));

		const curBalance = zkApp.account.balance.getAndRequireEquals();
		console.log(`curBalance of ZkApp: ${curBalance}`)
	});

	it('correctly contribute on the `CrowdFunding` smart contract', async () => {
		await localDeploy();

		await fundBy(10);

		console.log("After Transaction: ")
		console.log("buyer: ", ((await token.getBalanceOf(senderAccount)).toBigInt()))
		console.log("seller: ", ((await token.getBalanceOf(seller)).toBigInt()))
	});

	it('After Block', async () => {
		await localDeploy();

		await fundBy(10);

		console.log("After Transaction: ")
		console.log("buyer: ", ((await token.getBalanceOf(senderAccount)).toBigInt()))
		console.log("seller: ", ((await token.getBalanceOf(seller)).toBigInt()))

		local.setBlockchainLength(UInt32.from(2000));

		expect(
			Mina.transaction(senderAccount, async () => {
				AccountUpdate.fundNewAccount(senderAccount);
				await zkApp.fund(UInt64.from(10 * MINA));
			})
		).rejects.toThrow();
	})
});
