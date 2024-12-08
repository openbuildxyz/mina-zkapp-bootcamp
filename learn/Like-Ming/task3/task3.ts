import { SmartContract, Permissions, state, State, method, DeployArgs, UInt64, AccountUpdate, PublicKey, UInt32, Bool } from 'o1js';

export const MINA = 1e9;
export class task3 extends SmartContract {
    /** 目标金额 */
    @state(UInt64) target = State<UInt64>(new UInt64(0));
    /** 已筹集金额 */
    @state(UInt64) raised = State<UInt64>(new UInt64(0));
    /** 结束时间 */
    @state(UInt32) endBlockHeight = State<UInt32>(new UInt32(0));
    /** 资金接收者 */
    @state(PublicKey) receiver = State<PublicKey>();
    /** 众筹是否关闭 */
    @state(Bool) closed = State<Bool>(Bool(false));

    /**
     * 异步部署合约
     * 
     * 该方法扩展了基础部署流程，额外设置了目标块高度、结束块高度和接收者公钥
     * 它还设置了账户权限，允许使用证明或签名来编辑状态
     * 
     * @param args 包含部署参数的对象，包括目标块高度、结束块高度和接收者公钥
     */
    async deploy(args: DeployArgs & { target: UInt64; endBlockHeight: UInt32; receiver: PublicKey }) {
        // 调用基础部署方法
        await super.deploy(args);
        // 设置目标块高度
        this.target.set(args.target);
        // 设置结束块高度
        this.endBlockHeight.set(args.endBlockHeight);
        // 设置接收者公钥
        this.receiver.set(args.receiver);
        // 设置账户权限，允许使用证明或签名来编辑状态
        this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
    }

    /**
     * 投资函数，允许用户在窗口期内进行投资
     * @param amount 投资的金额，必须是正整数
     */
    @method async invest(amount: UInt64) {
        // 获取结束区块高度
        const endBlockHeight = this.endBlockHeight.getAndRequireEquals();
        // 获取当前时间戳
        const currentTime = this.network.timestamp.getAndRequireEquals();
        // 检查是否还在窗口期
        this.network.blockchainLength.requireBetween(UInt32.from(0), endBlockHeight);

        // 获取目标筹集金额
        const target = this.target.getAndRequireEquals();
        // 获取已筹集金额
        const raised = this.raised.getAndRequireEquals();
        // 检查是否已经筹满
        raised.assertLessThan(target);
        // 资数量必须小于等于余额
        amount.assertLessThanOrEqual(target.sub(raised));

        // 获取并验证捐赠者的账户
        const donator = this.sender.getAndRequireSignature();
        const donatorUpdate = AccountUpdate.createSigned(donator);
        // 获取捐赠者的账户余额
        const donatorBalance = donatorUpdate.account.balance.getAndRequireEquals();
        // 检查账户余额
        donatorBalance.assertGreaterThanOrEqual(amount);

        // 将投资账户的 MINA 转移到合约上
        donatorUpdate.send({ to: this, amount });
        // 更新已筹集金额
        this.raised.set(raised.add(amount));
    }
    /**
     * 异步执行提现操作
     * 此方法用于在满足特定条件时，将筹集的资金转移到接收人账户中
     * 主要步骤包括：
     * 1. 验证当前合约状态是否允许提现
     * 2. 检查当前区块高度是否超过窗口期
     * 3. 确认请求提现的用户是合法的接收人
     * 4. 转移资金并更新合约状态
     */
    @method async withdraw() {
        // 验证合约是否已关闭，确保只执行一次提现操作
        this.closed.getAndRequireEquals();
        this.closed.requireEquals(Bool(false));

        // 获取结束区块高度和当前区块高度，用于判断是否超过窗口期
        const endBlockHeight = this.endBlockHeight.getAndRequireEquals();
        const currentBlockHeight = this.network.blockchainLength.getAndRequireEquals();
        // 检查是否超过窗口期
        currentBlockHeight.assertGreaterThan(endBlockHeight);

        // 获取并验证接收人信息
        const receiver = this.receiver.getAndRequireEquals();
        const sender = this.sender.getAndRequireSignature();
        // 检查领取人是不是设置好的接收人
        receiver.assertEquals(sender);

        // 获取筹集到的金额
        const raised = this.raised.getAndRequireEquals();
        // 将筹集到的金额转入接收人账户中
        this.send({ to: receiver, amount: raised });
        // 更新合约状态为已关闭，防止重复提现
        this.closed.set(Bool(true));
    }
}