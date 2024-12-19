import { TokenContract, UInt64, method, AccountUpdateForest } from "o1js";


const SUPPLY = UInt64.from(10n ** 18n);
export class AberToken extends TokenContract {
  @method async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('AMBER');
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}