/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  state,
  State,
  UInt64,
  SmartContract,
  PublicKey,
  UInt32,
  DeployArgs,
  Permissions,
  Provable,
  AccountUpdate,
  method,
  Bool,
  Field,
} from 'o1js';

export class FundingContract extends SmartContract {
  // 硬顶
  @state(UInt64) hardCap = State<UInt64>();

  @state(UInt32) endTime = State<UInt32>();

  //提款地址
  @state(PublicKey) withdrawer = State<PublicKey>();

  async deploy(
    args: DeployArgs & {
      hardCap: UInt64;
      endTime: UInt32;
      withdrawer: PublicKey;
    }
  ) {
    await super.deploy(args);

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    // 初始化合约状态
    this.hardCap.set(args.hardCap);
    this.endTime.set(args.endTime);
    this.withdrawer.set(args.withdrawer);
  }

  @method
  async deposit(amount: UInt64) {
    const endTime = this.endTime.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const balance = this.account.balance.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();

    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime);
    balance.assertLessThanOrEqual(hardCap);

    const finalAmount = this.validDeposit(amount);
    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: this.address, amount: finalAmount });

    senderUpdate.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
  }

  validDeposit(amount: UInt64) {
    const endTime = this.endTime.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const balance = this.account.balance.getAndRequireEquals();

    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime);

    balance.assertLessThanOrEqual(hardCap);
    const finalAmount = Provable.if(
      balance.add(amount).greaterThan(hardCap),
      hardCap.sub(balance),
      amount
    );
    return finalAmount;
  }

  @method
  async withdraw() {
    const endTime = this.endTime.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const balance = this.account.balance.getAndRequireEquals();
    const withdrawer = this.withdrawer.getAndRequireEquals();
    this.sender.getAndRequireSignature().assertEquals(withdrawer);

    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime);

    const receiverUpdate = AccountUpdate.createSigned(withdrawer);
    this.send({ to: withdrawer, amount: balance });

    receiverUpdate.body.mayUseToken =
      AccountUpdate.MayUseToken.InheritFromParent;
  }

  getBalance(tokenId?: Field) {
    const senderUpdate = AccountUpdate.create(this.address, tokenId);
    return senderUpdate.account.balance.get();
  }

  getOwner() {
    return this.withdrawer.get();
  }
}
