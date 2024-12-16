import {
  SmartContract,
  state,
  State,
  method,
  UInt64,
  Permissions,
  PublicKey,
  DeployArgs,
  AccountUpdate
} from 'o1js';

export class CrowdfundingContract extends SmartContract {
  @state(UInt64) startTime = State<UInt64>(new UInt64(0));
  @state(UInt64) endTime = State<UInt64>(new UInt64(0));
  @state(UInt64) fundraisingGoal = State<UInt64>(new UInt64(0)); // Target aomunt
  @state(UInt64) totalFunded = State<UInt64>(new UInt64(0)); // Amount raised
  @state(PublicKey) creator = State<PublicKey>(); // Project creator

  // Deploy the contract and initialize it
  async deploy(args: DeployArgs & { fundraisingGoal: UInt64; endTime: UInt64; creator: PublicKey }) {
    await super.deploy(args);
    this.fundraisingGoal.set(args.fundraisingGoal);
    this.endTime.set(args.endTime);
    this.creator.set(args.creator);
    this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
  }

  // Invest
  @method async fund(amount: UInt64) {
    // Check if it is within the crowdfunding time window
    const end = this.endTime.getAndRequireEquals();
    const currentTime = this.network.timestamp.getAndRequireEquals();
    currentTime.assertLessThan(end);

    // Check if the hard cap is exceeded
    const currentTotal = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    currentTotal.add(amount).assertLessThanOrEqual(goal);

    // Check investor balance
    const donator = this.sender.getAndRequireSignature();
    const donatorUpdate = AccountUpdate.createSigned(donator);
    const donatorBalance = donatorUpdate.account.balance.getAndRequireEquals();
    donatorBalance.assertGreaterThanOrEqual(amount);

    // Transfer
    donatorUpdate.send({ to: this.address, amount: amount });
    this.totalFunded.set(currentTotal.add(amount));
  }

  // Project creator withdrawal
  @method async withdraw() {
    // Check if the withdrawal time is after the crowdsale ends
    const end = this.endTime.getAndRequireEquals();
    const currentTime = this.network.timestamp.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(end);

    // Check whether the raised amount has reached the target amount
    const total = this.totalFunded.getAndRequireEquals();
    const goal = this.fundraisingGoal.getAndRequireEquals();
    total.assertGreaterThanOrEqual(goal);

    // Check if the caller is the project creator
    const creator = this.creator.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    creator.assertEquals(sender);

    // Withdraw
    const totalFunded = this.totalFunded.getAndRequireEquals();
    this.send({ to: creator, amount: totalFunded });
  }

  // Project creator modifies the end time
  @method async setEndTime(endTime: UInt64) {
    // Check if the caller is the project creator
    const creator = this.creator.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    creator.assertEquals(sender);

    // Modify end time
    this.endTime.set(endTime);
  }
}
