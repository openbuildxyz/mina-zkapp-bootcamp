import { TokenContract, UInt64, method, AccountUpdateForest } from "o1js";

// 設置最大供應量
const SUPPLY = UInt64.from(8n ** 18n);

// 使用 TokenContract
export class MyToken extends TokenContract {

  @method async approveBase(updates: AccountUpdateForest) {
    // 進行收發平衡的驗證
    this.checkZeroBalanceChange(updates);
  }
  async deploy() {
    await super.deploy();
    // 設置 token 名稱
    this.account.tokenSymbol.set('MYC');
  }
  @method async init() {
    super.init();
    // 將指定數量的 token 轉發到 owner account (this.address)
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }

}