import { AccountUpdate, method, Permissions, Provable, PublicKey, SmartContract, state, State, UInt32, UInt64, type DeployArgs } from 'o1js';

export class CrowdFunding extends SmartContract {
  @state(UInt64) targetAmount = State<UInt64>();
  @state(UInt32) endTimestamp = State<UInt32>();
  @state(PublicKey) beneficiary = State<PublicKey>();

  private checkFundingConditions() {
    const targetAmount = this.targetAmount.getAndRequireEquals();
    const endTimestamp = this.endTimestamp.getAndRequireEquals();
    const beneficiary = this.beneficiary.getAndRequireEquals();
    const currentBalance = this.account.balance.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();

    // 检查是否在众筹时间窗口内
    currentTime.greaterThan(endTimestamp).assertFalse(
      "Crowdfunding has ended"
    );

    // 检查是否达到目标金额
    currentBalance.greaterThan(targetAmount).assertFalse(
      "Crowdfunding target amount reached"
    );

    return {
      targetAmount,
      endTimestamp,
      beneficiary,
      currentBalance,
    }
  }

  private calculateContribution(amount: UInt64) {
    const targetAmount = this.targetAmount.getAndRequireEquals();
    const currentBalance = this.account.balance.getAndRequireEquals();

    // 计算实际可接受的投资金额
    const potentialTotal = currentBalance.add(amount);
    const actualContribution = Provable.if(
      potentialTotal.greaterThanOrEqual(targetAmount),
      targetAmount.sub(currentBalance),
      amount
    );

    return { actualContribution }
  }

  async deploy(args: DeployArgs & {
    beneficiary: PublicKey,
    targetAmount: UInt64,
    endTimestamp: UInt32
  }) {
    await super.deploy(args);

    // 设置合约权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    })

    this.beneficiary.set(args.beneficiary);
    this.targetAmount.set(args.targetAmount);
    this.endTimestamp.set(args.endTimestamp);
  }

  @method async contribute(amount: UInt64) {
    this.checkFundingConditions();
    const { actualContribution } = this.calculateContribution(amount);

    // 处理投资人转账
    const contributorUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
    contributorUpdate.send({ to: this, amount: actualContribution })
  }

  @method async withdraw() {
    const { beneficiary, currentBalance } = this.checkFundingConditions();

    // 验证提款人身份
    this.sender.getAndRequireSignature().assertEquals(beneficiary);

    // 转出所有资金给受益人
    this.send({ to: beneficiary, amount: currentBalance })
  }
}