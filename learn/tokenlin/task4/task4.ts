import {
  Field,
  state,
  State,
  method,
  UInt64,
  PrivateKey,
  SmartContract,
  Mina,
  AccountUpdate,
  Bool,
  PublicKey,
  DeployArgs,
  Permissions,
  UInt32
} from 'o1js';




// 在项目入口文件顶部导入
import * as dotenv from 'dotenv';
dotenv.config();
// 读取环境变量
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_ZKAPP = process.env.PRIVATE_KEY_ZKAPP_TASK4;
const PRIVATE_KEY_PRIVILEGED_ACCT = process.env.PRIVATE_KEY_PRIVILEGED_ACCT_TASK4;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in .env file');
}
if (!PRIVATE_KEY_ZKAPP) {
  throw new Error('PRIVATE_KEY_ZKAPP is not defined in .env file');
}
if (!PRIVATE_KEY_PRIVILEGED_ACCT) {
  throw new Error('PRIVATE_KEY_PRIVILEGED_ACCT is not defined in .env file');
}
// console.log("PRIVATE_KEY, " + PRIVATE_KEY);



const privilegedAcct = Mina.TestPublicKey(
  PrivateKey.fromBase58(PRIVATE_KEY_PRIVILEGED_ACCT)
);


let initialState_deadlineBlockHeight = new UInt32(376620);
let initialState_targetAmount = new UInt64(2e9);
let initialState_receivedAmount = new UInt64(0);
export class Donate extends SmartContract {

  @state(UInt32) deadlineBlockHeight = State<UInt32>(initialState_deadlineBlockHeight);
  @state(UInt64) targetAmount = State<UInt64>(initialState_targetAmount);
  @state(UInt64) receivedAmount = State<UInt64>(initialState_receivedAmount);
  @state(PublicKey) privileged = State<PublicKey>(privilegedAcct);

  events = { update: Field, payout: UInt64, payoutReceiver: PublicKey };

  async deploy(props?: DeployArgs) {
    await super.deploy(props)

    // 初始化合约状态
    // this.deadlineBlockHeight.set(new UInt32(500000));
    // this.targetAmount.set(initialState_targetAmount);
    
    // 初始化账户权限
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    })
  }

  @method
  async donate(sender: PublicKey, amount: UInt64) {

    this.network.blockchainLength.requireBetween(new UInt32(0), initialState_deadlineBlockHeight);

    // fetch onchain states
    let targetAmount = this.targetAmount.getAndRequireEquals();
    let receivedAmount = this.receivedAmount.getAndRequireEquals();

    receivedAmount.assertLessThan(targetAmount);

    let senderUpdate = AccountUpdate.createSigned(sender);
    senderUpdate.send({ to: this.address, amount: amount });

    let newAmount = receivedAmount.add(amount);
    this.receivedAmount.set(newAmount);  // updates


    // let x = this.x.get();// x = 1
    // this.x.requireEquals(x);// 

    // let newX = x.add(y);
    // this.x.set(newX);// updates
  }


  @method
  async withdraw(caller: PrivateKey) {

    this.network.blockchainLength.requireBetween(initialState_deadlineBlockHeight, new UInt32(100000000));
    
    const privileged = this.privileged.getAndRequireEquals();
    let callerAddress = caller.toPublicKey();
    callerAddress.assertEquals(privileged);

    let callerAccountUpdate = AccountUpdate.createSigned(callerAddress);
    callerAccountUpdate.account.isNew.requireEquals(Bool(true));  // only invoke once

    let receivedAmount = this.receivedAmount.getAndRequireEquals();
    this.send({ to: callerAccountUpdate, amount: receivedAmount });

    // !!!vesting schedule!!!
    callerAccountUpdate.account.timing.set({
      initialMinimumBalance: receivedAmount,
      cliffTime: initialState_deadlineBlockHeight,
      cliffAmount: receivedAmount.mul(2).div(10),// Tips: 除法会丢掉余数的
      vestingPeriod: new UInt32(200),
      vestingIncrement: receivedAmount.mul(1).div(10),// Tips: 除法会丢掉余数的
    });

    // emit some events
    this.emitEvent('payoutReceiver', callerAddress);
    this.emitEvent('payout', receivedAmount);
  }

}
