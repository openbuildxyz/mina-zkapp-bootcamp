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
    Provable,
} from 'o1js';

// 定义统一的事件结构
export class AmountEvent extends Struct({
    type: Field,  // 1 表示投资，2 表示提现 3 退款
    amount: UInt64
}) { }

// 状态接口
interface BaseState {
    beneficiary: State<PublicKey>;
    hardCap: State<UInt64>;
    endTime: State<UInt32>;
}

const CONTRIBUTE = Field(1);
const WITHDRAW = Field(2);
const REFUND = Field(3);
// 状态检查装饰器
function checkState(operationType: Field, errorMessage: string) {
    return function <T extends SmartContract & BaseState>(
        target: T,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = function (this: T, ...args: any[]) {
            const isHardCapReached = this.account.balance.getAndRequireEquals().greaterThanOrEqual(this.hardCap.getAndRequireEquals());
            const isTimeEnded = this.network.blockchainLength.getAndRequireEquals().greaterThanOrEqual(this.endTime.getAndRequireEquals());
            // 投资：未达到硬顶且未结束
            // 提现：已达到硬顶或已结束
            const canContribute = isHardCapReached.not().and(isTimeEnded.not());
            const canWithdraw = isHardCapReached.or(isTimeEnded);

            operationType.equals(CONTRIBUTE).and(canContribute)
                .or(operationType.equals(WITHDRAW).and(canWithdraw))
                .assertTrue(errorMessage);

            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}

export class CrowdfundingContract extends SmartContract implements BaseState {
    @state(PublicKey) beneficiary = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();

    events = { 'amount': AmountEvent };

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

    // 投资
    @method
    @checkState(CONTRIBUTE, 'Cannot contribute: hard cap reached or window closed') //达到硬顶或已结束
    async contribute(amount: UInt64) {
        // 投资金额必须大于0
        amount.assertGreaterThan(UInt64.from(0), 'Amount must be greater than 0');
        // 剩余金额
        const remainingToHardCap = this.hardCap.getAndRequireEquals().sub(this.account.balance.getAndRequireEquals());
        // 接受金额
        const acceptedAmount = Provable.if(amount.lessThanOrEqual(remainingToHardCap), amount, remainingToHardCap);
        // 退款金额
        const refundAmount = amount.sub(acceptedAmount);
        // 投资者账户
        const sender = this.sender.getAndRequireSignature();
        const senderAccount = AccountUpdate.createSigned(sender);
        // 投资者账户发送金额   
        senderAccount.send({ to: this.address, amount: acceptedAmount });
        // 投资者账户退款
        senderAccount.send({ to: sender, amount: refundAmount });
        // 投资事件
        this.emitEvent('amount', new AmountEvent({ type: Field(1), amount: acceptedAmount }));
        // 退款事件
        this.emitEvent('amount', new AmountEvent({ type: Field(3), amount: refundAmount }));
    }

    // 提现 
    @method
    @checkState(WITHDRAW, 'Cannot withdraw: neither hard cap reached nor window closed') //未达到硬顶或未结束
    async withdraw() {
        // 当前余额
        const currentBalance = this.account.balance.getAndRequireEquals();
        const beneficiary = this.beneficiary.getAndRequireEquals();
        // Only beneficiary
        this.sender.getAndRequireSignature().equals(beneficiary).assertTrue('Only beneficiary can withdraw');
        // 余额不为0
        currentBalance.greaterThan(UInt64.from(0)).assertTrue('Balance must be greater than 0');
        // 发送受益人
        this.send({ to: beneficiary, amount: currentBalance });
        // 提现事件
        this.emitEvent('amount', new AmountEvent({ type: Field(2), amount: currentBalance }));
    }
}


function formatMina(amount: UInt64): string {
    return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}
