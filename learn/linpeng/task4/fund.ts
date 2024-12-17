import {
    Field,
    state,
    State,
    method,
    UInt64,
    PrivateKey,
    SmartContract,
    Mina,
    AccountUpdate,
    Bool,
    PublicKey,
    DeployArgs,
    Permissions,
    UInt32,
    Provable,
    Struct
} from 'o1js';

export class Fund extends SmartContract {
    // 链上状态变量
    @state(PublicKey) owner = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();

    events = {
        crowdfunding: CrowdfundingEvent
    };

    async deploy(props: DeployArgs & { owner: PublicKey; hardCap: UInt64; endTime: UInt32 }) {
        await super.deploy(props)

        // 初始化账户权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(), // 禁止在当前合约版本中设置或更改合约的 VerificationKey
            // setPermissions: Permissions.impossible(), // 完全禁止修改某些权限或参数，防止 zkApp 被篡改或修改关键功能
            // send: Permissions.proof(), // 需要零知识证明才能发送交易
            // receive: Permissions.none(), // 禁止接收资金
        })

        // 初始化数据
        this.hardCap.set(props.hardCap);
        this.endTime.set(props.endTime);
        this.owner.set(props.owner);
    }

    // 众筹
    @method
    async contribute(amount: UInt64) {
        // 时间检测
        const nowTime = this.network.blockchainLength.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        nowTime.assertLessThan(endTime, "众筹时间已过，不能投资");

        // 金额检测
        const balance = this.account.balance.getAndRequireEquals();
        const hardCap = this.hardCap.getAndRequireEquals();

        balance.assertLessThan(hardCap, "金额达到硬顶，不能投资");

        // 转账
        const sender = this.sender.getAndRequireSignatureV2();
        const update = AccountUpdate.createSigned(sender);
        update.send({ to: this.address, amount: amount });

        this.emitEvent('crowdfunding', new CrowdfundingEvent({
            type: EVENT_TYPE.CONTRIBUTE,
            sender: this.sender.getAndRequireSignatureV2(),
            amount: amount,
            timestamp: this.network.blockchainLength.getAndRequireEquals()
        }));
    }

    // 提取
    @method async withdraw() {
        // 验证提取发起方
        const owner = this.owner.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignatureV2();
        owner.equals(sender).assertTrue("不是发起方，不能提取");

        // 时间检测
        const nowTime = this.network.blockchainLength.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        nowTime.assertGreaterThanOrEqual(endTime, "众筹期间，不能提取");

        // 获取合约账户余额
        const balance = this.account.balance.getAndRequireEquals();

        const update = AccountUpdate.createSigned(owner);

        // 转账
        this.send({ to: update, amount: balance });

        update.account.timing.set({
            initialMinimumBalance: UInt64.from(10),
            cliffTime: new UInt32(100),
            cliffAmount: balance.mul(2).div(10),
            vestingPeriod: new UInt32(20),
            vestingIncrement: balance.div(10),
        });

        this.emitEvent('crowdfunding', new CrowdfundingEvent({
            type: EVENT_TYPE.WITHDRAW,
            sender: owner,
            amount: balance,
            timestamp: this.network.blockchainLength.getAndRequireEquals()
        }));
    }

}
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
// 打印事件
function printEvents(events: any[]) {
    console.log('\n事件总数:', events.length);
    events.forEach((e, index) => {
        if (e.type === 'amount') {
            console.log(`事件 #${index + 1}:`);
            const type = e.event.data.type.toString() === '1' ? '投资' : '提现';
            const amount = (Number(e.event.data.amount) / 1e9).toString();
            console.log(`- 类型: ${type}`);
            console.log(`- 金额: ${amount} MINA`);
        }
    });
}