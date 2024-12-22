import {
    Field,
    SmartContract,
    method,
    state,
    State,
    UInt64,
    Bool,
    UInt32,
    AccountUpdate,
} from 'o1js';

export class Crowdfunding extends SmartContract {
    // 合约的状态
    @state(UInt64) totalRaised = State<UInt64>();  // 总募集金额
    @state(UInt32) deadlineHeight = State<UInt32>(); // 截止区块高度
    @state(Bool) isClosed = State<Bool>();         // 是否已关闭
    @state(UInt64) hardCap = State<UInt64>();      // 硬顶

    // 初始化合约状态
    init() {
        super.init();
        this.totalRaised.set(UInt64.from(0));
        this.deadlineHeight.set(UInt32.from(0)); // 初始截止区块高度为0
        this.isClosed.set(Bool(false));   // 合约开始时没有关闭
        this.hardCap.set(UInt64.from(1000000)); // 默认硬顶为1000000
    }

    // 投资方法：允许任何人在指定区块高度前投入资金
    @method async invest(amount: UInt64) {
        const currentHeight = this.network.blockchainLength.get(); // 获取当前区块高度
        this.network.blockchainLength.requireEquals(currentHeight);
        const deadlineHeight = this.deadlineHeight.get(); // 获取设定的截止区块高度
        this.deadlineHeight.requireEquals(deadlineHeight);
        currentHeight.assertLessThanOrEqual(deadlineHeight, 'Crowdfunding period is over');

        // 更新总募集金额
        const totalRaised = this.totalRaised.get();
        this.totalRaised.requireEquals(totalRaised);
        const sum = totalRaised.add(amount);

        // 检查是否超过硬顶
        const hardCap = this.hardCap.get();
        this.hardCap.requireEquals(hardCap);
        sum.assertLessThanOrEqual(hardCap, 'Hard cap reached');

        this.totalRaised.set(sum);
    }

    // 设置区块高度截止
    @method async setDeadline(deadlineHeight: UInt32) {
        const currentHeight = this.network.blockchainLength.get(); // 获取当前区块高度
        this.network.blockchainLength.requireEquals(currentHeight);
        deadlineHeight.assertGreaterThan(currentHeight, 'Deadline must be in the future');
        this.deadlineHeight.requireEquals(this.deadlineHeight.get());
        this.deadlineHeight.set(deadlineHeight);
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
        isClosed.assertTrue('Crowdfunding not closed');

        const totalRaised = this.totalRaised.get();
        this.totalRaised.requireEquals(totalRaised);
        amount.assertLessThanOrEqual(totalRaised, 'Insufficient funds');
        // 减去提取金额，并将金额转入投资者账户
        const left = totalRaised.sub(amount);
        this.totalRaised.set(left);
    }
}
