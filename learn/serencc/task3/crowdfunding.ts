import {
  SmartContract,
  UInt64,
  UInt32,
  DeployArgs,
  Permissions,
  method,
  state,
  State,
  PublicKey,
  AccountUpdate,
  Provable,
} from 'o1js';

export class Crowdfunding extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();

  async deploy(
    props: DeployArgs & {
      owner: PublicKey;
      hardCap: UInt64;
      endTime: UInt32;
    }
  ) {
    await super.deploy(props);

    // init account permissions
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    this.owner.set(props.owner);
    this.hardCap.set(props.hardCap);
    this.endTime.set(props.endTime);
  }

  @method async fund(amount: UInt64) {
    // check if funding period has ended
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime, 'Funding period has ended');

    // check if amount is valid
    amount.assertGreaterThan(UInt64.zero, 'Amount must be greater than 0');

    // check if hard cap has been reached
    const hardCap = this.hardCap.getAndRequireEquals();
    const balance = this.account.balance.getAndRequireEquals();
    const remaining = hardCap.sub(balance);
    remaining.assertGreaterThan(UInt64.zero, 'Hard cap has been reached');

    const actualFunding = Provable.if(
      amount.lessThanOrEqual(remaining),
      amount,
      remaining
    );

    // check if sender has enough funds
    const senderAccountUpdate = AccountUpdate.create(
      this.sender.getUnconstrained()
    );
    const senderBalance = senderAccountUpdate.account.balance.get();
    senderBalance.assertGreaterThanOrEqual(actualFunding, 'Not enough funds');

    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    senderUpdate.send({ to: this.address, amount: actualFunding });
  }

  @method async withdraw(owner: PublicKey) {
    // check if sender is the contract owner
    const currentOwner = this.owner.getAndRequireEquals();
    const currentSender = this.sender.getAndRequireSignature();
    currentSender.assertEquals(currentOwner);

    // check if the balance is greater than 0
    const currentBalance = this.account.balance.getAndRequireEquals();
    currentBalance.assertGreaterThan(UInt64.zero, 'Balance is 0');

    // check if the crowd funding has ended
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime, 'Funding period is not over');

    const withdrawal = this.account.balance.getAndRequireEquals();

    this.send({ to: owner, amount: withdrawal });
  }
}
