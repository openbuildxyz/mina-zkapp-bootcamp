import { SmartContract, Permissions, state, State, method, DeployArgs, UInt64, AccountUpdate, PublicKey, Bool, Field } from 'o1js';
export class CrowdFunding extends SmartContract {
    @state(UInt64) target = State<UInt64>(new UInt64(0));  // 筹资目标
    @state(UInt64) existed = State<UInt64>(new UInt64(0));  // 已经筹集到的金额
    @state(UInt64) startTime = State<UInt64>(new UInt64(0));  // 筹款结束时间
    @state(UInt64) endTime = State<UInt64>(new UInt64(0));  // 筹款结束时间
    @state(PublicKey) receiver = State<PublicKey>();  // 筹资接收账户
    @state(Bool) closed = State<Bool>(Bool(false));  // 筹款是否结束

    // 筹款
    @method async raise(amount: UInt64) {
        // 检查是否筹款结束
        const endTime = this.endTime.getAndRequireEquals();
        const currentTime = this.network.timestamp.getAndRequireEquals();
        currentTime.assertLessThan(endTime);
        // 是否超过硬顶
        const currentExisted = this.existed.getAndRequireEquals();
        const target = this.target.getAndRequireEquals();
        currentExisted.add(amount).assertLessThanOrEqual(target);
        // 检查用户金额
        const investor = this.sender.getAndRequireSignature();
        const investorUpdate = AccountUpdate.createSigned(investor);
        const investorBalance = investorUpdate.account.balance.getAndRequireEquals();
        investorBalance.assertGreaterThanOrEqual(amount);  // 转出的金额不能超过当前余额
        // 转账给铸币管理员
        investorUpdate.send({ to: this.address, amount: amount })
        this.existed.set(currentExisted.add(amount))
    }

    // 收款人提款
    @method async withdraw() {
        // 验证是否关闭
        const closed = this.closed.getAndRequireEquals();
        closed.assertFalse();
        // 检查是否是接收人提款
        const currentUser = this.sender.getAndRequireSignature();
        const receiver = this.receiver.getAndRequireEquals();
        receiver.assertEquals(currentUser);
        // 是否在筹款结束之后提款
        const endTime = this.endTime.getAndRequireEquals();
        const currentTime = this.network.timestamp.getAndRequireEquals();
        currentTime.assertGreaterThanOrEqual(endTime);
        // 提款
        const existed = this.existed.getAndRequireEquals();
        this.send({ to: receiver, amount: existed });
        this.closed.set(Bool(true));
    }

    @method async setEndTime(endTime: UInt64) {
        this.endTime.set(endTime);
    }

    // 部署合约并
    async deploy(args: DeployArgs & { target: UInt64; endTime: UInt64; receiver: PublicKey }) {
        await super.deploy(args);
        this.target.set(args.target);
        this.endTime.set(args.endTime);
        this.receiver.set(args.receiver);
        this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
    }
}
