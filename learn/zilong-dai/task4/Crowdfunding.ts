import {
    SmartContract,
    Permissions,
    state,
    State,
    method,
    DeployArgs,
    UInt64,
    AccountUpdate,
    PublicKey,
    UInt32,
    Bool,
  } from 'o1js';
  
  export const MINA = 1e9;
  export class Crowdfunding extends SmartContract {
  
    @state(UInt64) goal = State<UInt64>(new UInt64(0));
  
    @state(UInt32) endAt = State<UInt32>(new UInt32(0));
  
    @state(Bool) claimed = State<Bool>(Bool(false));
  
    async deploy(args: DeployArgs & { goal: UInt64; endAt: UInt32 }) {
      await super.deploy(args);
      this.goal.set(args.goal);
      this.endAt.set(args.endAt);
      this.account.permissions.set({
        ...Permissions.default(),
        send: Permissions.proof(),
        setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
        setPermissions: Permissions.impossible(),
      });
    }
  
    @method async pledge(amount: UInt64) {
      const endAt = this.endAt.getAndRequireEquals();
        
      this.network.blockchainLength.requireBetween(UInt32.from(0), endAt);
  
      const goal = this.goal.getAndRequireEquals();
      const balance = this.account.balance.getAndRequireEquals();
  
      balance.assertLessThan(goal, 'fulled');
  
      amount.assertLessThanOrEqual(goal.sub(balance));
  
      const pledgee = this.sender.getAndRequireSignature();
  
      AccountUpdate.createSigned(pledgee).send({ to: this, amount });
    }
  
    @method async claim(reciver: PublicKey) {
      const claimed = this.claimed.getAndRequireEquals();
      claimed.assertFalse('claimed');
  
      const endAt = this.endAt.getAndRequireEquals();
      const currentBlockHeight = this.network.blockchainLength.getAndRequireEquals();
      currentBlockHeight.assertGreaterThan(endAt, 'No ended');
  
      const recieverAcctUpt = AccountUpdate.createSigned(reciver);
      recieverAcctUpt.account.isNew.requireEquals(Bool(true));
  
      const balance = this.account.balance.getAndRequireEquals();
      const item = balance.div(10);
  
      this.send({ to: recieverAcctUpt, amount: balance });
  
      recieverAcctUpt.account.timing.set({
        initialMinimumBalance: item.mul(8),
        cliffTime: UInt32.from(0),
        cliffAmount: UInt64.from(0),
        vestingPeriod: UInt32.from(200),
        vestingIncrement: item,
      });
  
      this.claimed.set(Bool(true));
    }
  }