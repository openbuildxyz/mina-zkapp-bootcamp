import { TokenContract, UInt64, method, AccountUpdateForest } from "o1js";

const SUPPLY = UInt64.from(10n ** 9n);
export class MemeToken extends TokenContract {
  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('DOGE');
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}