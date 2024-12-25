import {
  SmartContract, Permissions, state, State, method, DeployArgs, UInt64, AccountUpdate, PublicKey, UInt32, Bool,
} from 'o1js';

// export 1
export const MINA = 0.1 * 10**9; // 1 Mina

let initialState = new UInt64(0);
let initialState2 = new UInt32(0);
// export 2
export class Crowdfunding4 extends SmartContract {
  // Field 1 - 目標眾籌金額
  @state(UInt64) targetedFunding = State<UInt64>(new UInt64(0));
  // Field 2 - 目前眾籌金額
  @state(UInt64) currentFunding = State<UInt64>(new UInt64(0));
  // Field 3 - 眾籌完結時間
  @state(UInt32) endTime = State<UInt32>(new UInt32(0));
  // Field 4 - 接收眾籌用戶
  @state(PublicKey) fundingReceiver = State<PublicKey>();
  // Field 5 - 眾籌是否結束
  @state(Bool) closed = State<Bool>(Bool(false));

  // Action - 部署
  async deploy(args: DeployArgs & 
    { targetedFunding: UInt64; endTime: UInt32; fundingReceiver: PublicKey }
  ) {
    await super.deploy(args);
    this.account.permissions.set({ 
      ...Permissions.default(), 
      send: Permissions.proof(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
      editState: Permissions.proofOrSignature()
    });
    
    this.targetedFunding.set(initialState);
    this.endTime.set(initialState2);
    const sender = this.sender.getAndRequireSignature();
    this.fundingReceiver.set(sender);
  }
  
  // Method - 投資
  @method async invest(amount: UInt64) {
    // 獲得眾籌完結時間
    const endTime = this.endTime.getAndRequireEquals();
    // 
    //const currentTime = this.network.timestamp.getAndRequireEquals();
    this.network.blockchainLength.requireBetween(UInt32.from(0), endTime);

    // 獲得目標眾籌金額
    const targetedFunding = this.targetedFunding.getAndRequireEquals();
    // 獲得目前眾籌金額
    const currentFunding = this.currentFunding.getAndRequireEquals();
    // 眾籌金額是否相等
    currentFunding.assertLessThan(targetedFunding);
    // 投資金額需要小於或等於(目標眾籌金額-目前眾籌金額)
    amount.assertLessThanOrEqual(targetedFunding.sub(currentFunding));

    // 獲得投資人戶口的狀態資料
    const investor = this.sender.getAndRequireSignature();
    const investorAccountStatus = AccountUpdate.createSigned(investor);
    const investorAccountBalance = investorAccountStatus.account.balance.getAndRequireEquals();

    // 檢查投資人戶口的餘額是否大於投資金額
    investorAccountBalance.assertGreaterThanOrEqual(amount);

    // 轉移投資金額到合約
    investorAccountStatus.send({ to: this, amount });
    // 更新目前眾籌金額
    this.currentFunding.set(currentFunding.add(amount));
  }

  // Method - 取款
  @method async withdraw(reciver: PublicKey) {
    // 獲得眾籌是否結束的資訊
    this.closed.getAndRequireEquals();
    // 要求眾籌結束的設定為否
    this.closed.requireEquals(Bool(false));

    // 獲得眾籌完結時間
    const endTime = this.endTime.getAndRequireEquals();
    // 獲得當前時間
    const currentBlockHeight = this.network.blockchainLength.getAndRequireEquals();
    // 檢查當前時間是否大於眾籌完結時間
    currentBlockHeight.assertGreaterThan(endTime);

    // 獲得接收眾籌用戶的資料
    const fundingReceiver = this.fundingReceiver.getAndRequireEquals();
    // 獲得執行取款動作的用戶的資料
    const sender = this.sender.getAndRequireSignature();
    // 檢查執行取款動作的用戶是否接收眾籌的用戶
    fundingReceiver.assertEquals(sender);

    const recieverAcctUpt = AccountUpdate.createSigned(reciver);
    recieverAcctUpt.account.isNew.requireEquals(Bool(true));

    // 獲得目前眾籌金額
    const currentFunding = this.currentFunding.getAndRequireEquals();
    const item = currentFunding.div(10);

    // 轉移眾籌金額到接收眾籌的用戶
    this.send({ to: fundingReceiver, amount: currentFunding });

    recieverAcctUpt.account.timing.set({
      initialMinimumBalance: item.mul(8),
      cliffTime: UInt32.from(0),
      cliffAmount: UInt64.from(0),
      vestingPeriod: UInt32.from(200),
      vestingIncrement: item,
    });

    // 將眾籌設定為是結束
    this.closed.set(Bool(true));
  }
}