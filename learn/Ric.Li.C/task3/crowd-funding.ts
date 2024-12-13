import {
  SmartContract,
  state,
  State,
  method,
  UInt32,
  UInt64,
  Bool,
  PublicKey,
  Provable,
  DeployArgs,
  Permissions,
  AccountUpdate,
} from 'o1js';

/**
 * Crowd Funding Contract
 */
export class CrowdFunding extends SmartContract {
  // State variables
  @state(UInt64) totalRaised = State<UInt64>(); // Total amount of MINA raised
  @state(UInt64) fundingCap = State<UInt64>(); // Hard cap for funding
  @state(UInt32) endTime = State<UInt32>(); // Time window end (block height)
  @state(PublicKey) owner = State<PublicKey>(); // Owner of the contract (can withdraw funds)

  async deploy(
    props: DeployArgs & {
      fundingCap: UInt64;
      endTime: UInt32;
      owner: PublicKey;
    }
  ) {
    await super.deploy(props);

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    // Below will be logged twice due to prove() and actual send()
    Provable.log('props.fundingCap is', props.fundingCap);
    Provable.log('props.endTime is', props.endTime);
    Provable.log('props.owner is', props.owner);
    Provable.log(
      '============================================================================================='
    );

    // 初始化合约状态
    this.totalRaised.set(UInt64.zero);
    this.fundingCap.set(props.fundingCap);
    this.endTime.set(props.endTime);
    this.owner.set(props.owner);
  }

  // Method for contributing MINA to the crowdfunding campaign
  @method async contribute(amount: UInt64) {
    // Ensure the contribution amount is not zero
    amount.assertGreaterThan(UInt64.zero);

    // Ensure the current time is within the funding period
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime);

    const fundingEndTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(
      fundingEndTime,
      'Funding period has ended'
    );

    // Ensure the total raised doesn't exceed the funding cap
    const currentRaised = this.totalRaised.getAndRequireEquals();
    const fundingCap = this.fundingCap.getAndRequireEquals();
    const remaining = fundingCap.sub(currentRaised);
    remaining.assertGreaterThan(UInt64.zero);

    // Get contribution amount
    const contribution = Provable.if(
      amount.lessThanOrEqual(remaining),
      amount,
      remaining
    );

    // Ensure the sender has enough balance
    const senderAccountUpdate = AccountUpdate.create(
      this.sender.getUnconstrained()
    );
    const senderBalance = senderAccountUpdate.account.balance.get();
    senderBalance.assertGreaterThanOrEqual(
      contribution,
      'Sender does not have enough balance to contribute'
    );

    // Send mina to this contract
    const updateSender = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    updateSender.send({ to: this.address, amount: contribution });

    // Update the total raised
    const newRaised = currentRaised.add(contribution);
    this.totalRaised.set(newRaised);
  }

  // Method for the owner to withdraw funds after the funding period ends
  @method async withdraw(receiver: PublicKey) {
    // Check that the contract balance is not zero
    const currentBalance = this.account.balance.getAndRequireEquals();
    currentBalance.assertGreaterThan(UInt64.zero);

    // Check that only the owner can withdraw
    const owner = this.owner.getAndRequireEquals();
    const senderPublicKey = this.sender.getAndRequireSignature(); // Retrieve the sender's public key
    senderPublicKey.assertEquals(owner); // Compare sender with owner

    // Ensure the funding period has ended
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime);
    Provable.log('currentTime is', currentTime);

    const fundingEndTime = this.endTime.getAndRequireEquals();
    Provable.log('fundingEndTime is', fundingEndTime);
    // currentTime.assertGreaterThanOrEqual(
    //   fundingEndTime,
    //   'Funding period is still active'
    // );
    const isTimeOver = currentTime.greaterThanOrEqual(fundingEndTime);

    const totalRaised = this.totalRaised.getAndRequireEquals();
    const fundingCap = this.fundingCap.getAndRequireEquals();
    const isCapReached = totalRaised.greaterThanOrEqual(fundingCap);

    isTimeOver.or(isCapReached).assertTrue('Funding period is still active');

    // Perform the withdrawal
    this.send({ to: receiver, amount: currentBalance });
  }
}
