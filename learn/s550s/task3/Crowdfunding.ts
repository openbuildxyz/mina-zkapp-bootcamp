import { Field, SmartContract, state, method, CircuitValue, Bool, UInt64, AccountUpdate } from 'o1js';

class Crowdfunding extends SmartContract {
  @state(Field) public deadline: Field; // 截止时间
  @state(Field) public hardCap: Field; // 硬顶
  @state(Field) public totalFunds: Field; // 累积资金
  @state(Field) public investors: Map<string, Field>; // 投资者记录

  constructor() {
    super();
    this.deadline = Field(0);
    this.hardCap = Field(0);
    this.totalFunds = Field(0);
    this.investors = new Map();
  }

  // 设置截止时间
  @method setDeadline(deadline: Field) {
    this.deadline.set(deadline);
  }

  // 设置硬顶
  @method setHardCap(hardCap: Field) {
    this.hardCap.set(hardCap);
  }

  // 投资方法
  @method invest(amount: UInt64, investor: string) {
    const currentTime = UInt64.from(Date.now());
    this.deadline.get().assertGreaterThan(currentTime.toField(), '时间窗口已关闭');
    this.totalFunds.get().assertLessThan(this.hardCap.get(), '已达到硬顶');

    const currentInvestment = this.investors.get(investor) ?? Field(0);
    this.investors.set(investor, currentInvestment.add(amount.toField()));
    this.totalFunds.set(this.totalFunds.get().add(amount.toField()));
  }

  // 提款方法
  @method withdraw(amount: UInt64, investor: string) {
    const currentTime = UInt64.from(Date.now());
    this.deadline.get().assertLessThanOrEqual(currentTime.toField(), '时间窗口尚未关闭');

    const investorFunds = this.investors.get(investor);
    if (!investorFunds) throw new Error('未找到投资记录');

    investorFunds.assertGreaterThanOrEqual(amount.toField(), '提款金额超出投资额');
    this.totalFunds.set(this.totalFunds.get().sub(amount.toField()));
    this.investors.set(investor, investorFunds.sub(amount.toField()));
  }
}

export { Crowdfunding };