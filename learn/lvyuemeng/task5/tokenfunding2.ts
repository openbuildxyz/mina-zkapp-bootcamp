import { AccountUpdate, method, Permissions, Provable, PublicKey, SmartContract, state, State, UInt32, UInt64, type DeployArgs } from 'o1js';
import { FungibleToken } from './FungibleToken';

export class FungibleTokenFunding extends SmartContract {
	events = {
		"payer": PublicKey,
		"receiver": PublicKey,
		"amount": UInt64
	}
	@state(UInt64) hardcap = State<UInt64>();
	@state(UInt32) endtime = State<UInt32>();
	@state(PublicKey) seller = State<PublicKey>();
	@state(PublicKey) fungibleToken = State<PublicKey>();

	static FungibleTokenContract: new (...args: any) => FungibleToken = FungibleToken;
	private async preCond() {
		const hardcap = this.hardcap.getAndRequireEquals();
		const endtime = this.endtime.getAndRequireEquals();
		const seller = this.seller.getAndRequireEquals();
		const curBalance = this.account.balance.getAndRequireEquals();
		const fungible = this.fungibleToken.getAndRequireEquals();

		const curTime = this.network.blockchainLength.getAndRequireEquals();

		const fungibleOr = await this.fungibleToken.fetch();
		fungibleOr?.assertEquals(fungible)
		curTime.greaterThan(endtime).assertFalse("crowdfunding end...");
		curBalance.greaterThan(hardcap).assertFalse("crowdfunding hardcap reached...");

		const fungibleContract = new FungibleTokenFunding.FungibleTokenContract(fungible)
		return {
			hardcap,
			endtime,
			seller,
			curBalance,
			fungibleContract,
		}
	}

	private preCalcFund(amount: UInt64) {
		const hardcap = this.hardcap.getAndRequireEquals();
		const curBalance = this.account.balance.getAndRequireEquals();

		const fund = curBalance.add(amount);
		const realfund = Provable.if(
			fund.greaterThanOrEqual(hardcap),
			hardcap.sub(curBalance),
			amount
		);

		return { realfund }
	}

	async deploy(args: DeployArgs & {
		seller: PublicKey,
		fungible: PublicKey,
		hardcap: UInt64,
		endtime: UInt32
	}) {
		await super.deploy(args);

		this.account.permissions.set({
			...Permissions.default(),
			send: Permissions.proof(),
			setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
			setPermissions: Permissions.impossible(),
			access: Permissions.proof(),
		})

		this.seller.set(args.seller);
		this.hardcap.set(args.hardcap);
		this.endtime.set(args.endtime);
		this.fungibleToken.set(args.fungible);
	}

	@method async fund(amount: UInt64) {
		const { seller, fungibleContract } = await this.preCond();
		const { realfund } = this.preCalcFund(amount);

		const senderAcc = this.sender.getAndRequireSignature();
		const senderUp = AccountUpdate.createSigned(senderAcc);
		await fungibleContract.transfer(seller, senderAcc, realfund);
		senderUp.send({ to: seller, amount: realfund })
		this.emitEvent("payer", senderAcc);
		this.emitEvent("amount", realfund);
	}
}