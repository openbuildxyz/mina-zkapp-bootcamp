import {
  DeployArgs,
  PublicKey,
  Permissions,
  SmartContract,
  State,
  state,
  UInt32,
  UInt64,
  method,
  AccountUpdate,
} from 'o1js';

export class CrowdFundContract extends SmartContract {
  // 链上状态变量
  @state(UInt64) hardCap = State<UInt64>();
  @state(UInt32) endBlockHeight = State<UInt32>();
  @state(PublicKey) crowdfunder = State<PublicKey>();
  @state(UInt64) totalRaised = State<UInt64>();

  async deploy(
    props: DeployArgs & {
      hardCap: UInt64;
      endBlockHeight: UInt32;
      crowdfunder: PublicKey;
    }
  ) {
    await super.deploy(props);

    // 初始化链上状态变量
    this.hardCap.set(props.hardCap);
    this.endBlockHeight.set(props.endBlockHeight);
    this.crowdfunder.set(props.crowdfunder);
    this.totalRaised.set(UInt64.from(0)); // 初始化总筹款数为0

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  // 投入mina函数
  @method async investMinas(minas: UInt64) {
    const _endBlockHeight = this.endBlockHeight.get();
    this.endBlockHeight.requireEquals(_endBlockHeight);
    // 检查当前区块高度是否还在规定的时间窗口内
    this.network.blockchainLength.requireBetween(
      UInt32.from(0),
      _endBlockHeight
    );

    const _hardCap = this.hardCap.get();
    const _totalRaised = this.totalRaised.get();
    this.hardCap.requireEquals(_hardCap);
    this.totalRaised.requireEquals(_totalRaised);
    // 检查筹集的资金是否达到硬顶
    _totalRaised.assertLessThan(_hardCap);

    // 投资金额不能使得众筹资金超过硬顶
    _totalRaised.add(minas).assertLessThanOrEqual(_hardCap);

    // 投资者
    const investor = this.sender.getAndRequireSignatureV2();
    const investorUpdate = AccountUpdate.createSigned(investor);
    const investorBalance = investorUpdate.account.balance.getAndRequireEquals();
    investorBalance.assertGreaterThanOrEqual(minas); // 投资者的账户余额必须大于等于投资金额

    // 投资者将mina投入到合约账户
    investorUpdate.send({ to: this, amount: minas });
    this.totalRaised.set(_totalRaised.add(minas));
  }

  // 时间窗口关闭后众筹资金须按照以下 vesting 计划逐步释放： 
  // 提款人可以立即提走20%，而后每200个区块释放10%直至释放完毕
  @method async vestingSchedule() {
    // 众筹者
    const _crowdfunder = this.crowdfunder.getAndRequireEquals();
    const crowdfunderUpdate = AccountUpdate.createSigned(_crowdfunder);

    const _totalRaised = this.totalRaised.get();
    this.totalRaised.requireEquals(_totalRaised);

    // 立即提取 20% 的众筹资金
    const immediateRelease = _totalRaised.mul(UInt64.from(20)).div(UInt64.from(100));
    this.send({ to: _crowdfunder, amount: immediateRelease });
 
    // 锁定80%的众筹资金
    const tokensToLock = _totalRaised.mul(UInt64.from(80)).div(UInt64.from(100));

    // 释放众筹资金的间隔时间（200slots）
    const vestingPeriod = UInt32.from(200);

    // 每200slots释放资金的数量
    const vestingIncrement = tokensToLock.div(UInt64.from(12));

    // 资金释放计划
    crowdfunderUpdate.account.timing.set({
      initialMinimumBalance: tokensToLock,
      cliffTime: UInt32.from(0),
      cliffAmount: UInt64.from(0),
      vestingPeriod: vestingPeriod,
      vestingIncrement: vestingIncrement,
    });

    // 执行计划
    this.send({ to: crowdfunderUpdate, amount: tokensToLock });
  }
}
