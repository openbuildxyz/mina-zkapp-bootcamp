import {
  State,
  PublicKey,
  SmartContract,
  state,
  method,
  UInt64,
  Permissions,
  DeployArgs,
  AccountUpdate,
  UInt32,
} from 'o1js';

export class CrowdFundingZkapp extends SmartContract {
  // 投资人
  @state(PublicKey) investor = State<PublicKey>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();

  async deploy(
    args: DeployArgs & {
      investor: PublicKey;
      hardCap: UInt64;
      endTime: UInt32;
    }
  ): Promise<void> {
    await super.deploy(args);

    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    // 设置状态
    this.investor.set(args.investor);
    this.hardCap.set(args.hardCap);
    this.endTime.set(args.endTime);
  }

  // 投资
  @method
  async invest(amount: UInt64) {
    console.log('投资');

    // 当前时间
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    // 结束时间
    const endTime = this.endTime.getAndRequireEquals();
    // 硬顶
    const hardCap = this.hardCap.getAndRequireEquals();
    // 当前账户余额
    const currentBalance = this.account.balance.getAndRequireEquals();

    // 检查是否在时间窗口内
    currentTime.lessThanOrEqual(endTime).assertTrue('投资事件已过期');

    // 检查硬顶限制
    currentBalance
      .add(amount)
      .lessThanOrEqual(hardCap)
      .assertTrue('投资金额已到顶');

    // 转账资金到合约账户
    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    const receiverAcctUpt = senderUpdate.send({ to: this, amount });
    receiverAcctUpt.body.mayUseToken =
      AccountUpdate.MayUseToken.InheritFromParent; // MUST ADD THIS!
  }

  // 提现
  @method
  async withdraw() {
    console.log('提现');

    const investor = this.investor.getAndRequireEquals();
    this.sender
      .getAndRequireSignature()
      .equals(investor)
      .assertTrue('只有投资人可以提现');

    this.network.blockchainLength
      .getAndRequireEquals()
      .greaterThanOrEqual(this.endTime.getAndRequireEquals())
      .assertTrue('众筹未结束');

    // 将资金发送给投资人
    const currentBalance = this.account.balance.getAndRequireEquals();
    const investorUpdate = AccountUpdate.createSigned(investor);
    const receiverAcctUpt = this.send({
      to: investorUpdate,
      amount: currentBalance,
    });
    receiverAcctUpt.body.mayUseToken =
      AccountUpdate.MayUseToken.InheritFromParent; // MUST ADD THIS!
  }
}
