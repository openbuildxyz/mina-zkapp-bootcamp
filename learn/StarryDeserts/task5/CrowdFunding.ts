import { 
  SmartContract, state, State, PublicKey, UInt64, DeployArgs, 
  Permissions, method, UInt32, AccountUpdate, Provable, Struct, Bool 
} from 'o1js';

export class FundingEvent extends Struct({
  creator: PublicKey,
  deadline: UInt32,
  minimumContribution: UInt64,
  targetAmount: UInt64,
  currentBlock: UInt32,
}){}

export class ContributionEvent extends Struct({
  contributor: PublicKey,
  amount: UInt64,
  timestamp: UInt32,
}){}

export class WithdrawalEvent extends Struct({
  recipient: PublicKey,
  amount: UInt64,
  timestamp: UInt32,
}){}

/**
 * Decentralized Funding Pool Implementation
 * A blockchain-based crowdfunding solution with time-locked withdrawals
 */
export class FundingPool extends SmartContract {
  @state(PublicKey) creator = State<PublicKey>();
  @state(UInt32) deadline = State<UInt32>();
  @state(UInt64) minimumContribution = State<UInt64>();
  @state(UInt64) targetAmount = State<UInt64>();

  events = {
    Created: FundingEvent,
    Contributed: ContributionEvent,
    Withdrawn: WithdrawalEvent,
  }

  async deploy(args: DeployArgs & {
    endTime: UInt32;
    minStake: UInt64;
    maxPool: UInt64;
  }) {
    await super.deploy(args);
    
    const securitySettings = {
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    };
    this.account.permissions.set(securitySettings);
  
    const initiator = this.sender.getAndRequireSignature();
    this.creator.set(initiator);
    this.deadline.set(args.endTime);
    this.minimumContribution.set(args.minStake);
    this.targetAmount.set(args.maxPool);

    this.emitEvent('Created', {
      creator: initiator,
      deadline: args.endTime,
      minimumContribution: args.minStake,
      targetAmount: args.maxPool,
      currentBlock: this.network.blockchainLength.getAndRequireEquals(),
    });
  }

  @method async contribute(value: UInt64) {
    const contributor = this.sender.getAndRequireSignature();
    this.validateContribution(contributor, value);

    const allowedContribution = this.calculateAllowedContribution(value);
    const contributorUpdate = AccountUpdate.createSigned(contributor);
    contributorUpdate.send({ to: this.address, amount: allowedContribution });

    this.emitEvent('Contributed', { 
      contributor, 
      amount: allowedContribution, 
      timestamp: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  @method async withdraw() {
    this.validateWithdrawal();
    const recipient = this.sender.getAndRequireSignature();
    recipient.equals(this.creator.getAndRequireEquals())
      .assertTrue("Unauthorized withdrawal attempt");
    
    const poolBalance = this.account.balance.getAndRequireEquals();
    poolBalance.assertGreaterThan(UInt64.from(0), "Empty pool");

    const recipientUpdate = AccountUpdate.createSigned(recipient);
    this.send({ to: recipientUpdate, amount: poolBalance });

    const vestingSchedule = {
      initialMinimumBalance: poolBalance,
      cliffTime: UInt32.from(0),
      cliffAmount: poolBalance.mul(2).div(10),
      vestingPeriod: UInt32.from(200),
      vestingIncrement: poolBalance.div(10),
    };
    recipientUpdate.account.timing.set(vestingSchedule);

    this.emitEvent('Withdrawn', { 
      recipient, 
      amount: poolBalance, 
      timestamp: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  private async validateContribution(contributor: PublicKey, value: UInt64) {
    const currentBlock = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.deadline.getAndRequireEquals();
    currentBlock.assertLessThanOrEqual(deadline, "Pool closed");

    const owner = this.creator.getAndRequireEquals();
    contributor.equals(owner).assertFalse("Owner cannot contribute");

    const minimumContribution = this.minimumContribution.getAndRequireEquals();
    value.assertGreaterThanOrEqual(minimumContribution, "Contribution too small");

    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.targetAmount.getAndRequireEquals();
    currentPool.assertLessThan(poolLimit, "Pool full");
  }

  private async validateWithdrawal() {
    const currentBlock = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.deadline.getAndRequireEquals();
    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.targetAmount.getAndRequireEquals();
    
    Bool.or(
      currentBlock.greaterThanOrEqual(deadline), 
      currentPool.greaterThanOrEqual(poolLimit)
    ).assertTrue("Withdrawal conditions not met");
  }

  private calculateAllowedContribution(proposed: UInt64) {
    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.targetAmount.getAndRequireEquals();
    const available = poolLimit.sub(currentPool);
    return Provable.if(proposed.lessThanOrEqual(available), proposed, available);
  }

  // Public getters
  getCreator = () => this.creator.get();
  getDeadline = () => this.deadline.get();
  getMinimumContribution = () => this.minimumContribution.get();
  getTargetAmount = () => this.targetAmount.get();
  getEndTime = () => this.deadline.get();
  getMinStake = () => this.minimumContribution.get();
  getMaxPool = () => this.targetAmount.get();
  getProjectOwner = () => this.creator.get();
}
