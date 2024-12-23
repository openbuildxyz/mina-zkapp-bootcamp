import { TokenContract, UInt64, method, AccountUpdateForest } from "o1js";

const SUPPLY = UInt64.from(10n ** 18n);

export class Token extends TokenContract {
  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('CODE');
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}