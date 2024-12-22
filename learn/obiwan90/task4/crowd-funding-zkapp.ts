import {
    Field,
    State,
    PublicKey,
    SmartContract,
    state,
    method,
    UInt64,
    Permissions,
    DeployArgs,
    AccountUpdate,
    UInt32,
    Struct,
} from 'o1js';

// 定义事件类型
export const EVENT_TYPE = {
    CONTRIBUTE: Field(1),
    WITHDRAW: Field(2)
} as const;

// 定义事件结构
export class CrowdfundingEvent extends Struct({
    type: Field,
    sender: PublicKey,
    amount: UInt64,
    timestamp: UInt32
}) { }

export class CrowdfundingContract extends SmartContract {
    @state(PublicKey) beneficiary = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();

    events = {
        crowdfunding: CrowdfundingEvent
    };

    async deploy(args: DeployArgs & {
        beneficiary: PublicKey,
        hardCap: UInt64,
        endTime: UInt32
    }): Promise<void> {
        await super.deploy(args);

        this.account.permissions.set({
            ...Permissions.default(),
            send: Permissions.proof(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible()
        });

        // 设置状态
        this.beneficiary.set(args.beneficiary);
        this.hardCap.set(args.hardCap);
        this.endTime.set(args.endTime);
    }

    @method
    async contribute(amount: UInt64): Promise<void> {
        const isHardCapReached = this.account.balance.getAndRequireEquals()
            .greaterThanOrEqual(this.hardCap.getAndRequireEquals());
        const isTimeEnded = this.network.blockchainLength.getAndRequireEquals()
            .greaterThanOrEqual(this.endTime.getAndRequireEquals());

        isHardCapReached.not().and(isTimeEnded.not())
            .assertTrue('无法投资:已达顶或众筹已结束');
        amount.assertGreaterThan(UInt64.from(0), '投资金额必须大于0');
        amount.lessThanOrEqual(
            this.hardCap.getAndRequireEquals().sub(this.account.balance.getAndRequireEquals())
        ).assertTrue('投资金额超过剩余额度');

        AccountUpdate.createSigned(this.sender.getAndRequireSignature())
            .send({ to: this.address, amount });

        this.emitEvent('crowdfunding', new CrowdfundingEvent({
            type: EVENT_TYPE.CONTRIBUTE,
            sender: this.sender.getAndRequireSignature(),
            amount: amount,
            timestamp: this.network.blockchainLength.getAndRequireEquals()
        }));
    }

    @method
    async withdraw(): Promise<void> {
        const beneficiary = this.beneficiary.getAndRequireEquals();
        this.sender.getAndRequireSignature().equals(beneficiary)
            .assertTrue('只有受益人可以提现');
        this.network.blockchainLength.getAndRequireEquals()
            .greaterThanOrEqual(this.endTime.getAndRequireEquals())
            .assertTrue('众筹未结束');

        const currentBalance = this.account.balance.getAndRequireEquals();
        const beneficiaryUpdate = AccountUpdate.createSigned(beneficiary);

        this.send({ to: beneficiaryUpdate, amount: currentBalance });
        beneficiaryUpdate.account.timing.set({
            initialMinimumBalance: currentBalance,
            cliffTime: this.network.blockchainLength.getAndRequireEquals(),
            cliffAmount: currentBalance.mul(2).div(10),    // 20%立即释放
            vestingPeriod: UInt32.from(2),                // 每2个区块（约6分钟）
            vestingIncrement: currentBalance.div(10)       // 释放10%
        });

        this.emitEvent('crowdfunding', new CrowdfundingEvent({
            type: EVENT_TYPE.WITHDRAW,
            sender: beneficiary,
            amount: currentBalance,
            timestamp: this.network.blockchainLength.getAndRequireEquals()
        }));
    }
}