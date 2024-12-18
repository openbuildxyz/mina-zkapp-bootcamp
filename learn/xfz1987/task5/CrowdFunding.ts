import {
  SmartContract,
  state,
  State,
  PublicKey,
  UInt64,
  DeployArgs,
  Permissions,
  method,
  UInt32,
  AccountUpdate,
  Struct,
} from 'o1js';

export class DeployEvent extends Struct({
  caller: PublicKey, // 哪个账户发起的动作
  endTime: UInt32, // 众筹结束时间
  totalAmount: UInt64,
  hardCap: UInt64, // 硬帽
  pricePerToken: UInt64, // 价格
  timestamp: UInt32, // 当前 block size
}) {}

export class ActionEvent extends Struct({
  caller: PublicKey,
  amount: UInt64,
  timestamp: UInt32,
}) {}

// contract
export class CrowdFunding extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(UInt32) endTime = State<UInt32>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt64) pricePerToken = State<UInt64>();
  @state(UInt64) totalAmount = State<UInt64>();

  events = {
    deploy: DeployEvent,
    action: ActionEvent,
  };

  async deploy(
    args: DeployArgs & {
      endTime: UInt32;
      hardCap: UInt64;
      pricePerToken: UInt64;
    }
  ) {
    await super.deploy(args);

    // 初始化参数
    const sender = this.sender.getAndRequireSignatureV2();
    this.owner.set(sender);
    this.endTime.set(args.endTime);
    this.pricePerToken.set(args.pricePerToken);
    this.hardCap.set(args.hardCap);
    this.totalAmount.set(UInt64.zero);

    // 设置合约权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    this.emitEvent('deploy', {
      caller: sender,
      endTime: args.endTime,
      totalAmount: UInt64.zero,
      hardCap: args.hardCap,
      pricePerToken: args.pricePerToken,
      timestamp: this.network.blockchainLength.getAndRequireEquals(),
    });
  }

  @method
  async buyTokens(amount: UInt64) {
    // 检查时间
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime, '购买已结束');

    const sender = this.sender.getAndRequireSignatureV2();

    // 检查（防止恶意炒币）
    const investor = this.owner.getAndRequireEquals();
    sender.equals(investor).assertFalse('购买人不能是合约所有者');

    // 检查购买数量是否大于0
    amount.assertGreaterThan(UInt64.zero, '购买数量必须大于0');

    // 检查硬帽
    const hardCap = this.hardCap.getAndRequireEquals();
    const totalAmount = this.totalAmount.getAndRequireEquals();
    const newAmount = totalAmount.add(amount);

    newAmount.assertLessThanOrEqual(hardCap, '购买金额超过限制');

    // 更新合约余额
    this.totalAmount.set(newAmount);

    // 从购买人转账到合约
    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: this.address, amount });

    // 从合约转token到购买人
    const pricePerToken = this.pricePerToken.getAndRequireEquals();
    const receiverAccountUpdate = this.send({
      to: sender,
      amount: amount.div(pricePerToken),
    });
    // MUST ADD THIS!
    receiverAccountUpdate.body.mayUseToken =
      AccountUpdate.MayUseToken.InheritFromParent;

    this.emitEvent('action', {
      caller: sender,
      amount: amount,
      timestamp: this.network.blockchainLength.getAndRequireEquals(),
    });
  }
}
