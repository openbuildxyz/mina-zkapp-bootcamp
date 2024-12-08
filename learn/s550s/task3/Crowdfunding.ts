import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  UInt64,
  Circuit,
  Bool,
} from 'o1js';

export class Crowdfunding extends SmartContract {
  // 合约状态变量
  @state(UInt64) totalFunds = State<UInt64>();
  @state(PublicKey) beneficiary = State<PublicKey>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt64) endTime = State<UInt64>();

  // 部署合约时初始化
  @method init(beneficiary: PublicKey, hardCap: UInt64, endTime: UInt64) {
    this.totalFunds.set(UInt64.zero());
    this.beneficiary.set(beneficiary);
    this.hardCap.set(hardCap);
    this.endTime.set(endTime);
  }

  // 允许投资函数
  @method contribute(amount: UInt64, sender: PublicKey) {
    const currentTime = this.network.blockchainLength.get(); // 当前区块链长度模拟时间
    const endTime = this.endTime.get();
    const totalFunds = this.totalFunds.get();
    const hardCap = this.hardCap.get();

    // 确保在时间窗口内
    Circuit.assertTrue(currentTime.lessThanOrEqual(endTime), 'Crowdfunding period has ended');

    // 确保硬顶未超额
    const newTotal = totalFunds.add(amount);
    Circuit.assertTrue(newTotal.lessThanOrEqual(hardCap), 'Contribution exceeds hard cap');

    // 更新总筹资金额
    this.totalFunds.set(newTotal);

    // 接收捐款
    this.balance.addInPlace(amount);
  }

  // 提款函数（仅投资人可调用）
  @method withdraw() {
    const currentTime = this.network.blockchainLength.get(); // 当前区块链时间
    const endTime = this.endTime.get();
    const totalFunds = this.totalFunds.get();
    const beneficiary = this.beneficiary.get();

    // 验证时间窗口已关闭
    Circuit.assertTrue(currentTime.greaterThan(endTime), 'Crowdfunding period is still active');

    // 验证提款者是受益人
    Circuit.assertEqual(this.sender, beneficiary, 'Only the beneficiary can withdraw funds');

    // 转移资金
    this.send({ to: beneficiary, amount: totalFunds });
  }
}
