import { Field, SmartContract, state, State, method, UInt64, PublicKey, UInt32, AccountUpdate, } from 'o1js';

export class Funding extends SmartContract {
  @state(UInt64) totalRaised = State<UInt64>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt64) deadline = State<UInt64>();
  @state(PublicKey) beneficiary = State<PublicKey>();

  init() {
    super.init();
    this.totalRaised.set(UInt64.zero);
  }

  @method async initFunding(hardCap: UInt64, deadline: UInt64, beneficiary: PublicKey) {
    this.init();
    this.hardCap.set(hardCap);
    this.deadline.set(deadline);
    this.beneficiary.set(beneficiary);
  }

  @method async contribute(amount: UInt64, sender: PublicKey) {
    const currentRaised = this.totalRaised.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const deadline = this.deadline.getAndRequireEquals();
    this.network.blockchainLength.requireEquals(this.network.blockchainLength.get())
    const currentTime = this.network.blockchainLength;

    // 验证时间窗口
    deadline.assertGreaterThan(UInt64.from(currentTime.get()), 'Crowdfunding has ended');

    // 硬顶限制
    currentRaised.add(amount).assertLessThanOrEqual(hardCap, 'Exceeds hard cap');

    // 增加资金转移逻辑
    const payment = AccountUpdate.create(sender); // 创建发送者的账户更新
    payment.send({ to: this.address, amount }); // 执行转账
    payment.requireSignature(); // 确保发送者授权更新
    // 更新总金额
    this.totalRaised.set(currentRaised.add(amount));
  }

  @method async withdraw(sender: PublicKey) {
    const deadline = this.deadline.getAndRequireEquals();
    const beneficiary = this.beneficiary.getAndRequireEquals();
    const currentTime = UInt64.from(this.network.blockchainLength.get());
    this.network.blockchainLength.requireEquals(this.network.blockchainLength.get())


    // 验证时间窗口关闭
    currentTime.assertGreaterThanOrEqual(deadline, 'Crowdfunding is still active');

    // 验证提款人身份
    sender.assertEquals(beneficiary);

    // 提款逻辑（在实际部署中，需调用 sendTransaction 来完成）
    const totalRaised = this.totalRaised.getAndRequireEquals();
    // this.send({ to: beneficiary, amount: totalRaised });

    // 创建资金转移的账户更新
    // const fee = UInt64.from(0.1 * 1e9); // 0.1 MINA 手续费
    // const transferAmount = totalRaised.sub(fee);

    this.send({ to: beneficiary, amount: totalRaised }); // 转移实际金额
    // const payment = AccountUpdate.create(this.address); // 从合约账户转出资金
    // payment.send({ to: beneficiary, amount: totalRaised }); // 转移实际金额
    // payment.requireSignature(); // 确保合约账户授权

  }
}

