import {
  SmartContract,
  state,
  State,
  method,
  UInt64,
  Permissions,
  PublicKey,
  DeployArgs,
  AccountUpdate
} from 'o1js';

export class CrowdfundingContract extends SmartContract {
  // 众筹目标金额
  @state(UInt64) fundraisingGoal = State<UInt64>(new UInt64(0));

  // 众筹开始和结束时间
  @state(UInt64) startTime = State<UInt64>(new UInt64(0));
  @state(UInt64) endTime = State<UInt64>(new UInt64(0));

  // 已筹集的总金额
  @state(UInt64) totalFunded = State<UInt64>(new UInt64(0));

  // 项目发起人
  @state(PublicKey) creator = State<PublicKey>();

  // 部署合约并初始化
  async deploy(args: DeployArgs & { fundraisingGoal: UInt64; endTime: UInt64; creator: PublicKey }) {
    await super.deploy(args);
    this.fundraisingGoal.set(args.fundraisingGoal);
    this.endTime.set(args.endTime);
    this.creator.set(args.creator);
    this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
  }

  //投资
  @method async fund(amount: UInt64) {
    //检查是否在众筹时间窗口内
    const end = this.endTime.getAndRequireEquals();
    const currentTime = this.network.timestamp.getAndRequireEquals();
    currentTime.assertLessThan(end);

    //检查是否超过硬顶
    const currentTotal = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    currentTotal.add(amount).assertLessThanOrEqual(goal);

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
    // 检查提款时间在众筹结束后
    const end = this.endTime.getAndRequireEquals();
    const currentTime = this.network.timestamp.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(end);

    // 检查已筹集金额达到目标
    const total = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    total.assertGreaterThanOrEqual(goal);

    // 检查调用者是否是项目发起人
    const creator = this.creator.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    creator.assertEquals(sender);

    // 提款
    const totalFunded = this.totalFunded.getAndRequireEquals();
    this.send({ to: creator, amount: totalFunded });
  }

  // 项目发起人修改结束时间
  @method async setEndTime(endTime: UInt64) {
    // 检查调用者是否是项目发起人
    const creator = this.creator.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    creator.assertEquals(sender);

    // 修改结束时间
    this.endTime.set(endTime);
  }
}