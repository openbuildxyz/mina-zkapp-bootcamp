import {
    SmartContract,
    state,
    State,
    method,
    UInt32,
    UInt64,
    Permissions,
    PublicKey,
    DeployArgs,
    AccountUpdate
} from 'o1js';

export default class FundContract extends SmartContract {
    // 目标金额
    @state(UInt64) targetAmount = State<UInt64>();
    // 创建者
    @state(PublicKey) owner = State<PublicKey>();
    // 结束时间
    @state(UInt32) endTime = State<UInt32>();

    // 部署时初始化
    async deploy(args: DeployArgs & { targetAmount: UInt64; endTime: UInt32; owner: PublicKey }) {
        await super.deploy(args);//来自父类 SmartContract

        this.targetAmount.set(args.targetAmount);
        this.endTime.set(args.endTime);
        this.owner.set(args.owner);
        this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
    }

    // 众人投筹
    @method async contribute(amount: UInt64) {
        // 时间检测
        const nowTime = this.network.blockchainLength.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        nowTime.assertLessThan(endTime, "We're so sorry for this crawdfunding is end.");
        // 金额检测
        const nowAmount = this.account.balance.getAndRequireEquals();
        const targetAmount = this.targetAmount.getAndRequireEquals();
        nowAmount.assertLessThan(targetAmount, "Congratulations! Your contribution is accepted.");
        // 转账
        const sender = this.sender.getAndRequireSignature();
        const update = AccountUpdate.createSigned(sender);
        update.send({ to: this.address, amount: amount });
    }

    // owner提款
    @method async withdraw() {
        // 创建者检测
        const owner = this.owner.getAndRequireEquals();
        const nowSender = this.sender.getAndRequireSignature();
        owner.equals(nowSender).assertTrue("Only owner can withdraw");
        // 时间检测
        const nowTime = this.network.blockchainLength.getAndRequireEquals();
        const endTime = this.endTime.getAndRequireEquals();
        nowTime.assertGreaterThanOrEqual(endTime, "Fund is not end");
        // 金额检测
        const nowAmount = this.account.balance.getAndRequireEquals();
        const targetAmount = this.targetAmount.getAndRequireEquals();
        nowAmount.assertGreaterThanOrEqual(targetAmount, "Fund is not reached");
        // 转账
        this.send({ to: owner, amount: nowAmount });
    }

}