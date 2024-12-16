import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Provable,
  PublicKey,
  UInt32,
  UInt64,
  Poseidon,
  Struct,
  DeployArgs,
  Permissions,
  AccountUpdate,
} from "o1js";

/* 
众筹合约:
可设置众筹目标和截止事件
通过计算最佳数额, 确保不会超额众筹
众筹成功, 项目方可提款
众筹失败, 可以退款

退款功能:
链上状态有限, 尝试不使用Merkle Tree实现众筹失败后退款
设计了一个方法,思路源于递归.
重新计算哈希并验证,fundHash回退为oldHash

不限制调用者身份, 需要publicKey验证, 只向publicKey转账
Dapp可以代为执行

所需信息,通过事件获取

更新: 优化了两个state
补充: num状态也能优化, 为了event信息更详细, 保留了下来

*/

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
  now: UInt32,
}) {}

const minFundAmounts = 1;

export class Crowdfunding extends SmartContract {
  @state(UInt64) targetAmounts = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();
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
      "Deployed",
      new DeployEvent({
        owner: this.sender.getAndRequireSignature(),
        endTime: props.endTime,
        targetAmounts: props.targetAmounts,
        now: this.network.blockchainLength.getAndRequireEquals(),
      })
    );
  }

  @method async fund(amount: UInt64) {
    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertLessThan(endTime, "众筹已结束");

    amount.assertGreaterThanOrEqual(
      UInt64.from(minFundAmounts),
      "至少资助 1 mina"
    );

    const funder = this.sender.getAndRequireSignature();
    const owner = this.owner.getAndRequireEquals();
    funder.equals(owner).assertFalse("项目方不能参与筹款");

    const funderUpdate = AccountUpdate.createSigned(funder);
    const funderBalance = funderUpdate.account.balance.getAndRequireEquals();
    funderBalance.assertGreaterThanOrEqual(amount);

    // 避免超额众筹
    const contractBalance = this.account.balance.getAndRequireEquals();
    const targetAmounts = this.targetAmounts.getAndRequireEquals();
    const fundingGap = targetAmounts.sub(contractBalance);
    const optimalAmount = Provable.if(
      amount.lessThanOrEqual(fundingGap),
      amount,
      fundingGap
    );

    funderUpdate.send({ to: this.address, amount: optimalAmount });

    // 用于广播
    const oldFundHashHash = this.fundHash.getAndRequireEquals();

    // -----更新状态-----
    const newNum = this.num.getAndRequireEquals().add(1);
    this.num.set(newNum);

    // Poseidon.hash([序号, funder公钥, 资助金额, oldFundHashHash]));
    const newFundHash = Poseidon.hash([
      newNum.value,
      funder.x,
      optimalAmount.value,
      oldFundHashHash,
    ]);
    this.fundHash.set(newFundHash);

    this.emitEvent(
      "Funded",
      new FundEvent({
        num: newNum,
        funder: funder,
        amount: optimalAmount,
        oldHash: oldFundHashHash,
        now: currentTime,
      })
    );
  }

  @method async ownerWithdraw() {
    const owner = this.owner.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    sender.equals(owner).assertTrue("只有被投资人可以提款");

    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, "众筹结束前不能提款");

    const balance = this.account.balance.getAndRequireEquals();
    balance.assertGreaterThan(UInt64.zero, "合约余额为0");

    const targetAmounts = this.targetAmounts.getAndRequireEquals();
    balance.equals(targetAmounts).assertTrue("合约余额异常, 不等于目标金额");

    this.send({ to: sender, amount: balance });

    // 广播
    this.emitEvent(
      "OwnerWithdrew",
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
    const endTime = this.endTime.getAndRequireEquals();
    const currentTime = this.network.blockchainLength.getAndRequireEquals();
    currentTime.assertGreaterThanOrEqual(endTime, "众筹未结束");

    const currentAmount = this.account.balance.getAndRequireEquals();
    currentAmount.assertGreaterThan(UInt64.zero, "合约余额为0");

    const targetAmounts = this.targetAmounts.getAndRequireEquals();
    currentAmount.assertLessThan(targetAmounts, "众筹成功, 无需退款");

    const currentNum = this.num.getAndRequireEquals();
    currentNum.assertEquals(num);

    // 验证哈希
    const checkHash = Poseidon.hash([
      num.value,
      funder.x,
      amount.value,
      oldHash,
    ]);
    const fundHash = this.fundHash.getAndRequireEquals();
    fundHash.assertEquals(checkHash);

    // 转账
    this.send({ to: funder, amount: amount });

    // 回退fundHash和num
    this.fundHash.set(oldHash);

    const oldNum = currentNum.sub(1);
    this.num.set(oldNum);

    this.emitEvent(
      "Refunded",
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

  // 若dapp没有统一退款,用户自行退款
  // 用于查询退款进度
  getNum() {
    return this.num.getAndRequireEquals();
  }
}
