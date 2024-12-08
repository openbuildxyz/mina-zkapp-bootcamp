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

/**
 * 未完成，待续
 */
export class Reward extends SmartContract {
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

  @method async initializeReward(
    startTime: UInt64,
    endTime: UInt64, 
    targetAmount: Field,
    hardCap: Field
  ) {
    // 验证调用者是受益人
    const beneficiary = this.beneficiary.getAndRequireEquals();
    this.sender.getAndRequireSignature().equals(beneficiary)
      .assertTrue('Only beneficiary can initialize');
    
    startTime.lessThan(endTime).assertTrue('Start time must be before end time');
    
    targetAmount.lessThan(hardCap).assertTrue('Target amount must be less than hard cap');

    this.startTime.set(startTime);
    this.endTime.set(endTime);
    this.targetAmount.set(targetAmount);
    this.hardCap.set(hardCap);
  }

  @method async contribute(amount: Field) {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const startTime = this.startTime.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();

    currentTime.greaterThanOrEqual(startTime).assertTrue('Reward not started');
    currentTime.lessThanOrEqual(endTime).assertTrue('Reward ended');

    currentAmount.add(amount).lessThanOrEqual(hardCap)
      .assertTrue('Exceeds hard cap');

    const payerUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
    payerUpdate.send({ to: this.address, amount: Number(amount.toString()) });

    this.currentAmount.set(currentAmount.add(amount));
  }

  @method async withdraw() {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const beneficiary = this.beneficiary.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const targetAmount = this.targetAmount.getAndRequireEquals();

    currentTime.greaterThan(endTime).assertTrue('Reward not ended');
    
    currentAmount.greaterThanOrEqual(targetAmount)
      .assertTrue('Target amount not reached');

    this.sender.getAndRequireSignature().equals(beneficiary)
      .assertTrue('Only beneficiary can withdraw');

    const contractBalance = AccountUpdate.createSigned(this.address);
    contractBalance.send({ to: beneficiary, amount: Number(currentAmount.toString()) });

    this.currentAmount.set(Field(0));
  }

  @method async refund() {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const targetAmount = this.targetAmount.getAndRequireEquals();

    currentTime.greaterThan(endTime).assertTrue('Reward not ended');
    
    currentAmount.lessThan(targetAmount)
      .assertTrue('Target amount reached, cannot refund');

  }
}
