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

// 在文件顶部定义计数器
let checkStateCallCount = 0;

// 定义统一的事件结构
class AmountEvent extends Struct({
    type: Field,  // 1 表示投资，2 表示提现
    amount: UInt64
}) { }

// 状态接口
interface BaseState {
    beneficiary: State<PublicKey>;
    hardCap: State<UInt64>;
    endTime: State<UInt32>;
}

// 状态检查装饰器
function checkState(type: 'contribute' | 'withdraw') {
    return function <T extends SmartContract & BaseState>(
        target: T,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (this: T, ...args: any[]) {
            const endTime = this.endTime.getAndRequireEquals();
            const hardCap = this.hardCap.getAndRequireEquals();
            const currentBalance = this.account.balance.getAndRequireEquals();
            const isHardCapReached = currentBalance.greaterThanOrEqual(hardCap);
            const currentTime = this.network.blockchainLength.getAndRequireEquals();

            // Provable.asProver(() => {
            //     checkStateCallCount++;
            //     console.log("=====================================");
            //     console.log('Call Count:', checkStateCallCount);
            //     console.log('currentTime:', currentTime.toString());
            //     console.log('endTime:', endTime.toString());
            //     console.log('isTimeEnded:', currentTime.greaterThanOrEqual(endTime).toString());
            //     console.log('currentBalance:', currentBalance.toString());
            //     console.log('hardCap:', hardCap.toString());
            //     console.log('isHardCapReached:', isHardCapReached.toString());
            //     console.log("=====================================");
            // });

            const isTimeEnded = currentTime.greaterThanOrEqual(endTime);
            const condition = isHardCapReached.or(isTimeEnded);

            if (type === 'withdraw') {
                const beneficiary = this.beneficiary.getAndRequireEquals();
                const sender = this.sender.getAndRequireSignature();
                sender.equals(beneficiary).assertTrue('Only beneficiary can withdraw');
            }

            const shouldAssert = Provable.if(
                Bool(type === 'contribute'),
                condition.not(),
                condition
            );

            shouldAssert.assertTrue(
                type === 'contribute'
                    ? 'Cannot contribute: hard cap reached or window closed'
                    : 'Cannot withdraw: neither hard cap reached nor window closed'
            );

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

function formatMina(amount: UInt64): string {
    return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}

export class CrowdfundingContract extends SmartContract implements BaseState {
    @state(PublicKey) beneficiary = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();

    events = {
        'amount': AmountEvent
    };

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
    @checkState('contribute')
    async contribute(amount: UInt64) {
        amount.assertGreaterThan(UInt64.from(0));

        const hardCap = this.hardCap.getAndRequireEquals();
        const currentBalance = this.account.balance.getAndRequireEquals();
        const remainingToHardCap = hardCap.sub(currentBalance);
        const acceptedAmount = Provable.if(
            amount.lessThanOrEqual(remainingToHardCap),
            amount,
            remainingToHardCap
        );

        const senderPublicKey = this.sender.getAndRequireSignature();
        AccountUpdate.createSigned(senderPublicKey)
            .send({ to: this.address, amount: acceptedAmount });

        // Provable.asProver(() => {
        //     console.log('投资金额:', formatMina(acceptedAmount), 'MINA');
        // });

        // 发出投资事件
        this.emitEvent('amount', new AmountEvent({
            type: Field(1),
            amount: acceptedAmount
        }));
    }

    // 提现 
    @method
    @checkState('withdraw')
    async withdraw() {
        const beneficiary = this.beneficiary.getAndRequireEquals();
        const currentBalance = this.account.balance.getAndRequireEquals();

        this.send({ to: beneficiary, amount: currentBalance });

        // Provable.asProver(() => {
        //     console.log('提现金额:', formatMina(currentBalance), 'MINA');
        // });

        // 发出提现事件
        this.emitEvent('amount', new AmountEvent({
            type: Field(2),
            amount: currentBalance
        }));
    }
}

