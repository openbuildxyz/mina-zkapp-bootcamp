import {
  DeployArgs,
  method,
  PublicKey,
  Permissions,
  SmartContract,
  State,
  state,
  UInt32,
  UInt64,
  AccountUpdate,
} from 'o1js';
import { JusToken } from './JusToken.js';

export class CrowdFundContractV2 extends SmartContract {
  // 链上状态变量
  @state(UInt64) hardCap = State<UInt64>(); // 硬顶
  @state(UInt32) endBlockHeight = State<UInt32>(); // 众筹结束时间（区块高度）
  @state(PublicKey) crowdfunder = State<PublicKey>(); // 众筹发起人地址
  @state(UInt64) totalRaised = State<UInt64>(); // 已筹集金额
  @state(UInt64) tokenPrice = State<UInt64>(); // 每个 Token 的价格（单位是小数）
  @state(PublicKey) justoken = State<PublicKey>();

  static JusTokenContract: new (...args: any) => JusToken = JusToken;
  private async preCon() {
    const justoken = this.justoken.getAndRequireEquals();

    const justokenContract = new CrowdFundContractV2.JusTokenContract(justoken);

    return { justokenContract };
  }

  // 部署合约
  async deploy(
    props: DeployArgs & {
      hardCap: UInt64;
      endBlockHeight: UInt32;
      crowdFunder: PublicKey;
      tokenPrice: UInt64;
    }
  ) {
    await super.deploy(props);

    // 初始化链上状态变量
    this.hardCap.set(props.hardCap);
    this.endBlockHeight.set(props.endBlockHeight);
    this.crowdfunder.set(props.crowdFunder);
    this.totalRaised.set(UInt64.from(0)); // 初始化总筹款数为0
    this.tokenPrice.set(props.tokenPrice);

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  // 购买 Token
  @method
  async buyTokens(amount: UInt64) {
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

    // 计算此次购买的总额
    const purchaseAmout = amount.mul(
      await this.tokenPrice.getAndRequireEquals()
    );

    // 购买金额不能使得众筹资金超过硬顶
    _totalRaised.add(purchaseAmout).assertLessThanOrEqual(_hardCap);

    // 购买者
    const buyer = this.sender.getAndRequireSignatureV2();
    const buyerUpdate = AccountUpdate.createSigned(buyer);
    const buyerBalance = buyerUpdate.account.balance.getAndRequireEquals();
    buyerBalance.assertGreaterThanOrEqual(purchaseAmout);

    // 购买者将$MINA转入到合约账户
    buyerUpdate.send({ to: this, amount: purchaseAmout });
    this.totalRaised.set(_totalRaised.add(purchaseAmout));

    // 给用户转账Token
    const { justokenContract } = await this.preCon();
    await justokenContract.transfer(this.address, buyer, amount);
  }

  // 提取众筹资金
  @method
  async withDrawMinas() {
    // 获取合约中的众筹发起人地址
    const _crowdfunder = this.crowdfunder.get();
    this.crowdfunder.requireEquals(_crowdfunder);

    // 只有众筹发起人才能提取资金
    const sender = this.sender.getAndRequireSignatureV2();
    _crowdfunder.assertEquals(sender);

    // 确保当前区块高度超过众筹结束区块高度
    const _endBlockHeight = this.endBlockHeight.getAndRequireEquals();
    const _currentBlockHeight = this.network.blockchainLength.getAndRequireEquals();
    _currentBlockHeight.assertGreaterThanOrEqual(_endBlockHeight);

    // 获取当前已筹集的资金
    const _totalRaised = this.totalRaised.get();
    this.totalRaised.requireEquals(_totalRaised);

    // 如果没有筹集到任何资金，拒绝提取
    _totalRaised.assertGreaterThan(UInt64.from(0));

    // 将合约中的资金转移到众筹发起人账户
    const crowdfunder = this.crowdfunder.get();
    const crowdfunderUpdate = AccountUpdate.createSigned(crowdfunder);
    crowdfunderUpdate.send({ to: crowdfunder, amount: _totalRaised });

    // 清空合约中的已筹集资金
    this.totalRaised.set(UInt64.from(0));
  }
}
