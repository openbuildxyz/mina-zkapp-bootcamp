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
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  // 投入mina函数
  @method async investMinas(minas: UInt64) {
    const _endBlockHeight = this.endBlockHeight.get();
    this.endBlockHeight.requireEquals(_endBlockHeight);
    // 检查当前区块高度是否还在规定的时间窗口内
    this.network.blockchainLength.requireBetween(UInt32.from(0), _endBlockHeight);

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
    investorUpdate.send({ to: this, amount: minas});
    _totalRaised.add(minas);
    
  }

  // 提取众筹结束后的Mina
  @method async withdrawMinas() {
    const _endBlockHeight = this.endBlockHeight.get();
    this.endBlockHeight.requireEquals(_endBlockHeight);
    const _currentBlockHeight = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(_currentBlockHeight);
    _currentBlockHeight.assertGreaterThan(_endBlockHeight); // 检查时间窗口是否关闭

    // 验证众筹者
    const _crowdfunder = this.crowdfunder.get();
    this.crowdfunder.requireEquals(_crowdfunder);
    const sender = this.sender.getAndRequireSignatureV2();
    _crowdfunder.assertEquals(sender);

    // 提取Mina！
    const _totalRaised = this.totalRaised.get();
    this.totalRaised.requireEquals(_totalRaised);
    this.send({ to: _crowdfunder, amount: _totalRaised});
  }
}
