import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  UInt64,
  Permissions,
} from 'o1js';

export class Crowdfunding extends SmartContract {
  // 状态变量
  @state(PublicKey) beneficiary = State<PublicKey>(); // 受益人地址
  @state(UInt64) targetAmount = State<UInt64>();      // 目标金额（硬顶）
  @state(UInt64) deadline = State<UInt64>();          // 截止时间
  @state(UInt64) totalRaised = State<UInt64>();       // 已筹集金额

  // 初始化合约
  init() {
    super.init();
    this.totalRaised.set(UInt64.from(0));
    // 设置权限
    this.account.permissions.set({
      ...Permissions.default(),
      receive: Permissions.proof(),
    });
  }

  // 部署合约时设置众筹参数
  @method async setup(
    beneficiaryAddress: PublicKey,
    target: UInt64,
    durationInBlocks: UInt64
  ) {
    // 设置受益人地址
    this.beneficiary.set(beneficiaryAddress);
    // 设置目标金额
    this.targetAmount.set(target);
    // 设置截止时间（当前区块高度 + 持续区块数）
    this.network.globalSlotSinceGenesis.requireEquals(this.network.globalSlotSinceGenesis.get());
    const currentBlock = this.network.timestamp.get();
    this.deadline.set(currentBlock.add(durationInBlocks));
  }

  // 投资方法
  @method async contribute(amount: UInt64) {
    // 检查当前是否在众筹时间窗口内
    this.network.globalSlotSinceGenesis.requireEquals(this.network.globalSlotSinceGenesis.get());
    const currentBlock = this.network.timestamp.get();
    const deadline = this.deadline.get();
    this.deadline.requireEquals(this.deadline.get());
    currentBlock.assertLessThanOrEqual(deadline);

    // 检查是否超过硬顶
    const totalRaised = this.totalRaised.get();
    this.totalRaised.requireEquals(this.totalRaised.get());
    const targetAmount = this.targetAmount.get();
    this.targetAmount.requireEquals(this.targetAmount.get());
    totalRaised.add(amount).assertLessThanOrEqual(targetAmount);

    // 更新已筹集金额
    this.totalRaised.set(totalRaised.add(amount));
  }

  // 提取资金方法
  @method async withdraw() {
    // 检查当前是否已过截止时间
    this.network.globalSlotSinceGenesis.requireEquals(this.network.globalSlotSinceGenesis.get());
    const currentBlock = this.network.timestamp.get();
    const deadline = this.deadline.get();
    this.deadline.requireEquals(this.deadline.get());
    currentBlock.assertGreaterThanOrEqual(deadline);

    // 检查调用者是否为受益人
    const beneficiary = this.beneficiary.get();
    this.beneficiary.requireEquals(this.beneficiary.get());
    this.sender.getAndRequireSignature().assertEquals(beneficiary);

    // 获取合约余额并转账给受益人
    const balance = this.account.balance.get();
    this.account.balance.requireEquals(this.account.balance.get());
    this.send({ to: beneficiary, amount: balance });
  }
}
