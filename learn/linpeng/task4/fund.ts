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
    Provable
} from 'o1js';

export class Fund extends SmartContract {
    // 链上状态变量
    @state(PublicKey) owner = State<PublicKey>();
    @state(UInt64) hardCap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();
    @state(UInt64) totalFunds = State<UInt64>();
    @state(UInt32) releasedPercentage = State<UInt32>(); // 已经释放的百分比，初始为0

    async deploy(props: DeployArgs & { owner: PublicKey; hardCap: UInt64; endTime: UInt32; totalFunds: UInt64 }) {
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
        this.totalFunds.set(props.totalFunds);
        this.releasedPercentage.set(UInt32.from(0));
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

        // 更新总额
        const total = this.totalFunds.getAndRequireEquals()
        this.totalFunds.requireEquals(total);

        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(), // 禁止在当前合约版本中设置或更改合约的 VerificationKey
        })

        this.totalFunds.set(total.add(amount));

        const totalFunds = this.totalFunds.getAndRequireEquals();

        totalFunds.assertEquals(UInt64.from(60 * 1e9))

        // 转账
        const sender = this.sender.getAndRequireSignatureV2();
        const update = AccountUpdate.createSigned(sender);
        update.send({ to: this.address, amount: amount });
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

        // 获取账户余额和金额
        const balance = this.account.balance.getAndRequireEquals();
        const totalFunds = this.totalFunds.getAndRequireEquals();
        const hardCap = this.hardCap.getAndRequireEquals();

        // 初始释放比例
        const initialRelease = UInt32.from(20); // 立即释放20%
        const timePassed = nowTime.sub(endTime); // 超出结束时间的区块数

        // 计算非第一次的释放比例总和
        const additionalRelease = Provable.if(
            timePassed.greaterThan(UInt32.from(0)), // 超出的区块数大于0（众筹时间之后）
            timePassed.div(UInt32.from(200)).mul(10), // 每200区块释放10%
            UInt32.from(0) // 未超出时间时不释放
        );

        // 目前为止，总应释放比例
        const totalRelease = initialRelease.add(additionalRelease) // 初始释放比例 + 非第一次的释放比例总和

        // 是否小于最大释放(100%)
        const lessThanTotal = totalRelease.lessThan(UInt32.from(100));

        // 获取已释放比例
        const releasedPercentage = this.releasedPercentage.getAndRequireEquals()

        // 本次释放比例
        const curRelease = Provable.if(
            lessThanTotal, // 未超过最大释放
            totalRelease.sub(releasedPercentage), // 未超过最大释放比例，可按比例释放
            UInt32.from(100).sub(releasedPercentage) // 超过最大释放比例
        );

        // 本次释放金额
        const withdrawAmount = Provable.if(
            lessThanTotal,
            totalFunds.mul(UInt64.from(curRelease).div(UInt64.from(100))),
            balance
        )
        // this.releasedPercentage.set(releasedPercentage.add(curRelease)); // 更新已释放比例

        // 转账
        this.send({ to: owner, amount: hardCap.mul(UInt64.from(curRelease)).div(UInt64.from(100)) });
    }

}
