import { AccountUpdate, DeployArgs, method, PublicKey, SmartContract, state, State, UInt64, Permissions, UInt32, Provable, Field, Poseidon, Bool } from "o1js";

const preimage0 = Field(1234567);
const hash0 = Poseidon.hash([preimage0]);

export class FundMe extends SmartContract {
    @state(UInt64) hardcap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();
    @state(PublicKey) receiver = State<PublicKey>();
    @state(Field) hashX = State<Field>(hash0);

    async deploy(props: DeployArgs & {
        hardcap: UInt64,
        endTime: UInt32,
        receiver: PublicKey
    }) {
        await super.deploy(props);
        this.hardcap.set(props.hardcap);
        this.endTime.set(props.endTime);
        this.receiver.set(props.receiver);
        this.hashX.set(hash0);

        // 初始化账户权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
            send: Permissions.proofOrSignature(),
        })
    }
    /**
     * 捐款
     * @param amount 
     */
    @method async fund(amount: UInt64) {
        const finalAmount = this.validateFund(amount);
        const sender = this.sender.getUnconstrainedV2();
        const senderUpdate = AccountUpdate.createSigned(sender);
        senderUpdate.send({ to: this, amount: finalAmount });

    }

    validateFund(amount: UInt64) {
        const hardcap = this.hardcap.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        const balance = this.account.balance.getAndRequireEquals();
        const currentTime = this.network.blockchainLength.getAndRequireEquals();

        currentTime.assertLessThanOrEqual(endTime, "fund ended...");
        balance.assertLessThanOrEqual(hardcap, "hardcap reached...");
        const finalAmount = Provable.if(balance.add(amount).greaterThan(hardcap),
            hardcap.sub(balance),
            amount
        )
        return finalAmount;
    }

    /**
     * 提款
     * @param amount 
     */
    @method async withdraw(amount: UInt64) {
        this.validateWithdraw(amount);
        const receiver = this.receiver.getAndRequireEquals();
        this.send({ to: receiver, amount });
    }

    validateWithdraw(amount: UInt64) {
        const endTime = this.endTime.getAndRequireEquals();
        const balance = this.account.balance.getAndRequireEquals();
        const currentTime = this.network.blockchainLength.getAndRequireEquals();
        const receiver = this.receiver.getAndRequireEquals();

        currentTime.assertGreaterThan(endTime, "fund not ended...");
        balance.assertGreaterThan(amount, "no balance...");
        this.sender.getUnconstrainedV2().assertEquals(receiver);
    }

    /**
     * @param caller the privileged account
     */
    @method async payout(preimage: Field, privilegedAddr: PublicKey) {
        // check time
        const endTime = this.endTime.getAndRequireEquals();
        const currentTime = this.network.blockchainLength.getAndRequireEquals();
        currentTime.assertGreaterThan(endTime, "fund not ended...");

        const hashX = this.hashX.getAndRequireEquals();
        let hash1 = Poseidon.hash([preimage]);
        hash1.assertEquals(hashX);

        // pay out the zkapp balance to the caller
        let balance = this.account.balance.getAndRequireEquals();
        // withdraw 20% of the balance
        let transferAmount = balance.div(5);

        const recieverAcctUpt = AccountUpdate.createSigned(privilegedAddr);
        // recieverAcctUpt.account.isNew.requireEquals(Bool(true));
        this.send({ to: recieverAcctUpt, amount: transferAmount });

        const vestingPeriod = UInt32.from(200);
        const initialMinimumBalance = balance.sub(transferAmount);
        // !!!vesting schedule!!!
        recieverAcctUpt.account.timing.set({
            initialMinimumBalance,
            cliffTime: UInt32.from(0),
            cliffAmount: UInt64.from(0),
            vestingPeriod,
            vestingIncrement: initialMinimumBalance.div(10),
        });
    }

}