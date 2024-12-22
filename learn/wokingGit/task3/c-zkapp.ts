// task3： 设计一个众筹合约, 时间窗口关闭后被投资人方可提款
// 1. 运用 zkapp-cli 命令行工具初始化工程
// 2. 使用 o1js 设计一个众筹合约，在指定时间窗口间允许任何人投入 MINA，有硬顶
// 3. 时间窗口关闭后被投资人方可提款
// 请提交提供 Jest 本地测试的交互脚本，以及部署到 DevNet 的 tx hash。

import {
  State,
  PublicKey,
  SmartContract,
  state,
  method,
  UInt64,
  Permissions,
  DeployArgs,
  AccountUpdate,
  UInt32,
  Provable,
} from 'o1js';

export class CrowdFundingZkapp extends SmartContract {
  // 硬顶
  @state(UInt64) hardCap = State<UInt64>();
  // 投资人
  @state(PublicKey) investor = State<PublicKey>();
  // 结束时间
  @state(UInt32) endTime = State<UInt32>();
  // 当前发起人

  async deploy(
    props: DeployArgs & {
      investor: PublicKey;
      hardCap: UInt64;
      endTime: UInt32;
    }
  ) {
    await super.deploy(props);

    // 设置目标金额/投资人/结束时间
    this.hardCap.set(props.hardCap);
    this.investor.set(props.investor);
    this.endTime.set(props.endTime);

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
    Provable.log('🐢props', props);
  }

  // 投资
  @method
  async invest(amount: UInt64) {
    // 验证时间窗口
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime);
    const endTime = this.endTime.get();
    this.endTime.requireEquals(endTime);
    const hardCap = this.hardCap.get();
    this.hardCap.requireEquals(hardCap);
    const currentBalance = this.account.balance.get();
    this.account.balance.requireEquals(currentBalance);

    // 检查是否在时间窗口内
    currentTime.lessThanOrEqual(endTime).assertTrue('投资事件已过期');

    // 检查硬顶限制
    currentBalance
      .add(amount)
      .lessThanOrEqual(hardCap)
      .assertTrue('投资金额已到顶');

    // 转账资金到合约账户
    const senderUpdate = AccountUpdate.createSigned(
      this.sender.getAndRequireSignature()
    );
    senderUpdate.send({ to: this, amount });
  }

  // 提现
  @method
  async withdraw() {
    // const currentTime = UInt64.from(Date.now());
    // 验证时间窗口
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime);
    const endTime = this.endTime.get();
    this.endTime.requireEquals(endTime);
    const currentBalance = this.account.balance.get();
    this.account.balance.requireEquals(currentBalance);
    const investor = this.investor.get();
    this.investor.requireEquals(investor);

    // 检查是否在时间窗口之后
    currentTime.greaterThanOrEqual(endTime).assertTrue('时间还没到');

    // 检查是否由发起人调用
    this.sender.getAndRequireSignatureV2().assertEquals(investor);

    // 转账资金到接收方账户
    this.send({ to: investor, amount: currentBalance });
  }
}
