import { AccountUpdate, Field, method, Permissions, PublicKey, SmartContract, state, State, UInt64 } from "o1js";

export const endTime = (duration: number): Field => {
	return Field(Math.floor((Date.now() + duration) / 1000))
}

export const sleep = (ms: number) => {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	})
}

export class CrowdFunding extends SmartContract {
	@state(UInt64) targetAmount = State<UInt64>();
	@state(UInt64) amount = State<UInt64>();
	@state(Field) endTime = State<Field>();
	@state(PublicKey) receiver = State<PublicKey>();

	init() {
		super.init();
		this.amount.set(UInt64.from(0));

		this.account.permissions.set({
			...Permissions.default(),
			setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
			setPermissions: Permissions.impossible(),
		})
	}

	@method async initState(targetAmount: UInt64, endtime: Field, receiver: PublicKey) {
		this.targetAmount.set(targetAmount);
		this.endTime.set(endtime);
		this.receiver.set(receiver);
	}

	@method async fund(amount: UInt64) {
		const currentTime = Field(Math.floor(Date.now() / 1000));
		const endTime = this.endTime.getAndRequireEquals();

		currentTime.assertLessThan(endTime, "Crowdfunding period has ended");

		const curAmount = this.amount.getAndRequireEquals();
		const targetAmount = this.targetAmount.getAndRequireEquals();

		curAmount.assertLessThan(targetAmount, "Crowdfunding target already reached");

		const senderUpdate = AccountUpdate.create(this.sender.getAndRequireSignature());
		senderUpdate.balanceChange.sub(amount);

		const newAmount = curAmount.add(amount);
		this.amount.set(newAmount);
	}

	@method async withdraw() {
		const currentTime = Field(Math.floor(Date.now() / 1000));
		const endTime = this.endTime.getAndRequireEquals();

		currentTime.assertGreaterThanOrEqual(endTime, "Crowdfunding period has not ended yet");

		const amount = this.amount.getAndRequireEquals();
		const receiver = this.receiver.getAndRequireEquals();
		const receiverUpdate = AccountUpdate.create(receiver);
		receiverUpdate.balanceChange.add(amount);

		this.amount.set(UInt64.from(0));
	}
}