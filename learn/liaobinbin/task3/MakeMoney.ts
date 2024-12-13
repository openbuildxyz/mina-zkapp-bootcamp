import {
  Field,
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  UInt64,
  AccountUpdate,
} from 'o1js';

export class MakeMoney extends SmartContract {
  @state(PublicKey) boss = State<PublicKey>(); // 老板
  @state(UInt64) startTime = State<UInt64>(); // 开始时间
  @state(UInt64) endTime = State<UInt64>(); // 结束时间
  @state(Field) targetAmount = State<Field>(); // 目标金额
  @state(Field) currentAmount = State<Field>(); // 当前募集金额
  @state(Field) hardCap = State<Field>(); // 硬顶

  init() {
    super.init();
    this.boss.set(this.sender.getAndRequireSignature());
    this.currentAmount.set(Field(0));
  }

  // 初始化造钱机器
  @method async initializeMachine(
    startTime: UInt64,
    endTime: UInt64,
    targetAmount: Field,
    hardCap: Field
  ) {
    // 老板启动一轮圈钱计划
    const beneficiary = this.boss.getAndRequireEquals();
    this.sender
      .getAndRequireSignature()
      .equals(beneficiary)
      .assertTrue('别动老板的蛋糕');

    // 验证时间设置合理性
    startTime.lessThan(endTime).assertTrue('启动时间必须要小与结束时间');

    // 验证目标金额小于硬顶
    targetAmount.lessThan(hardCap).assertTrue('目标金额要小于硬顶');

    this.startTime.set(startTime);
    this.endTime.set(endTime);
    this.targetAmount.set(targetAmount);
    this.hardCap.set(hardCap);
  }

  // 牛马给钱入口
  @method async contribute(amount: Field) {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const startTime = this.startTime.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();

    // 验证时间窗口
    currentTime.greaterThanOrEqual(startTime).assertTrue('你来的太早了，大爷');
    currentTime
      .lessThanOrEqual(endTime)
      .assertTrue('死牛马，你来晚了，下次早点');

    // 验证是否超过硬顶
    currentAmount
      .add(amount)
      .lessThanOrEqual(hardCap)
      .assertTrue('太多了，下次再来');

    // 转账逻辑
    const payerUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    payerUpdate.send({ to: this.address, amount: Number(amount.toString()) });

    // 更新当前金额
    this.currentAmount.set(currentAmount.add(amount));
  }

  // 拿钱跑路
  @method async withdraw() {
    const currentTime = this.network.timestamp.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    const boss = this.boss.getAndRequireEquals();
    const currentAmount = this.currentAmount.getAndRequireEquals();
    const targetAmount = this.targetAmount.getAndRequireEquals();

    // 验证时间窗口已结束
    currentTime.greaterThan(endTime).assertTrue('蛋糕还没烤好，别急');

    // 验证目标达成
    currentAmount
      .greaterThanOrEqual(targetAmount)
      .assertTrue('蛋糕还太小了，别慌');

    // 验证调用者是不是老板
    this.sender
      .getAndRequireSignature()
      .equals(boss)
      .assertTrue('别动老板的蛋糕');

    // 转账给老板
    const contractBalance = AccountUpdate.createSigned(this.address);
    contractBalance.send({
      to: boss,
      amount: Number(currentAmount.toString()),
    });

    // 重置当前金额
    this.currentAmount.set(Field(0));
  }

  @method async refund() {
    // 圈钱不可能退款
  }
}
