import {
  SmartContract,
  state,
  State,
  method,
  UInt64,
  UInt32,
  Permissions,
  PublicKey,
  DeployArgs,
  AccountUpdate
} from 'o1js';

export class CrowdfundingContract extends SmartContract {
  // 众筹目标金额
  @state(UInt64) fundraisingGoal = State<UInt64>(new UInt64(0));

  // 众筹结束时间
  @state(UInt32) endTime = State<UInt32>(new UInt32(0));

  // 已筹集的总金额
  @state(UInt64) totalFunded = State<UInt64>(new UInt64(0));

  // 项目发起人
  @state(PublicKey) creator = State<PublicKey>();

  // 部署合约并初始化
  async deploy(args: DeployArgs & { fundraisingGoal: UInt64; endTime: UInt32; creator: PublicKey }) {
    await super.deploy(args);
    this.fundraisingGoal.set(args.fundraisingGoal);
    this.endTime.set(args.endTime);
    this.creator.set(args.creator);
    this.totalFunded.set(new UInt64(0));
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
      editState: Permissions.proofOrSignature(),
    });
  }

  //投资
  @method async fund(amount: UInt64) {
    //检查是否在众筹时间窗口内
    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertLessThan(endTime);

    //检查是否超过硬顶
    const currentTotal = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    currentTotal.add(amount).assertLessThanOrEqual(goal, "众筹金额已达到或者投资金额超过所需金额");

    //检查投资者余额
    const donator = this.sender.getAndRequireSignature();
    const donatorUpdate = AccountUpdate.createSigned(donator);
    const donatorBalance = donatorUpdate.account.balance.getAndRequireEquals();
    donatorBalance.assertGreaterThanOrEqual(amount);

    //转账
    donatorUpdate.send({ to: this.address, amount: amount });
    this.totalFunded.set(currentTotal.add(amount));
  }

  // 项目发起人提款
  @method async withdraw() {
    // 创建者检测
    const creator = this.creator.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    creator.equals(sender).assertTrue("只有项目发起人可以提款！");

    // 时间检测
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, "众筹时间未结束！");

    // 金额检测
    const totalFunded = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    totalFunded.assertGreaterThanOrEqual(goal, "众筹金额未达到目标！");

    // 转账
    const accountUpdate = AccountUpdate.createSigned(creator);

    this.send({ to: accountUpdate, amount: totalFunded });

    // 设置提取条件
    accountUpdate.account.timing.set({
      initialMinimumBalance: totalFunded,  // 初始锁定全部资金
      cliffTime: UInt32.from(0),           // 没有悬崖期
      cliffAmount: totalFunded.mul(2).div(10),         // 起始解锁为20%
      vestingPeriod: UInt32.from(200),     // 每200个slot解锁
      vestingIncrement: totalFunded.div(10)  // 每期解锁10%
    });

  }
}