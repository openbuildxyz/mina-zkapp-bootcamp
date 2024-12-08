/**
 * 设计一个众筹合约, 时间窗口关闭后被投资人方可提款
 * 1.使用 o1js 设计一个众筹合约，在指定时间窗口间允许任何人投入 MINA，有硬顶（上限）
 * 2.指定时间窗口结束后，被投资人方可提款
 */
import {
  state,
  State,
  method,
  UInt64,
  SmartContract,
  DeployArgs,
  Permissions,
  PublicKey,
  AccountUpdate,
  UInt32,
} from 'o1js';

// 目标金额（硬顶）

export class CrowdFundingZkapp extends SmartContract {
  // 将时间窗口作为状态变量存储
  @state(UInt32) endTime = State<UInt32>(); // 结束时间
  @state(UInt64) totalAmount = State<UInt64>(); // 总金额
  @state(UInt64) targetAmount = State<UInt64>(); // 硬顶
  @state(PublicKey) beneficiary = State<PublicKey>(); // 被投资人地址

  // 记录每个投资人的投资金额
  investorAmounts = new Map<PublicKey, UInt64>();

  async deploy(
    args: DeployArgs & {
      beneficiary: PublicKey;
      targetAmount: UInt64;
      endTime: UInt32;
    }
  ) {
    await super.deploy(args);

    // 在部署时设置时间窗口
    this.endTime.set(args.endTime);
    this.totalAmount.set(UInt64.zero);
    this.targetAmount.set(args.targetAmount);
    this.beneficiary.set(args.beneficiary);

    // 设置合约权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  // 投资
  @method
  async invest(amount: UInt64) {
    // 获取时间窗口
    const endTime = this.endTime.getAndRequireEquals();
    // 获取当前时间
    // const currentTime = this.network.timestamp.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();

    // 检查时间范围;
    currentTime.assertLessThan(endTime, '投资时间窗口已结束');

    // 检查投资金额是否大于0
    amount.assertGreaterThan(UInt64.zero, '投资金额必须大于0');

    // 获取当前总金额
    const currentAmount = this.totalAmount.getAndRequireEquals();
    // 获取当前硬顶
    const targetAmount = this.targetAmount.getAndRequireEquals();
    // 计算新总金额
    const newAmount = currentAmount.add(amount);
    // 检查是否超过目标金额
    newAmount.assertLessThanOrEqual(targetAmount, '投资金额超过目标金额');

    // 从投资人转账到合约
    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignatureV2()
    );
    senderUpdate.balanceChange.sub(amount);
    senderUpdate.send({ to: this.address, amount });

    // 更新状态
    this.totalAmount.set(newAmount);

    // 获取投资人已投资金额
    const existingAmount =
      this.investorAmounts.get(this.sender.getAndRequireSignatureV2()) ??
      UInt64.zero;
    // 更新投资人投资总额
    this.investorAmounts.set(
      this.sender.getAndRequireSignatureV2(),
      existingAmount.add(amount)
    );
  }

  // 被投资人提款前必须确保众筹已经正式结束
  @method
  // 提款
  async withdraw() {
    // 获取被投资人地址
    const beneficiary = this.beneficiary.getAndRequireEquals();
    //检查是否为被投资人
    const sender = this.sender.getAndRequireSignatureV2();
    sender.equals(beneficiary).assertTrue('只有被投资人可以提款');

    // 获取当前时间
    // const currentTime = this.network.timestamp.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    // 检查众筹时间结束后才可提款
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, '众筹结束前不能提款');

    // 获取当前总金额
    const currentAmount = this.totalAmount.getAndRequireEquals();

    // 从合约账户转账给受益人
    this.send({ to: beneficiary, amount: currentAmount });

    // 更新状态
    this.totalAmount.set(UInt64.zero);
  }
}
