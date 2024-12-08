import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  Provable,
  PublicKey,
  UInt32,
  UInt64,
  Poseidon,
  Struct,
  DeployArgs,
  Permissions,
  AccountUpdate,
} from 'o1js';

export class DeployEvent extends Struct({
  owner: PublicKey,
  endTime: UInt32,
  targetAmounts: UInt64,
  now: UInt32,
}) {}

export class RefundEvent extends Struct({
  num: UInt64,
  receiver: PublicKey,
  amount: UInt64,
  now: UInt32,
}) {}

export class OwnerWithdrawnEvent extends Struct({
  receiver: PublicKey,
  amount: UInt64,
  now: UInt32,
}) {}

export class FundEvent extends Struct({
  num: UInt64,
  funder: PublicKey,
  amount: UInt64,
  oldHash: Field,
  fundState: Bool,
  now: UInt32,
}) {}

const minFundAmounts = 1;

export class Crowdfunding extends SmartContract {
  @state(UInt64) targetAmounts = State<UInt64>();
  @state(UInt64) currentAmount = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();
  @state(Bool) isSucceed = State<Bool>();
  @state(PublicKey) owner = State<PublicKey>();
  @state(Field) fundHash = State<Field>();
  @state(UInt64) num = State<UInt64>();

  events = {
    Deployed: DeployEvent,
    Funded: FundEvent,
    OwnerWithdrew: OwnerWithdrawnEvent,
    Refunded: RefundEvent,
  };

  async deploy(
    props: DeployArgs & {
      targetAmounts: UInt64;
      endTime: UInt32;
    }
  ) {
    await super.deploy(props);

    this.targetAmounts.set(props.targetAmounts);
    this.endTime.set(props.endTime);
    this.owner.set(this.sender.getAndRequireSignature());

    this.currentAmount.set(UInt64.zero);
    this.isSucceed.set(Bool(false));
    this.num.set(UInt64.zero);
    this.fundHash.set(Field(0));

    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
      editState: Permissions.proofOrSignature(),
    });

    this.emitEvent(
      'Deployed',
      new DeployEvent({
        owner: this.sender.getAndRequireSignature(),
        endTime: props.endTime,
        targetAmounts: props.targetAmounts,
        now: this.network.blockchainLength.getAndRequireEquals(),
      })
    );
  }

  @method async fund(amount: UInt64) {
    this.isSucceed.requireEquals(Bool(false));

    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertLessThan(endTime, '众筹已结束');

    amount.assertGreaterThan(UInt64.from(minFundAmounts), '至少资助 1 mina');

    const funder = this.sender.getAndRequireSignature();
    const owner = this.owner.getAndRequireEquals();
    funder.equals(owner).assertFalse('项目方不能参与筹款');

    const funderUpdate = AccountUpdate.createSigned(funder);
    const funderBalance = funderUpdate.account.balance.getAndRequireEquals();
    funderBalance.assertGreaterThanOrEqual(amount);

    const contractBalance = this.account.balance.getAndRequireEquals();
    const targetAmounts = this.targetAmounts.getAndRequireEquals();
    const fundingGap = targetAmounts.sub(contractBalance);
    const optimalAmount = Provable.if(
      amount.lessThanOrEqual(fundingGap),
      amount,
      fundingGap
    );

    funderUpdate.send({ to: this.address, amount: optimalAmount });

    const newAmount = this.currentAmount
      .getAndRequireEquals()
      .add(optimalAmount);
    this.currentAmount.set(newAmount);

    const newCurrentAmount = this.account.balance.getAndRequireEquals();
    const newFundState = Provable.if(
      newCurrentAmount.equals(targetAmounts),
      Bool(true),
      Bool(false)
    );
    this.isSucceed.set(newFundState);

    const newNum = this.num.getAndRequireEquals().add(1);
    this.num.set(newNum);

    const oldHash = this.fundHash.getAndRequireEquals();

    const newFundHash = Poseidon.hash([
      newNum.value,
      funder.x,
      optimalAmount.value,
      oldHash,
    ]);
    this.fundHash.set(newFundHash);

    this.emitEvent(
      'Funded',
      new FundEvent({
        num: newNum,
        funder: funder,
        amount: optimalAmount,
        oldHash: oldHash,
        fundState: newFundState,
        now: currentTime,
      })
    );
  }

  @method async ownerWithdraw() {
    // this.isSucceed.getAndRequireEquals().assertTrue();

    const owner = this.owner.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    sender.equals(owner).assertTrue('只有被投资人可以提款');

    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, '众筹结束前不能提款');

    const balance = this.account.balance.getAndRequireEquals();
    balance.assertGreaterThan(UInt64.zero, '合约余额为0');

    this.send({ to: sender, amount: balance });

    this.currentAmount.set(UInt64.zero);

    this.emitEvent(
      'OwnerWithdrew',
      new OwnerWithdrawnEvent({
        receiver: sender,
        amount: balance,
        now: currentTime,
      })
    );
  }

  @method async refund(
    num: UInt64,
    funder: PublicKey,
    amount: UInt64,
    oldHash: Field
  ) {
    this.isSucceed.getAndRequireEquals().assertFalse('众筹成功');

    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, '众筹未结束');

    const currentAmount = this.currentAmount.getAndRequireEquals();
    currentAmount.assertGreaterThan(UInt64.zero, '合约余额为0');

    const currentNum = this.num.getAndRequireEquals();
    currentNum.assertEquals(num);

    const checkHash = Poseidon.hash([
      num.value,
      funder.x,
      amount.value,
      oldHash,
    ]);
    const fundHash = this.fundHash.getAndRequireEquals();
    fundHash.assertEquals(checkHash);

    this.send({ to: funder, amount: amount });

    // 回退状态
    const oldCurrentAmount = this.currentAmount.getAndRequireEquals();
    this.currentAmount.set(oldCurrentAmount);

    this.fundHash.set(oldHash);

    const oldNum = currentNum.sub(1);
    this.num.set(oldNum);

    this.emitEvent(
      'Refunded',
      new RefundEvent({
        num: num,
        receiver: funder,
        amount: amount,
        now: currentTime,
      })
    );
  }

  getMinFundAmounts() {
    return minFundAmounts;
  }

  getNum() {
    return this.num.getAndRequireEquals();
  }
}
