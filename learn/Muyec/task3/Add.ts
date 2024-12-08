import { 
  AccountUpdate,
  method,
  Permissions, 
  Provable, 
  PublicKey, 
  SmartContract, 
  state, 
  State, 
  UInt32, 
  UInt64, 
  type DeployArgs 
} from 'o1js';

export class Add extends SmartContract {
[x: string]: any;
@state(UInt64) hardtop = State<UInt64>();
@state(UInt32) endtime = State<UInt32>();
@state(PublicKey) receiver = State<PublicKey>();

  //校验状态
private preCond() {
  //硬顶
  const hardtop = this.hardtop.getAndRequireEquals();
  //结束时间
  const endtime = this.endtime.getAndRequireEquals();
  //接收者
  const receiver = this.receiver.getAndRequireEquals();
  //当前合约余额
  const curBalance = this.account.balance.getAndRequireEquals();
  //时间
  const curTime = this.network.blockchainLength.getAndRequireEquals();

  //过时
  curTime.greaterThan(endtime).assertFalse("time end");
  //硬顶
  curBalance.greaterThan(hardtop).assertFalse("upper limit is reached...");

  return { hardtop, endtime, receiver, curBalance,}
}

  //受益人地址、硬顶金额和结束时间。
async deploy(args: DeployArgs & {receiver: PublicKey, hardtop: UInt64, endtime: UInt32}) {
  await super.deploy(args);

  this.account.permissions.set({
    ...Permissions.default(),
    setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
    setPermissions: Permissions.impossible(),
  })

  this.receiver.set(args.receiver);
  this.hardtop.set(args.hardtop);
  this.endtime.set(args.endtime);
}

//投资
@method async fund(amount: UInt64) {
  this.preCond();
  const hardcap = this.hardtop.getAndRequireEquals();
  const curBalance = this.account.balance.getAndRequireEquals();
  const fund = hardcap.sub(curBalance);
  //只收取最大可收取金额
  const realfund = Provable.if(
    fund.greaterThanOrEqual(amount),
    amount,
    fund
  );
  const senderUpdate = AccountUpdate.createSigned(this.sender.getAndRequireSignature());
  senderUpdate.send({ to: this, amount: realfund })
}

//取钱
@method async withdraw() {
  const { receiver, curBalance } = this.preCond();

  this.sender.getAndRequireSignature().assertEquals(receiver);
  this.send({ to: receiver, amount: curBalance })
}
}