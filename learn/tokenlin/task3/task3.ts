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

const privilegedAcct = Mina.TestPublicKey(
  PrivateKey.fromBase58('EKEeoESE2A41YQnSht9f7mjiKpJSeZ4jnfHXYatYi8xJdYSxWBep')
);

 

let initialState_deadlineBlockHeight = new UInt32(373835);
let initialState_targetAmount = new UInt64(2e9);
let initialState_receivedAmount = new UInt64(0);
export class Donate extends SmartContract {

  @state(UInt32) deadlineBlockHeight = State<UInt32>(initialState_deadlineBlockHeight);
  @state(UInt64) targetAmount = State<UInt64>(initialState_targetAmount);
  @state(UInt64) receivedAmount = State<UInt64>(initialState_receivedAmount);
  @state(PublicKey) privileged = State<PublicKey>(privilegedAcct);

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
  async withdraw(caller: PrivateKey, amount: UInt64) {

    this.network.blockchainLength.requireBetween(initialState_deadlineBlockHeight, new UInt32(100000000));
    
    const privileged = this.privileged.getAndRequireEquals();
    let callerAddress = caller.toPublicKey();
    callerAddress.assertEquals(privileged);

    let receivedAmount = this.receivedAmount.getAndRequireEquals();
    receivedAmount.assertGreaterThanOrEqual(amount);

    let callerAccountUpdate = AccountUpdate.createSigned(callerAddress);

    this.send({ to: callerAccountUpdate, amount: receivedAmount });

    let newAmount = receivedAmount.sub(amount);
    this.receivedAmount.set(newAmount);  // updates

  }



}
