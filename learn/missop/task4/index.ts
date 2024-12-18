import { AccountUpdate, DeployArgs, method, PublicKey, SmartContract, state, State, UInt64, Permissions, UInt32, Provable } from "o1js";

export class FundMe extends SmartContract {
    @state(UInt64) hardcap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();
    @state(PublicKey) receiver = State<PublicKey>();

    async deploy(props: DeployArgs & {
        hardcap: UInt64,
        endTime: UInt32,
        receiver: PublicKey
    }) {
        await super.deploy(props);
        this.hardcap.set(props.hardcap);
        this.endTime.set(props.endTime);
        this.receiver.set(props.receiver);

        // 初始化账户权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
            send: Permissions.proof(),
            setTiming: Permissions.proof()
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

    @method async payout() {
        // pay out the zkapp balance to the caller
        let balance = this.account.balance.getAndRequireEquals()

        // withdraw 20% of the balance
        let cliffAmount = balance.div(5);
        Provable.asProver(() => {
            console.log(`cliffAmount:${cliffAmount}`)
        })

        // !!!vesting schedule!!!
        this.account.timing.set({
            initialMinimumBalance: balance,
            // 第一次提款时间
            cliffTime: new UInt32(0),
            // 第一次提款金额
            cliffAmount,
            // 每次提款时间间隔
            vestingPeriod: UInt32.from(200),
            // 每次提款金额
            vestingIncrement: balance.div(10),
        });
    }

}