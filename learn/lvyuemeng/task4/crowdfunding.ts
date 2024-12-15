import { AccountUpdate, Bool, method, Permissions, Provable, PublicKey, SmartContract, state, State, UInt32, UInt64, type DeployArgs } from 'o1js';

const SlotsRequired = 200;

export class CrowdFunding extends SmartContract {
	events = {
		"payer": PublicKey,
		"receiver": PublicKey,
		"amount": UInt64
	}
	@state(UInt64) hardcap = State<UInt64>();
	@state(UInt32) endtime = State<UInt32>();
	@state(PublicKey) receiver = State<PublicKey>();

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

	private sendTiming(curBalance: UInt64, acc: PublicKey) {
		const accUpdate = AccountUpdate.createSigned(acc);

		const linearAmount = curBalance.div(10);

		const t = curBalance.div(5);
		this.send({ to: accUpdate, amount: t })
		accUpdate.account.timing.set({
			initialMinimumBalance: curBalance.sub(t),
			cliffTime: UInt32.from(0),
			cliffAmount: UInt64.from(0),
			vestingPeriod: UInt32.from(SlotsRequired),
			vestingIncrement: linearAmount,
		})
	}

	async deploy(args: DeployArgs & {
		receiver: PublicKey,
		hardcap: UInt64,
		endtime: UInt32
	}) {
		await super.deploy(args);

		this.account.permissions.set({
			...Permissions.default(),
			send: Permissions.proof(),
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

		const senderAcc = this.sender.getAndRequireSignature();
		const senderUpdate = AccountUpdate.createSigned(senderAcc);
		senderUpdate.send({ to: this, amount: realfund })
		this.emitEvent("payer", senderAcc);
		this.emitEvent("amount", realfund);
	}

	@method async withdraw() {
		const { receiver, curBalance } = this.preCond();

		this.sender.getAndRequireSignature().assertEquals(receiver);
		this.sendTiming(curBalance, receiver);
		this.emitEvent("receiver", receiver);
		this.emitEvent("amount", curBalance);
	}
}