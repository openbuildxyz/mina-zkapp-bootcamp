import {
  Field,
  state,
  State,
  method,
  UInt64,
  PrivateKey,
  SmartContract,
  Mina,
  AccountUpdate,
  Bool,
  PublicKey,
  DeployArgs,
  Permissions,
  UInt32,
  Provable,
} from 'o1js';

export class CrowdfundingZkapp extends SmartContract {
  @state(PublicKey) withdrawer = State<PublicKey>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();

  private getValidDepositAmount(amount: UInt64) {
    const bal = this.account.balance.getAndRequireEquals();
    const hardCap = this.hardCap.get();
    const afterDepositAmount = bal.add(amount);
    const validAmount = Provable.if(
      hardCap.greaterThan(afterDepositAmount),
      amount,
      hardCap.sub(bal)
    );
    return validAmount;
  }

  async deploy(
    args: DeployArgs & {
      endTime: UInt32;
      hardCap: UInt64;
      withdrawer: PublicKey;
    }
  ) {
    await super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    this.hardCap.set(args.hardCap);
    this.endTime.set(args.endTime);
    this.withdrawer.set(args.withdrawer);
  }

  @method
  async deposit(amount: UInt64) {
    const endTime = this.endTime.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const currentBal = this.account.balance.getAndRequireEquals();

    const curTime = this.network.blockchainLength.getAndRequireEquals();
    curTime.assertLessThan(endTime);
    currentBal.assertLessThan(hardCap);

    const validAmount = this.getValidDepositAmount(amount);
    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    senderUpdate.send({ to: this, amount: validAmount });
  }

  @method
  async withdraw() {
    const endTime = this.endTime.getAndRequireEquals();
    const currentBal = this.account.balance.getAndRequireEquals();

    const curTime = this.network.blockchainLength.getAndRequireEquals();
    curTime.assertGreaterThan(endTime);

    const withdrawer = this.withdrawer.getAndRequireEquals();
    this.sender.getAndRequireSignature().assertEquals(withdrawer);
  }
}
