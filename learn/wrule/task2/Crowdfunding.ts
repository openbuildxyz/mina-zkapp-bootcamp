import { 
  Field, 
  SmartContract, 
  state, 
  State, 
  method, 
  PublicKey, 
  Provable, 
  UInt64,
  AccountUpdate
} from 'o1js';

export class Crowdfunding extends SmartContract {
  @state(PublicKey) beneficiary = State<PublicKey>(); // 受益人地址
  @state(UInt64) startTime = State<UInt64>();  // 开始时间
  @state(UInt64) endTime = State<UInt64>();    // 结束时间
  @state(Field) targetAmount = State<Field>();  // 目标金额
  @state(Field) currentAmount = State<Field>(); // 当前募集金额
  @state(Field) hardCap = State<Field>();       // 硬顶
  
  init() {
    super.init();
    this.beneficiary.set(this.sender.getAndRequireSignature());
    this.currentAmount.set(Field(0));
  }

  @method initializeCrowdfunding(
    startTime: UInt64,
    endTime: UInt64, 
    targetAmount: Field,
    hardCap: Field
  ) {
    // 验证调用者是受益人
    const beneficiary = this.beneficiary.getAndRequireEquals();
    this.sender.getAndRequireSignature().equals(beneficiary)
      .assertTrue('Only beneficiary can initialize');
    
    // 验证时间设置合理性
    startTime.lessThan(endTime).assertTrue('Start time must be before end time');
    
    // 验证目标金额小于硬顶
    targetAmount.lessThan(hardCap).assertTrue('Target amount must be less than hard cap');

    this.startTime.set(startTime);
    this.endTime.set(endTime);
    this.targetAmount.set(targetAmount);
    this.hardCap.set(hardCap);
  }

  @method contribute(amount: Field) {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const startTime = this.startTime.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();

    // 验证时间窗口
    currentTime.greaterThanOrEqual(startTime).assertTrue('Crowdfunding not started');
    currentTime.lessThanOrEqual(endTime).assertTrue('Crowdfunding ended');

    // 验证是否超过硬顶
    currentAmount.add(amount).lessThanOrEqual(hardCap)
      .assertTrue('Exceeds hard cap');

    // 转账逻辑
    const payerUpdate = AccountUpdate.createSigned(this.sender);
    payerUpdate.send({ to: this, amount: Number(amount.toString()) });

    // 更新当前金额
    this.currentAmount.set(currentAmount.add(amount));
  }

  @method withdraw() {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const beneficiary = this.beneficiary.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const targetAmount = this.targetAmount.getAndRequireEquals();

    // 验证时间窗口已结束
    currentTime.greaterThan(endTime).assertTrue('Crowdfunding not ended');
    
    // 验证目标达成
    currentAmount.greaterThanOrEqual(targetAmount)
      .assertTrue('Target amount not reached');

    // 验证调用者是受益人
    this.sender.getAndRequireSignature().equals(beneficiary)
      .assertTrue('Only beneficiary can withdraw');

    // 转账给受益人
    const contractBalance = AccountUpdate.createSigned(this.address);
    contractBalance.send({ to: beneficiary, amount: Number(currentAmount.toString()) });

    // 重置当前金额
    this.currentAmount.set(Field(0));
  }

  @method refund() {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const targetAmount = this.targetAmount.getAndRequireEquals();

    // 验证时间窗口已结束
    currentTime.greaterThan(endTime).assertTrue('Crowdfunding not ended');
    
    // 验证目标未达成
    currentAmount.lessThan(targetAmount)
      .assertTrue('Target amount reached, cannot refund');

    // TODO: 这里应该记录每个投资人的投资金额,以便退款
    // 由于当前实现较为简单,暂不实现具体退款逻辑
  }
}
