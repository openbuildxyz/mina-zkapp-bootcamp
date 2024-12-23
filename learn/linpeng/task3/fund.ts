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
    UInt32
} from 'o1js';

const beforeGenesis = UInt64.from(Date.now());

export class Fund extends SmartContract {

    // 链上状态变量
    @state(PublicKey) owner = State<PublicKey>();
    @state(UInt64) totalFunds = State<UInt64>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();

    async deploy(props: DeployArgs & { owner: PublicKey; hardCap: UInt64; endTime: UInt32; totalFunds: UInt64 }) {
        await super.deploy(props)

        // 初始化账户权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(), // 禁止在当前合约版本中设置或更改合约的 VerificationKey
            setPermissions: Permissions.impossible(), // 完全禁止修改某些权限或参数，防止 zkApp 被篡改或修改关键功能
            // send: Permissions.proof(), // 需要零知识证明才能发送交易
            // receive: Permissions.none(), // 禁止接收资金
        })

        // 初始化数据
        this.hardCap.set(props.hardCap);
        this.endTime.set(props.endTime);
        this.owner.set(props.owner);
        this.totalFunds.set(props.totalFunds);
    }

    // 众筹
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
    }

    // 提取
    @method async withdraw() {
        // 检测owner
        const owner = this.owner.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignatureV2();
        owner.equals(sender).assertTrue("不是发起方，不能提取");

        // 时间检测
        const nowTime = this.network.blockchainLength.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        nowTime.assertGreaterThanOrEqual(endTime, "众筹期间，不能提取");

        // 金额检测
        const balance = this.account.balance.getAndRequireEquals();
        const hardCap = this.hardCap.getAndRequireEquals();
        balance.assertGreaterThanOrEqual(hardCap, "众筹金额未硬顶，不能提取");

        // 转账
        this.send({ to: owner, amount: balance });
    }
}
