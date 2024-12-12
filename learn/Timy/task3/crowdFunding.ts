/*
 * @Date: 2024-12-09 11:33:27
 * @LastEditors: TinyScript
 * @LastEditTime: 2024-12-10 19:11:33
 * @FilePath: /sudoku/Users/bzp/tiny/web3/mina-ethsz/contracts/src/crowdFunding/crowdFunding.ts
 */
import { SmartContract, State, UInt32, UInt64, state, PublicKey, DeployArgs, Provable, Permissions, method, AccountUpdate } from "o1js";

export class CrowdFunding extends SmartContract {
  @state(UInt64) totalRaised = State<UInt64>();
  @state(UInt64) fundingCap = State<UInt64>();
  @state(UInt32) endTime = State<UInt32>();
  @state(PublicKey) owner = State<PublicKey>();

  async deploy(
    props: DeployArgs & {
      fundingCap: UInt64;
      endTime: UInt32;
    }
  ) {
    await super.deploy(props);

    // 初始化总捐款金额
    this.totalRaised.set(UInt64.zero);
    // 初始化筹集资金上限
    this.fundingCap.set(props.fundingCap);
    // 初始化众筹结束时间
    this.endTime.set(props.endTime);
    // 初始化合约所有者
    this.owner.set(this.sender.getUnconstrainedV2());
    Provable.log('props.fundingCap is', props.fundingCap);
    Provable.log('props.endTime is', props.endTime);
    Provable.log('owner is', this.sender.getUnconstrainedV2())

    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible()
    })
  }

  // 捐赠
  @method async contribute(amount: UInt64) {
    // 金额大于0
    amount.assertGreaterThan(UInt64.zero);

    // 获取当前链的时间
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime);

    // 获取剩余时间
    const fundingEndTime = this.endTime.getAndRequireEquals();
    currentTime.assertLessThanOrEqual(
      fundingEndTime,
      '众筹已结束'
    )

    // 获取当前已筹金额
    const currentRaised = this.totalRaised.getAndRequireEquals();
    // 获取众筹目标金额
    const fundingCap = this.fundingCap.getAndRequireEquals();
    // 剩余金额
    const remaining = fundingCap.sub(currentRaised);
    remaining.assertGreaterThan(UInt64.zero);

    // 判断当前的众筹金额是否超过目标金额，取剩余的金额
    const contribution = Provable.if(
      amount.lessThanOrEqual(remaining),
      amount,
      remaining
    )

    // 获取发件人的余额信息
    const senderAccountUpdate = AccountUpdate.create(this.sender.getUnconstrainedV2());    
    const senderBalance = senderAccountUpdate.account.balance.get();

    // 验证发件人的余额是否足够
    senderBalance.assertGreaterThanOrEqual(
      contribution,
      '发件人余额不足'
    );

    const updateSender = AccountUpdate.createSigned(
      this.sender.getAndRequireSignatureV2()
    );

    // 发件人扣款，将金额扣到合约账户中
    updateSender.send({ to: this.address, amount: contribution });

    // 更新已筹金额
    const newRaised = currentRaised.add(contribution);
    this.totalRaised.set(newRaised);
  }

  // 众筹发起人提现
  @method async withdraw(receiver: PublicKey) {
    // 获取当前账户余额
    const currentBalance = this.account.balance.getAndRequireEquals();
    // 余额是否大于0
    currentBalance.assertGreaterThan(UInt64.zero);

    // 获取合约所有者信息
    const owner = this.owner.getAndRequireEquals();
    // 获取当前发件人信息
    const senderPublicKey = this.sender.getAndRequireSignatureV2();
    // 判断发件人是否为合约所有者
    senderPublicKey.assertEquals(owner);

    // 获取当前发件时间
    const currentTime = this.network.blockchainLength.get();
    this.network.blockchainLength.requireEquals(currentTime)

    // 获取众筹结束时间
    const fundingEndTime = this.endTime.getAndRequireEquals();

    currentTime.assertGreaterThanOrEqual(
      fundingEndTime,
      '众筹正在进行中'
    )

    // 向目标发送众筹已筹集的金额
    this.send({ to: receiver, amount: currentBalance });
  }
}