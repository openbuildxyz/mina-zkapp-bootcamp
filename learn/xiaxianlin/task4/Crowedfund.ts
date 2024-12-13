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
  Provable,
} from 'o1js';
export const MINA = 1e9;
export class Crowedfund extends SmartContract {
  /** 目标金额 */
  @state(UInt64) goal = State<UInt64>(new UInt64(0));
  /** 结束时间 */
  @state(UInt32) endAt = State<UInt32>(new UInt32(0));
  /** 众筹是否关闭 */
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
    // 检查是否还在窗口期
    this.network.blockchainLength.requireBetween(UInt32.from(0), endAt);

    const goal = this.goal.getAndRequireEquals();
    const balance = this.account.balance.getAndRequireEquals();
    // 检查是否已经筹满
    balance.assertLessThan(goal, 'fulled');
    // 资数量必须小于等于余额
    amount.assertLessThanOrEqual(goal.sub(balance));

    const pledgee = this.sender.getAndRequireSignature();
    // 将投资账户的 MINA 转移到合约上
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
