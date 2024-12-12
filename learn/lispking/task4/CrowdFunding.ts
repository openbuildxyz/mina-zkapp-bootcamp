import { SmartContract, state, State, PublicKey, UInt64, DeployArgs, Permissions, method, UInt32, AccountUpdate, Provable, Struct, UInt8, Bool } from 'o1js';

export class DeployEvent extends Struct({
  who: PublicKey,
  deadline: UInt32,
  minimumInvestment: UInt64,
  hardCap: UInt64,
  timestamp: UInt32,
}){}

export class ContributedEvent extends Struct({
  who: PublicKey,
  amount: UInt64,
  timestamp: UInt32,
}){}

export class WithdrawnEvent extends Struct({
  who: PublicKey,
  amount: UInt64,
  timestamp: UInt32,
}){}

/**
 * CrowdFunding smart contract
 * See https://docs.minaprotocol.com/zkapps for more info.
 */
export class CrowdFunding extends SmartContract {
  @state(PublicKey) investor = State<PublicKey>();
  @state(UInt32) deadline = State<UInt32>();
  @state(UInt64) minimumInvestment = State<UInt64>();
  @state(UInt64) hardCap = State<UInt64>();

  events = {
    Deploy: DeployEvent,
    Contributed: ContributedEvent,
    Withdrawn: WithdrawnEvent,
  }

  async deploy(args: DeployArgs & {
    deadline: UInt32;
    minimumInvestment: UInt64;
    hardCap: UInt64;
  }) {
    await super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  
    const sender = this.sender.getAndRequireSignature();
    this.investor.set(sender);
    this.deadline.set(args.deadline);
    this.minimumInvestment.set(args.minimumInvestment);
    this.hardCap.set(args.hardCap);
    this.emitEvent('Deploy', {
      who: sender,
      deadline: args.deadline,
      minimumInvestment: args.minimumInvestment,
      hardCap: args.hardCap,
      timestamp: this.network.blockchainLength.getAndRequireEquals(),
    });
  }

  @method async contribute(amount: UInt64) {
    const sender = this.sender.getAndRequireSignature();
    this.ensureContribution(sender, amount);

    const canContributeAmount = this.calculateAmount(amount);

    const senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: this.address, amount: canContributeAmount });

    this.emitEvent('Contributed', { 
      who: sender, 
      amount: canContributeAmount, 
      timestamp: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  @method async withdraw() {
    this.ensureWithdrawal();
    const sender = this.sender.getAndRequireSignature()
    sender.equals(this.investor.getAndRequireEquals()).assertTrue("Only investor can withdraw");
    
    const totalAmount = this.account.balance.getAndRequireEquals();
    totalAmount.assertGreaterThan(UInt64.from(0), "No balance to withdraw");

    const senderUpdate = AccountUpdate.createSigned(sender);
    this.send({ to: senderUpdate, amount: totalAmount });

    senderUpdate.account.timing.set({
      initialMinimumBalance: totalAmount,
      cliffTime: UInt32.from(0),
      cliffAmount: totalAmount.mul(2).div(10),
      vestingPeriod: UInt32.from(200),
      vestingIncrement: totalAmount.div(10),
    });

    this.emitEvent('Withdrawn', { 
      who: sender, 
      amount: totalAmount, 
      timestamp: this.network.blockchainLength.getAndRequireEquals() 
    });
  }

  async ensureContribution(sender: PublicKey, amount: UInt64) {
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.deadline.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(deadline, "Deadline reached");

    const investor = this.investor.getAndRequireEquals();
    sender.equals(investor).assertFalse("Investor cannot contribute");

    const minimumInvestment = this.minimumInvestment.getAndRequireEquals();
    amount.assertGreaterThanOrEqual(minimumInvestment, "Minimum investment not met");

    const balance = this.account.balance.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    balance.assertLessThan(hardCap, "HardCap reached");
  }

  async ensureWithdrawal() {
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    const deadline = this.deadline.getAndRequireEquals();

    const balance = this.account.balance.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    Bool.or(currentTime.greaterThanOrEqual(deadline), balance.greaterThanOrEqual(hardCap)).assertTrue("Withdrawal not allowed");
  }

  calculateAmount(amount: UInt64) {
    const balance = this.account.balance.getAndRequireEquals();
    const hardCap = this.hardCap.getAndRequireEquals();
    const remaining = hardCap.sub(balance);
    return Provable.if(amount.lessThanOrEqual(remaining), amount, remaining);
  }

  getInvestor() {
    return this.investor.get();
  }

  getDeadline() {
    return this.deadline.get();
  }

  getMinimumInvestment() {
    return this.minimumInvestment.get();
  }

  getHardCap() {
    return this.hardCap.get();
  }
}
