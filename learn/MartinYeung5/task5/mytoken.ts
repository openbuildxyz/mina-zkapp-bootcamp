import { TokenContract, UInt64, method, AccountUpdateForest } from "o1js";

// 設置最大供應量
const SUPPLY = UInt64.from(123n ** 18n);

export class MyToken extends TokenContract {
  @method async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }
  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('MYC');
  }
  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }

}