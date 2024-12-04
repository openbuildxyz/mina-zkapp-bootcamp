import {
    Field,
    SmartContract,
    method,
    state,
    State,
    UInt64,
    Bool,
} from 'o1js';


export class Crowdfunding extends SmartContract {
    // 合约的状态
    @state(UInt64) totalRaised = State<UInt64>();  // 总募集金额
    @state(Field) deadline = State<Field>();       // 截止时间
    @state(Bool) isClosed = State<Bool>();         // 是否已关闭
    @state(UInt64) hardCap = State<UInt64>();      // 硬顶

    // 初始化合约状态
    init() {
        super.init();
        this.totalRaised.set(UInt64.from(0));
        this.deadline.set(Field(0)); // 初始截止时间为0
        this.isClosed.set(Bool(false)); // 合约开始时没有关闭
        this.hardCap.set(UInt64.from(1000000)); // 默认硬顶为1000000
    }

    // 投资方法：允许任何人在指定时间窗口内投入资金
    @method async invest(amount: UInt64) {
        const currentTime = Field(Math.floor(Date.now() / 1000));// 获取当前时间（秒）
        // 检查时间窗口是否有效
        const deadline = this.deadline.get();
        this.deadline.requireEquals(deadline);
        // currentTime.assertLessThanOrEqual(deadline, 'Crowdfunding period is over');
        // 更新总募集金额
        const totalRaised = this.totalRaised.get();
        this.totalRaised.requireEquals(totalRaised);
        const sum = totalRaised.add(amount);
        // 检查是否超过硬顶
        const hardCap = this.hardCap.get();
        this.hardCap.requireEquals(hardCap);
        // sum.assertLessThanOrEqual(hardCap, 'Hard cap reached');
        this.totalRaised.set(sum);
    }

    // 设置时间窗口的结束时间
    @method async setDeadline(deadline: Field) {
        // const currentTime = Field(Math.floor(Date.now() / 1000));
        // deadline.assertGreaterThan(currentTime, 'Deadline must be in the future');
        this.deadline.requireEquals(this.deadline.get());
        this.deadline.set(deadline);
    }

    // 结束众筹：众筹结束后，标记为已关闭
    @method async closeCrowdfunding() {
        this.isClosed.requireEquals(this.isClosed.get());
        this.isClosed.set(Bool(true));
    }

    // 提款方法：只有在众筹结束后，投资人才能提取资金
    @method async withdraw(amount: UInt64) {
        const isClosed = this.isClosed.get();
        this.isClosed.requireEquals(isClosed);
        isClosed.assertTrue('Crowdfunding not closed')
        const totalRaised = this.totalRaised.get();
        this.totalRaised.requireEquals(totalRaised);
        amount.assertLessThanOrEqual(totalRaised, 'Insufficient funds')
        // 减去提取金额，并将金额转入投资者账户
        this.totalRaised.set(totalRaised.sub(amount));
    }
}
