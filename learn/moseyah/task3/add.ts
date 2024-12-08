import { 
  AccountUpdate,
  method,
  Permissions, 
  Provable, 
  PublicKey, 
  SmartContract, 
  state, 
  State, 
  UInt32, 
  UInt64, 
  type DeployArgs 
} from 'o1js';

export class Add extends SmartContract {
  // State variables for contract parameters
  @state(UInt64) hardcapAmount = State<UInt64>();
  @state(UInt32) contractEndTime = State<UInt32>();
  @state(PublicKey) beneficiaryAddress = State<PublicKey>();

  // Validate contract state and constraints before operations
  private validateContractState() {
    // Retrieve current contract state
    const hardcap = this.hardcapAmount.getAndRequireEquals();
    const endTime = this.contractEndTime.getAndRequireEquals();
    const beneficiary = this.beneficiaryAddress.getAndRequireEquals();
    const currentContractBalance = this.account.balance.getAndRequireEquals();
    const currentBlockchainTime = this.network.blockchainLength.getAndRequireEquals();

    // Enforce time constraint: contract must not be expired
    currentBlockchainTime.greaterThan(endTime).assertFalse("Contract has expired");
    
    // Enforce funding constraint: balance must not exceed hardcap
    currentContractBalance.greaterThan(hardcap).assertFalse("Hardcap limit reached");

    return { 
      hardcap, 
      endTime, 
      beneficiary, 
      currentContractBalance 
    };
  }

  // Deploy contract with specific parameters
  async deploy(args: DeployArgs & {
    receiver: PublicKey, 
    hardtop: UInt64, 
    endtime: UInt32
  }) {
    await super.deploy(args);

    // Set strict permissions to prevent modifications
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });

    // Initialize contract state
    this.beneficiaryAddress.set(args.receiver);
    this.hardcapAmount.set(args.hardtop);
    this.contractEndTime.set(args.endtime);
  }

  // Fund the contract with a specified amount
  @method async fund(amount: UInt64) {
    this.validateContractState();
    
    const hardcap = this.hardcapAmount.getAndRequireEquals();
    const currentContractBalance = this.account.balance.getAndRequireEquals();
    
    // Calculate remaining fundable amount
    const remainingFundableAmount = hardcap.sub(currentContractBalance);
    
    // Determine actual funding amount (limited by remaining space)
    const actualFundingAmount = Provable.if(
      remainingFundableAmount.greaterThanOrEqual(amount),
      amount,
      remainingFundableAmount
    );

    // Create and sign account update for funding
    const senderAccountUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
    senderAccountUpdate.send({ to: this, amount: actualFundingAmount });
  }

  // Withdraw funds from the contract
  @method async withdraw() {
    const { beneficiary, currentContractBalance } = this.validateContractState();

    // Ensure withdrawal is performed by the beneficiary
    this.sender.getAndRequireSignature().assertEquals(beneficiary);
    
    // Transfer entire contract balance to beneficiary
    this.send({ to: beneficiary, amount: currentContractBalance });
  }
}
