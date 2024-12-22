import {
    AccountUpdate,
    DeployArgs,
    Field,
    method,
    Permissions,
    PublicKey,
    SmartContract,
    state,
    State,
    UInt32,
    UInt64
  } from 'o1js';
  
  export class CrowdFunding extends SmartContract {
  
    @state(UInt64) targetAmount = State<UInt64>();
    @state(PublicKey) owner = State<PublicKey>();
    @state(UInt32) endTime = State<UInt32>();
  
    async deploy(args: DeployArgs & { endTime: UInt32; targetAmount: UInt64; owner: PublicKey }) {
      await super.deploy(args);
      this.account.permissions.set({
        ...Permissions.default(),
        send: Permissions.proofOrSignature(),
        setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
        setPermissions: Permissions.impossible(),
      });
  
      this.owner.set(args.owner);
      this.endTime.set(args.endTime);
      this.targetAmount.set(args.targetAmount);
  
    }
  
    @method async fund(amountPrice: UInt64) {
      const nowTime = this.network.blockchainLength.getAndRequireEquals();
      const endTime = this.endTime.getAndRequireEquals();
      nowTime.assertLessThan(endTime, "Fund is end");
  
      const sender = this.sender.getAndRequireSignature();
  
      const senderUpdate = AccountUpdate.createSigned(sender);
      const receiverAcctUpt = senderUpdate.send({ to: this.address, amount: amountPrice });
  
      receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;// MUST ADD THIS!
    }
  
  
    @method async withdrawToken() {
      const owner = this.owner.getAndRequireEquals();
      const nowSender = this.sender.getAndRequireSignature();
      owner.equals(nowSender).assertTrue("Only owner can withdraw");
  
      const nowTime = this.network.blockchainLength.getAndRequireEquals();
      const endTime = this.endTime.getAndRequireEquals();
      nowTime.assertGreaterThanOrEqual(endTime, "Fund is not end");
  
      const nowAmount = this.account.balance.getAndRequireEquals();
  
      const receiverAcctUpt = this.send({ to: owner, amount: nowAmount });
      receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;// MUST ADD THIS!
  
    }
  
    getBalance(tokenId?: Field) {
      const senderUpdate = AccountUpdate.create(this.address, tokenId);
      return senderUpdate.account.balance.get();
    }
  
    getOwner() {
      return this.owner.get();
    }
  }