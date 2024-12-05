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
} from 'o1js';

const initialFundMoney = 1e9; // 1 Mina received by each funder 

export class CrowdFunding extends SmartContract {
    @state(PublicKey) privileged = State<PublicKey>();
    @state(UInt64) fundGoal = State<UInt64>(UInt64.from(2 * 1e9));
    @state(UInt32) endTime = State<UInt32>(UInt32.from(1e8));

    async deploy(props: DeployArgs & {
        privileged: PublicKey
    }) {
        await super.deploy(props);

        // init app permission
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        });

        this.privileged.set(props.privileged);
    }

    @method
    async fund(money: UInt64) {
        // check if timestamp between
        const curTime = this.network.blockchainLength.getAndRequireEquals();
        curTime.assertLessThanOrEqual(this.endTime.getAndRequireEquals());
        const fundGoal = this.fundGoal.getAndRequireEquals();
        this.privileged.getAndRequireEquals();

        // assert 1 Mina
        money.assertGreaterThanOrEqual(UInt64.from(initialFundMoney));

        // assert has not reach fundgoal
        const balance = this.account.balance.getAndRequireEquals();
        balance.assertLessThan(fundGoal);

        const callerAddress = this.sender.getAndRequireSignature();
        const callerAccountUpdate = AccountUpdate.createSigned(callerAddress);

        callerAccountUpdate.send({ to: this.address, amount: UInt64.from(initialFundMoney) });
    }

    @method
    async withdraw() {
        // check that caller is the privileged account
        const privileged = this.privileged.getAndRequireEquals();
        const callerAddress = this.sender.getAndRequireSignature();
        const curTime = this.network.blockchainLength.getAndRequireEquals();
        curTime.assertGreaterThanOrEqual(this.endTime.getAndRequireEquals());
        callerAddress.assertEquals(privileged);

        // withdraw all of the zkapp balance to the caller
        const balance = this.account.balance.getAndRequireEquals();
        this.send({ to: privileged, amount: balance });
    }
}