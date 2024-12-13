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
  /** 目标金额 */
  @state(UInt64) target = State<UInt64>(new UInt64(0));
  /** 已筹集金额 */
  @state(UInt64) raised = State<UInt64>(new UInt64(0));
  /** 结束时间 */
  @state(UInt32) endBlockHeight = State<UInt32>(new UInt32(0));
  /** 资金接收者 */
  @state(PublicKey) receiver = State<PublicKey>();
  /** 众筹是否关闭 */
  @state(Bool) closed = State<Bool>(Bool(false));

  async deploy(args: DeployArgs & { target: UInt64; endBlockHeight: UInt32; receiver: PublicKey }) {
    await super.deploy(args);
    this.target.set(args.target);
    this.endBlockHeight.set(args.endBlockHeight);
    this.receiver.set(args.receiver);
    this.account.permissions.set({ ...Permissions.default(), editState: Permissions.proofOrSignature() });
  }

  @method async invest(amount: UInt64) {
    const endBlockHeight = this.endBlockHeight.getAndRequireEquals();
    const currentTime = this.network.timestamp.getAndRequireEquals();
    // 检查是否还在窗口期
    this.network.blockchainLength.requireBetween(UInt32.from(0), endBlockHeight);

    const target = this.target.getAndRequireEquals();
    const raised = this.raised.getAndRequireEquals();
    // 检查是否已经筹满
    raised.assertLessThan(target);
    // 资数量必须小于等于余额
    amount.assertLessThanOrEqual(target.sub(raised));

    const donator = this.sender.getAndRequireSignature();
    const donatorUpdate = AccountUpdate.createSigned(donator);
    const donatorBalance = donatorUpdate.account.balance.getAndRequireEquals();
    // 检查账户余额
    donatorBalance.assertGreaterThanOrEqual(amount);

    // 将投资账户的 MINA 转移到合约上
    donatorUpdate.send({ to: this, amount });
    this.raised.set(raised.add(amount));
  }

  @method async withdraw() {
    this.closed.getAndRequireEquals();
    this.closed.requireEquals(Bool(false));

    const endBlockHeight = this.endBlockHeight.getAndRequireEquals();
    const currentBlockHeight = this.network.blockchainLength.getAndRequireEquals();
    // 检查是否超过窗口期
    currentBlockHeight.assertGreaterThan(endBlockHeight);

    const receiver = this.receiver.getAndRequireEquals();
    const sender = this.sender.getAndRequireSignature();
    // 检查领取人是不是设置好的接收人
    receiver.assertEquals(sender);

    const raised = this.raised.getAndRequireEquals();
    // 将筹集到的金额转入接收人账户中
    this.send({ to: receiver, amount: raised });
    this.closed.set(Bool(true));
  }
}
