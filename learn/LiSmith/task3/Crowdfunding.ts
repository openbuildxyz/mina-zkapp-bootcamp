import { AccountUpdate, Bool, method, Permissions, Provable, PublicKey, SmartContract, state, State, UInt32, UInt64, type DeployArgs } from 'o1js';

export class CrowdFunding extends SmartContract {
	@state(UInt64) hardcap = State<UInt64>();
	@state(UInt32) endtime = State<UInt32>();
	@state(PublicKey) receiver = State<PublicKey>();
	@state(Bool) closed = State<Bool>(Bool(false));

	private preCond() {
		const hardcap = this.hardcap.getAndRequireEquals();
		const endtime = this.endtime.getAndRequireEquals();
		const receiver = this.receiver.getAndRequireEquals();
		const curBalance = this.account.balance.getAndRequireEquals();

		const curTime = this.network.blockchainLength.getAndRequireEquals();

		curTime.greaterThan(endtime).assertFalse("crowdfunding end...");
		curBalance.greaterThan(hardcap).assertFalse("crowdfunding hardcap reached...");

		return {
			hardcap,
			endtime,
			receiver,
			curBalance,
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
		receiver: PublicKey,
		hardcap: UInt64,
		endtime: UInt32
	}) {
		await super.deploy(args);

		this.account.permissions.set({
			...Permissions.default(),
			setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
			setPermissions: Permissions.impossible(),
		})

		this.receiver.set(args.receiver);
		this.hardcap.set(args.hardcap);
		this.endtime.set(args.endtime);
	}

	@method async fund(amount: UInt64) {
		this.preCond();
		const { realfund } = this.preCalcFund(amount);

		const senderUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
		senderUpdate.send({ to: this, amount: realfund })
	}

	@method async withdraw() {
		const { receiver, curBalance } = this.preCond();

		this.sender.getAndRequireSignature().assertEquals(receiver);
		this.send({ to: receiver, amount: curBalance })
	}
}