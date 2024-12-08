import {
  AccountUpdate,
  DeployArgs,
  method,
  Permissions,
  Provable,
  PublicKey,
  SmartContract,
  State,
  state,
  UInt32,
  UInt64,
} from 'o1js';

type CustomDeployArgs = DeployArgs & {
  hardCap: UInt64;
  endTime: UInt32;
  raiseOwner: PublicKey;
};

export class Fundraising extends SmartContract {
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();
  @state(UInt64) totalRaised = State<UInt64>();
  @state(PublicKey) raiseOwner = State<PublicKey>();

  async deploy(args: CustomDeployArgs) {
    await super.deploy(args);

    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    this.hardCap.set(args.hardCap);
    this.endTime.set(args.endTime);
    this.raiseOwner.set(args.raiseOwner);
    this.totalRaised.set(UInt64.zero);
  }

  @method async invest(amount: UInt64) {
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();

    currentTime.assertLessThanOrEqual(endTime, 'Campaign ended');

    const totalRaised = this.totalRaised.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    totalRaised.add(amount).assertLessThanOrEqual(hardCap);

    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    senderUpdate.balanceChange.sub(amount);
    senderUpdate.send({ to: this.address, amount });

    this.totalRaised.set(totalRaised.add(amount));
  }

  @method async withdraw(amount: UInt64) {
    this.raiseOwner
      .getAndRequireEquals()
      .equals(this.sender.getAndRequireSignature())
      .assertTrue('Only raise owner can withdraw');

    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();

    currentTime.assertGreaterThanOrEqual(
      endTime,
      'Withdrawing is not starting yet'
    );

    this.totalRaised
      .getAndRequireEquals()
      .assertGreaterThan(UInt64.zero, 'No money to withdraw');
    this.totalRaised
      .getAndRequireEquals()
      .assertGreaterThanOrEqual(amount, 'Not enough money to withdraw');

    const totalRemained = this.totalRaised.getAndRequireEquals();

    this.send({
      to: this.raiseOwner.getAndRequireEquals(),
      amount,
    });

    this.totalRaised.set(totalRemained.sub(amount));
  }
}
