import { 
  SmartContract, state, State, PublicKey, UInt64, DeployArgs, 
  Permissions, method, UInt32, AccountUpdate, Provable, Struct, Bool 
} from 'o1js';

export class InitializationRecord extends Struct({
  initiator: PublicKey,
  endTime: UInt32,
  minStake: UInt64,
  maxPool: UInt64,
  blockHeight: UInt32,
}){}

export class StakingRecord extends Struct({
  participant: PublicKey,
  stake: UInt64,
  blockHeight: UInt32,
}){}

export class RetrievalRecord extends Struct({
  beneficiary: PublicKey,
  value: UInt64,
  blockHeight: UInt32,
}){}

/**
 * Decentralized Funding Pool Implementation
 * A blockchain-based crowdfunding solution with time-locked withdrawals
 */
export class CrowdFunding extends SmartContract {
  @state(PublicKey) projectOwner = State<PublicKey>();
  @state(UInt32) endTime = State<UInt32>();
  @state(UInt64) minStake = State<UInt64>();
  @state(UInt64) maxPool = State<UInt64>();

  events = {
    Initialize: InitializationRecord,
    Staked: StakingRecord,
    Retrieved: RetrievalRecord,
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
    this.projectOwner.set(initiator);
    this.endTime.set(args.endTime);
    this.minStake.set(args.minStake);
    this.maxPool.set(args.maxPool);

    this.emitEvent('Initialize', {
      initiator,
      endTime: args.endTime,
      minStake: args.minStake,
      maxPool: args.maxPool,
      blockHeight: this.network.blockchainLength.getAndRequireEquals(),
    });
  }

  @method async stake(value: UInt64) {
    const participant = this.sender.getAndRequireSignature();
    this.validateStaking(participant, value);

    const allowedStake = this.calculateAllowedStake(value);
    const participantUpdate = AccountUpdate.createSigned(participant);
    participantUpdate.send({ to: this.address, amount: allowedStake });

    this.emitEvent('Staked', { 
      participant, 
      stake: allowedStake, 
      blockHeight: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  @method async retrieve() {
    this.validateRetrieval();
    const beneficiary = this.sender.getAndRequireSignature();
    beneficiary.equals(this.projectOwner.getAndRequireEquals())
      .assertTrue("Unauthorized retrieval attempt");
    
    const poolBalance = this.account.balance.getAndRequireEquals();
    poolBalance.assertGreaterThan(UInt64.from(0), "Empty pool");

    const beneficiaryUpdate = AccountUpdate.createSigned(beneficiary);
    this.send({ to: beneficiaryUpdate, amount: poolBalance });

    const vestingSchedule = {
      initialMinimumBalance: poolBalance,
      cliffTime: UInt32.from(0),
      cliffAmount: poolBalance.mul(2).div(10),
      vestingPeriod: UInt32.from(200),
      vestingIncrement: poolBalance.div(10),
    };
    beneficiaryUpdate.account.timing.set(vestingSchedule);

    this.emitEvent('Retrieved', { 
      beneficiary, 
      value: poolBalance, 
      blockHeight: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  private async validateStaking(participant: PublicKey, value: UInt64) {
    const currentBlock = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.endTime.getAndRequireEquals();
    currentBlock.assertLessThanOrEqual(deadline, "Pool closed");

    const owner = this.projectOwner.getAndRequireEquals();
    participant.equals(owner).assertFalse("Owner cannot stake");

    const minimumStake = this.minStake.getAndRequireEquals();
    value.assertGreaterThanOrEqual(minimumStake, "Stake too small");

    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.maxPool.getAndRequireEquals();
    currentPool.assertLessThan(poolLimit, "Pool full");
  }

  private async validateRetrieval() {
    const currentBlock = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.endTime.getAndRequireEquals();
    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.maxPool.getAndRequireEquals();
    
    Bool.or(
      currentBlock.greaterThanOrEqual(deadline), 
      currentPool.greaterThanOrEqual(poolLimit)
    ).assertTrue("Retrieval conditions not met");
  }

  private calculateAllowedStake(proposed: UInt64) {
    const currentPool = this.account.balance.getAndRequireEquals();
    const poolLimit = this.maxPool.getAndRequireEquals();
    const available = poolLimit.sub(currentPool);
    return Provable.if(proposed.lessThanOrEqual(available), proposed, available);
  }

  // Public getters
  getProjectOwner = () => this.projectOwner.get();
  getEndTime = () => this.endTime.get();
  getMinStake = () => this.minStake.get();
  getMaxPool = () => this.maxPool.get();
}
