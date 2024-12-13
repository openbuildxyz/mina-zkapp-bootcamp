import { 
  AccountUpdate,
  method,
  Permissions, 
  Provable, 
  PublicKey, 
  SmartContract, 
  state, 
  State, 
  UInt32, 
  UInt64, 
  type DeployArgs 
} from 'o1js';

export class CrowdFundingContract extends SmartContract {
  @state(UInt64) maxCap = State<UInt64>();
  @state(UInt32) deadline = State<UInt32>();
  @state(PublicKey) beneficiary = State<PublicKey>();

  // 验证众筹状态是否有效
  private validateFundingState() {
    // 获取最大募资额度
    const maxCapAmount = this.maxCap.getAndRequireEquals();
    // 获取截止时间
    const deadlineTime = this.deadline.getAndRequireEquals();
    // 获取受益人地址
    const beneficiaryAddr = this.beneficiary.getAndRequireEquals();
    // 获取当前合约余额
    const contractBalance = this.account.balance.getAndRequireEquals();
    // 获取当前区块时间
    const currentBlockTime = this.network.blockchainLength.getAndRequireEquals();

    // 检查是否已过期
    currentBlockTime.greaterThan(deadlineTime).assertFalse("Fundraising period has ended");
    // 检查是否达到上限
    contractBalance.greaterThan(maxCapAmount).assertFalse("Maximum funding cap reached");

    return { maxCapAmount, deadlineTime, beneficiaryAddr, contractBalance }
  }

  // 部署并初始化合约
  async deploy(args: DeployArgs & {beneficiary: PublicKey, maxCap: UInt64, deadline: UInt32}) {
    await super.deploy(args);

    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    })

    this.beneficiary.set(args.beneficiary);
    this.maxCap.set(args.maxCap);
    this.deadline.set(args.deadline);
  }

  // 投资功能
  @method async contribute(amount: UInt64) {
    this.validateFundingState();
    const maxAmount = this.maxCap.getAndRequireEquals();
    const currentBalance = this.account.balance.getAndRequireEquals();
    const remainingSpace = maxAmount.sub(currentBalance);
    
    // 计算实际可接受的投资金额
    const actualContribution = Provable.if(
      remainingSpace.greaterThanOrEqual(amount),
      amount,
      remainingSpace
    );
    
    const contributorUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
    contributorUpdate.send({ to: this, amount: actualContribution })
  }

  // 提取资金
  @method async claimFunds() {
    const { beneficiaryAddr, contractBalance } = this.validateFundingState();

    this.sender.getAndRequireSignature().assertEquals(beneficiaryAddr);
    this.send({ to: beneficiaryAddr, amount: contractBalance })
  }
}