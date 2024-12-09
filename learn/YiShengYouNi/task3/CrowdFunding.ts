import { SmartContract, state, State, method, Permissions, PublicKey, UInt64, DeployArgs } from 'o1js';

// 众筹合约
export class Crowdfunding extends SmartContract {
  // 众筹的开始时间和结束时间
  @state(UInt64) startTime = State<UInt64>(UInt64.from(0));
  @state(UInt64) endTime = State<UInt64>(UInt64.from(0));
  // 众筹的硬顶
  @state(UInt64) hardCap = State<UInt64>(UInt64.from(0));
  // 当前已筹集的金额
  @state(UInt64) totalFunds = State<UInt64>(UInt64.from(0));
  // 投资人地址（提款权限）
  @state(PublicKey) beneficiary = State<PublicKey>(PublicKey.empty());

  constructor(publicKey: PublicKey, initialBalance?: UInt64) {
    super(publicKey, initialBalance ? initialBalance.value : UInt64.from(0).value);
  }
  async deploy(options?: DeployArgs) {
    // console.log('deploy called');
    // console.trace('deploy stack trace');
    await super.deploy(options);
  }

  // 初始化众筹合约
  async init() {
    console.log('init called');
    super.init();  // 初始化父类的状态


    if (!this.sender) {
      throw new Error('this.sender is not properly initialized');
    }

    // 设置账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(), // 允许通过 Proof 或 Signature 更新状态
    });

    // 设置开始时间
    const currentSlot = this.network.globalSlotSinceGenesis.get();
    this.network.globalSlotSinceGenesis.requireEquals(currentSlot);
    const currentSlotUInt64 = UInt64.from(currentSlot);
    this.startTime.set(currentSlotUInt64);

    // 设置结束时间(大于开始时间)
    const endTime = currentSlotUInt64.add(UInt64.from(100));
    endTime.assertGreaterThan(currentSlotUInt64);
    this.endTime.set(endTime);

    // 设置硬顶（确保硬顶大于0）
    const initialHardCap = UInt64.from(1000);
    initialHardCap.assertGreaterThan(UInt64.zero); // 确保硬顶大于0
    this.hardCap.set(initialHardCap);

    // 设置初始资金（确保资金为0，非负）
    const initialTotalFunds = UInt64.from(0);
    initialTotalFunds.assertGreaterThanOrEqual(UInt64.from(0));
    this.totalFunds.set(initialTotalFunds);

    // 获取并验证部署者的公钥，并设置为受益人
    const deployerPublicKey = this.sender.getAndRequireSignature();
    this.beneficiary.set(deployerPublicKey); // 设置受益人公钥
    // 在这里添加前置条件，确保部署者的公钥正确
    deployerPublicKey.assertEquals(this.sender.getAndRequireSignature());


  }

  // 设置众筹初始状态（仅允许部署时调用）
  @method
  async configureCrowdfunding(startTime: UInt64, endTime: UInt64, hardCap: UInt64, beneficiary: PublicKey) {
    // 校验参数合法性
    startTime.assertGreaterThan(UInt64.from(0));
    endTime.assertGreaterThan(startTime);
    hardCap.assertGreaterThan(UInt64.from(0));

    this.startTime.set(startTime);
    this.endTime.set(endTime);
    this.hardCap.set(hardCap);
    this.beneficiary.set(beneficiary);
  }

  @method
  async contribute(contributor: PublicKey, amount: UInt64) {
    const currentTime = this.network.timestamp.get();
    this.network.timestamp.requireEquals(currentTime);

    // 检查当前时间是否在众筹窗口内
    const startTime = this.startTime.get();
    this.startTime.requireEquals(this.startTime.get());
    const endTime = this.endTime.get();
    this.endTime.requireEquals(this.endTime.get());

    currentTime.assertGreaterThanOrEqual(startTime);
    currentTime.assertLessThanOrEqual(endTime);

    // 检查硬顶是否未超出
    const currentFunds = this.totalFunds.get();
    this.totalFunds.requireEquals(this.totalFunds.get());

    const hardCap = this.hardCap.get();
    this.hardCap.requireEquals(this.hardCap.get());

    const newTotalFunds = currentFunds.add(amount);
    newTotalFunds.assertLessThanOrEqual(hardCap);

    // 更新总资金
    this.totalFunds.set(newTotalFunds);

    // 模拟扣除资金
    this.send({ to: contributor, amount: UInt64.from(0) });
  }

  // 提款方法
  @method
  async withdraw(beneficiaryKey: PublicKey, amount: UInt64) {
    const currentTime = this.network.timestamp.get();
    this.network.timestamp.requireEquals(currentTime);
    const endTime = this.endTime.get();
    this.endTime.requireEquals(endTime);
    // 仅在时间窗口结束后允许提款
    currentTime.assertGreaterThan(endTime);

    // 仅投资人（受益人）可提款
    const beneficiary = this.beneficiary.get();
    this.beneficiary.requireEquals(beneficiary);
    beneficiaryKey.assertEquals(beneficiary);

    // 更新总资金
    const totalFunds = this.totalFunds.get();
    this.totalFunds.requireEquals(totalFunds);
    this.totalFunds.set(totalFunds.sub(amount));

    // 转账给受益人
    this.send({ to: beneficiaryKey, amount });
  }
}