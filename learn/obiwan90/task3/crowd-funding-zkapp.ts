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
    Bool,
    UInt32,
    Struct,
    Provable
} from 'o1js';

// 定义事件结构
export class ContributionEvent extends Struct({
    from: PublicKey,
    contributed: UInt64,
    refunded: UInt64
}) { }

export class WithdrawalEvent extends Struct({
    amount: UInt64
}) { }

export class CrowdfundingContract extends SmartContract {
    @state(PublicKey) beneficiary = State<PublicKey>();  // 受益人地址
    @state(UInt64) hardCap = State<UInt64>();           // 硬顶
    @state(UInt32) endTime = State<UInt32>();           // 结束时间 区块高度

    events = {
        'contribution': ContributionEvent,
        'withdrawal': WithdrawalEvent
    };

    // 验证投资前置条件
    private validateContribution() {
        const hardCap = this.hardCap.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        const currentBalance = this.account.balance.getAndRequireEquals();

        // 验证时间窗口
        const currentTime = this.network.blockchainLength.get();
        this.network.blockchainLength.requireEquals(currentTime);

        // 检查众筹是否结束
        const isTimeEnded = currentTime.greaterThanOrEqual(endTime);
        const isHardCapReached = currentBalance.greaterThanOrEqual(hardCap);
        const isEnded = isTimeEnded.or(isHardCapReached);

        // 确保众筹未结束
        isEnded.not().assertTrue();

        return {
            hardCap,
            currentBalance
        };
    }

    // 验证提现前置条件
    private validateWithdrawal() {
        const beneficiary = this.beneficiary.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        const currentBalance = this.account.balance.getAndRequireEquals();
        const hardCap = this.hardCap.getAndRequireEquals();

        // 验证时间窗口
        const currentTime = this.network.blockchainLength.get();
        this.network.blockchainLength.requireEquals(currentTime);

        // 检查众筹是否结束
        const isTimeEnded = currentTime.greaterThanOrEqual(endTime);
        const isHardCapReached = currentBalance.greaterThanOrEqual(hardCap);
        const isEnded = isTimeEnded.or(isHardCapReached);

        // 确保众筹已结束
        isEnded.assertTrue();

        return {
            beneficiary,
            currentBalance
        };
    }

    // 计算实际可接受的投资金额和需要退还的金额
    private calculateContributionAmounts(
        amount: UInt64,
        hardCap: UInt64,
        currentBalance: UInt64
    ): { acceptedAmount: UInt64, refundAmount: UInt64 } {
        // 计算距离硬顶还剩多少额度
        const remainingToHardCap = hardCap.sub(currentBalance);

        // 计算实际可接受金额（取投资金额和剩余额度的较小值）
        const acceptedAmount = Provable.if(
            amount.lessThanOrEqual(remainingToHardCap),
            amount,
            remainingToHardCap
        );

        // 计算需要退还的金额
        const refundAmount = amount.sub(acceptedAmount);

        return { acceptedAmount, refundAmount };
    }

    // 部署
    async deploy(args: DeployArgs & {
        beneficiary: PublicKey,
        hardCap: UInt64,
        endTime: UInt32
    }) {
        await super.deploy(args);

        // 设置合约权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        })

        // 初始化状态
        this.beneficiary.set(args.beneficiary);
        this.hardCap.set(args.hardCap);
        this.endTime.set(args.endTime);
    }

    // 投资方法
    @method
    async contribute(amount: UInt64) {
        // 验证投资金额大于0
        amount.assertGreaterThan(UInt64.from(0));

        // 前置校验并获取状态
        const { hardCap, currentBalance } = this.validateContribution();

        // 计算实际接受金额和退款金额
        const { acceptedAmount, refundAmount } = this.calculateContributionAmounts(
            amount,
            hardCap,
            currentBalance
        );

        // 只接收实际需要的金额
        const senderUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignatureV2());
        senderUpdate.send({ to: this.address, amount: acceptedAmount });

        // 发出投资事件
        this.emitEvent('contribution', new ContributionEvent({
            from: this.sender.getAndRequireSignatureV2(),
            contributed: acceptedAmount,
            refunded: refundAmount
        }));
    }

    // 提现方法
    @method
    async withdraw() {
        // 前置校验并获取状态
        const { beneficiary, currentBalance } = this.validateWithdrawal();

        // 验证调用者是受益人
        this.sender.getAndRequireSignatureV2().assertEquals(beneficiary);

        // 转账给受益人
        this.send({ to: beneficiary, amount: currentBalance });

        // 发出提款事件
        this.emitEvent('withdrawal', new WithdrawalEvent({
            amount: currentBalance
        }));
    }
}