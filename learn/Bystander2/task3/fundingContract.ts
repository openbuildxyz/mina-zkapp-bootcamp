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
    const finalAmount = this.validDeposit(amount);
    const sender = AccountUpdate.createSigned(
      this.sender.getAndRequireSignatureV2()
    );
    sender.send({ to: this, amount: finalAmount });
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

    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime);

    balance.assertEquals(hardCap);

    this.sender.getAndRequireSignatureV2().assertEquals(withdrawer);
    const receiver = this.withdrawer.getAndRequireEquals();
    this.send({ to: receiver, amount: balance });
  }
}
