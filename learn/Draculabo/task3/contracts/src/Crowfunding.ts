import {
  Field,
  State,
  PublicKey,
  SmartContract,
  state,
  method,
  UInt64,
  Permissions,
  DeployArgs,
  AccountUpdate,
  Bool,
  UInt32,
  Struct,
  Provable,
} from 'o1js';

class FundingEvent extends Struct({
  type: Field,
  amount: UInt64,
}) {}

interface IFudingState {
  beneficiary: State<PublicKey>;
  fundingCap: State<UInt64>;
  fundingDeadline: State<UInt32>;
}

const PARTICIPATE = Field(1);
const WITHDRAW = Field(2);
const checkContractStatus = (operationType: Field, errMsg: string) => {
  return function <T extends SmartContract & IFudingState>(
    _1: T,
    _2: string,
    desc: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = desc.value;

    desc.value = function (this: T, ...args: any[]) {
      const fundingDeadline = this.fundingDeadline.getAndRequireEquals(); // 结束时间
      const fundingCap = this.fundingCap.getAndRequireEquals(); // 硬顶金额
      const currentBalance = this.account.balance.getAndRequireEquals(); // 当前余额
      const now = this.network.blockchainLength.getAndRequireEquals(); // 当前时间
      const isTargetReached = currentBalance.greaterThanOrEqual(fundingCap); // 是否达到硬顶
      const isDeadline = now.greaterThanOrEqual(fundingDeadline); // 是否结束
      // 合并硬顶和时间条件
      const condition = isTargetReached.or(isDeadline);

      // 验证操作条件：
      // 1. 如果是投资操作(PARTICIPATE)，要求未达到硬顶且未结束
      // 2. 如果是提现操作(WITHDRAW)，要求已达到硬顶或已结束
      operationType
        .equals(PARTICIPATE)
        .and(condition.not())
        .or(operationType.equals(WITHDRAW).and(condition))
        .assertTrue(errMsg);
      return originalMethod.apply(this, args);
    };

    return desc;
  };
};

const checkBeneficiary = (
  operationType: Field,
  errMsg = 'Only beneficiary can withdraw'
) => {
  // 返回装饰器函数
  return function <T extends SmartContract & IFudingState>(
    _1: T,
    _2: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: T, ...args: any[]) {
      // 如果是提现操作，验证调用者是否为受益人
      // 如果不是提现操作，则直接返回true
      Provable.if(
        operationType.equals(WITHDRAW),
        this.sender
          .getAndRequireSignature()
          .equals(this.beneficiary.getAndRequireEquals()),
        Bool(true)
      ).assertTrue(errMsg);

      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
};
function formatMina(amount: UInt64): string {
  return (Number(amount.toBigInt()) / 1e9).toFixed(2);
}
export class CrowdfundingContract
  extends SmartContract
  implements IFudingState
{
  // 受益人的公钥地址
  @state(PublicKey) beneficiary = State<PublicKey>();
  // 众筹的最大募资额（硬顶）
  @state(UInt64) fundingCap = State<UInt64>();
  // 众筹结束时间
  @state(UInt32) fundingDeadline = State<UInt32>();

  events = {
    funding: FundingEvent,
  };

  async deploy(
    args: DeployArgs & {
      beneficiary: PublicKey;
      fundingCap: UInt64;
      deadline: UInt32;
    }
  ) {
    await super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      // 禁止更改验证密钥
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      // 禁止更改权限
      setPermissions: Permissions.impossible(),
    });

    // 初始化合约状态变量
    this.beneficiary.set(args.beneficiary);
    this.fundingCap.set(args.fundingCap);
    this.fundingDeadline.set(args.deadline);
  }

  @method
  @checkContractStatus(PARTICIPATE, 'participate error')
  async participate(amount: UInt64) {
    // 确保投资金额大于0
    amount.assertGreaterThan(UInt64.from(0));
    // 确保投资金额小于等于硬顶
    amount.assertLessThanOrEqual(this.fundingCap.getAndRequireEquals());

    const fundingCap = this.fundingCap.getAndRequireEquals();
    const currentBalance = this.account.balance.getAndRequireEquals();
    // 计算距离硬顶还差多少
    const remainingToFundingCap = fundingCap.sub(currentBalance);
    // 计算实际接受的投资金额（如果投资金额超过剩余额度，则只接受剩余额度）
    const acceptedAmount = Provable.if(
      amount.lessThanOrEqual(remainingToFundingCap),
      amount,
      remainingToFundingCap
    );

    // 获取发送者的公钥并验证签名
    const senderPublicKey = this.sender.getAndRequireSignature();
    // 创建并执行转账操作
    AccountUpdate.createSigned(senderPublicKey).send({
      to: this.address,
      amount: acceptedAmount,
    });
    this.emitEvent(
      'funding',
      new FundingEvent({
        type: PARTICIPATE,
        amount: acceptedAmount,
      })
    );
  }

  @method
  @checkBeneficiary(WITHDRAW, 'only beneficiary can withdraw') // 检查调用者是否为受益人
  @checkContractStatus(WITHDRAW, 'withdraw error') // 检查是否可以提现
  async withdraw() {
    const beneficiary = this.beneficiary.getAndRequireEquals();
    const currentBalance = this.account.balance.getAndRequireEquals();
    this.send({ to: beneficiary, amount: currentBalance });
    this.emitEvent(
      'funding',
      new FundingEvent({
        type: WITHDRAW,
        amount: currentBalance,
      })
    );
  }
}
