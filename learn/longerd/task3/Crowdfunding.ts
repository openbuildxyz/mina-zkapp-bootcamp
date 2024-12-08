import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    PublicKey, 
    Provable, 
    UInt64,
    AccountUpdate
  } from 'o1js';
  
  export class Crowdfunding extends SmartContract {
    @state(PublicKey) beneficiary = State<PublicKey>(); 

    @state(UInt64) startTime = State<UInt64>(); 

    @state(UInt64) endTime = State<UInt64>();    

    @state(Field) targetAmount = State<Field>();  
    
    @state(Field) currentAmount = State<Field>(); 

    @state(Field) hardCap = State<Field>();       
    
    init() {
      super.init();
      this.beneficiary.set(this.sender.getAndRequireSignature());
      this.currentAmount.set(Field(0));
    }
  
    @method initializeCrowdfunding(
      startTime: UInt64,
      endTime: UInt64, 
      targetAmount: Field,
      hardCap: Field
    ) {
      const beneficiary = this.beneficiary.getAndRequireEquals();
      this.sender.getAndRequireSignature().equals(beneficiary)
        .assertTrue('Only beneficiary can initialize');
      
      startTime.lessThan(endTime).assertTrue('Start time must be before end time');
      
      targetAmount.lessThan(hardCap).assertTrue('Target amount must be less than hard cap');
  
      this.startTime.set(startTime);
      this.endTime.set(endTime);
      this.targetAmount.set(targetAmount);
      this.hardCap.set(hardCap);
    }
  
    @method contribute(amount: Field) {
      const currentTime = this.network.timestamp.getAndRequireEquals();
      const startTime = this.startTime.getAndRequireEquals();
      const endTime = this.endTime.getAndRequireEquals();
      const currentAmount = this.currentAmount.getAndRequireEquals();
      const hardCap = this.hardCap.getAndRequireEquals();
  
      currentTime.greaterThanOrEqual(startTime).assertTrue('Crowdfunding not started');
      currentTime.lessThanOrEqual(endTime).assertTrue('Crowdfunding ended');
  
      currentAmount.add(amount).lessThanOrEqual(hardCap)
        .assertTrue('Exceeds hard cap');
  
      const payerUpdate = AccountUpdate.createSigned(this.sender);
      payerUpdate.send({ to: this, amount: Number(amount.toString()) });
  
      this.currentAmount.set(currentAmount.add(amount));
    }
  
    @method withdraw() {
      const currentTime = this.network.timestamp.getAndRequireEquals();
      const endTime = this.endTime.getAndRequireEquals();
      const beneficiary = this.beneficiary.getAndRequireEquals();
      const currentAmount = this.currentAmount.getAndRequireEquals();
      const targetAmount = this.targetAmount.getAndRequireEquals();
  
      currentTime.greaterThan(endTime).assertTrue('Crowdfunding not ended');
      
      currentAmount.greaterThanOrEqual(targetAmount)
        .assertTrue('Target amount not reached');
  
      this.sender.getAndRequireSignature().equals(beneficiary)
        .assertTrue('Only beneficiary can withdraw');
  
      const contractBalance = AccountUpdate.createSigned(this.address);
      contractBalance.send({ to: beneficiary, amount: Number(currentAmount.toString()) });
  
      this.currentAmount.set(Field(0));
    }
  
    @method refund() {
      const currentTime = this.network.timestamp.getAndRequireEquals();
      const endTime = this.endTime.getAndRequireEquals();
      const currentAmount = this.currentAmount.getAndRequireEquals();
      const targetAmount = this.targetAmount.getAndRequireEquals();
  

      currentTime.greaterThan(endTime).assertTrue('Crowdfunding not ended');

      currentAmount.lessThan(targetAmount)
        .assertTrue('Target amount reached, cannot refund');
  
    }
  }