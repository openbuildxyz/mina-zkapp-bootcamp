import {
  SmartContract,
  UInt32,
  UInt64,
  DeployArgs,
  Permissions,
  method,
  state,
  State,
  PublicKey,
  AccountUpdate,
} from "o1js";

export class Funding extends SmartContract {
  @state(PublicKey) owner = State<PublicKey>();
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();
  @state(UInt64) price = State<UInt64>();
  @state(UInt64) total = State<UInt64>();

  async deploy(
    props: DeployArgs & {
      hardCap: UInt64;
      endTime: UInt32;
      price: UInt64;
    }
  ) {
    await super.deploy(props);

    const sender = this.sender.getAndRequireSignature();
    this.owner.set(sender);
    this.hardCap.set(props.hardCap);
    this.endTime.set(props.endTime);
    this.price.set(props.price);
    this.total.set(UInt64.from(0));
    // init account permissions
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  @method async trade(amount: UInt64) {
    // check if trading period has ended
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const endTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(endTime, "Trading period has ended");

    // check if amount is valid
    const price = this.price.getAndRequireEquals();
    amount.assertEquals(price);

    // check if sender has enough funds
    const sender = this.sender.getUnconstrained();
    const senderAccountUpdate = AccountUpdate.create(sender);
    const senderBalance = senderAccountUpdate.account.balance.get();
    senderBalance.assertGreaterThanOrEqual(price, "Not enough funds");

    // check if hard cap has been reached
    const hardCap = this.hardCap.getAndRequireEquals();
    const total = this.total.getAndRequireEquals();
    total.assertLessThan(hardCap, "Hard cap has been reached");

    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: this.address, amount });

    const sellerUpdate = this.send({ to: sender, amount });
    sellerUpdate.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;
    this.total.set(total.add(amount));
  }
}
