import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  UInt64,
  Permissions,
} from 'o1js';

export class Crowdfunding extends SmartContract {
  // 众筹目标金额
  @state(UInt64) targetAmount = State<UInt64>();
  // 当前募集金额
  @state(UInt64) currentAmount = State<UInt64>();
  // 众筹结束时间
  @state(UInt64) endTime = State<UInt64>();
  // 受益人地址
  @state(PublicKey) beneficiary = State<PublicKey>();

  init() {
    super.init();
    // 设置合约账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      receive: Permissions.proof(),
    });
    
    this.targetAmount.set(UInt64.from(1000000000)); // 设置目标金额为1000 MINA
    this.currentAmount.set(UInt64.from(0));
    this.endTime.set(UInt64.from(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7天后结束
    this.beneficiary.set(this.sender); // 设置部署者为受益人
  }

  @method contribute() {
    // 获取当前状态
    const currentTime = UInt64.from(Date.now());
    const endTime = this.endTime.get();
    const currentAmount = this.currentAmount.get();
    const targetAmount = this.targetAmount.get();

    // 检查是否在众筹时间内
    currentTime.assertLessThan(endTime);
    
    // 更新当前金额
    const newAmount = currentAmount.add(UInt64.from(this.network.amount));
    newAmount.assertLessThanOrEqual(targetAmount);
    
    this.currentAmount.set(newAmount);
  }

  @method withdraw() {
    // 获取当前状态
    const currentTime = UInt64.from(Date.now());
    const endTime = this.endTime.get();
    const currentAmount = this.currentAmount.get();
    const beneficiary = this.beneficiary.get();

    // 检查是否已过众筹结束时间
    endTime.assertLessThanOrEqual(currentTime);
    
    // 检查调用者是否为受益人
    this.sender.assertEquals(beneficiary);

    // 转账给受益人
    this.send({ to: beneficiary, amount: currentAmount });
    
    // 重置当前金额
    this.currentAmount.set(UInt64.from(0));
  }
} 