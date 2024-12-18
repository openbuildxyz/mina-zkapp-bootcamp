import {
    state,
    State,
    method,
    UInt64,
    SmartContract,
    AccountUpdate,
    PublicKey,
    DeployArgs,
    Permissions,
    UInt32,
    Bool,
    Provable,
    PrivateKey,
} from 'o1js';

const initialFundMoney = 1e9; // 1 Mina received by each funder 

export class CrowdFunding extends SmartContract {
    @state(PublicKey) privileged = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();
    @state(Bool) isEnd = State<Bool>(Bool(false));

    async deploy(props: DeployArgs & {
        privileged: PublicKey,
        hardCap: UInt64,
        endTime: UInt32,
    }) {
        await super.deploy(props);

        // init app permission
        this.account.permissions.set({
            ...Permissions.default(),
            // send: Permissions.proof(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        });

        this.privileged.set(props.privileged);
        this.hardCap.set(props.hardCap);
        this.endTime.set(props.endTime);
    }

    @method
    async fund(money: UInt64) {
        // check if end
        this.isEnd.requireEquals(Bool(false));
        const curTime = this.network.blockchainLength.getAndRequireEquals();
        curTime.assertLessThanOrEqual(this.endTime.getAndRequireEquals());
        
        this.privileged.getAndRequireEquals();
        
        // assert 1 Mina
        money.assertGreaterThanOrEqual(UInt64.from(initialFundMoney));
        
        // assert has not reach fundgoal
        const fundGoal = this.hardCap.getAndRequireEquals();
        const balance = this.account.balance.getAndRequireEquals();
        balance.assertLessThan(fundGoal);

        const callerAddress = this.sender.getAndRequireSignature();
        const callerAccountUpdate = AccountUpdate.createSigned(callerAddress);

        callerAccountUpdate.send({ to: this.address, amount: UInt64.from(initialFundMoney) });
    }

    @method
    async withdraw(withdraw: PrivateKey) {
        // check that caller is the privileged account
        const privileged = this.privileged.getAndRequireEquals();
        const curTime = this.network.blockchainLength.getAndRequireEquals();
        curTime.assertGreaterThanOrEqual(this.endTime.getAndRequireEquals());
        const withdrawAddr = withdraw.toPublicKey();
        withdrawAddr.assertEquals(privileged);

        // assert account first withdraw
        const callerAccountUpdate = AccountUpdate.createSigned(withdrawAddr);
        // callerAccountUpdate.account.isNew.requireEquals(Bool(true));
        const balance = this.account.balance.getAndRequireEquals();
        const tenPercent = balance.div(10);
        
        this.send({ to: callerAccountUpdate, amount: balance });
        this.isEnd.set(Bool(true));

        // withdraw 20% at first， then schedule withdraw 10% by one time at every 200 solts
        callerAccountUpdate.account.timing.set({
            initialMinimumBalance: UInt64.from(balance),
            cliffTime: UInt32.from(0),
            cliffAmount: UInt64.from(tenPercent.mul(2)),
            vestingPeriod: UInt32.from(200),
            vestingIncrement: tenPercent,
        });
        
    }
}