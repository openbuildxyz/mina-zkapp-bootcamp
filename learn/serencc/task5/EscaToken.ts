import { method, UInt64, AccountUpdateForest, TokenContract } from "o1js";

const SUPPLY = UInt64.from(10n ** 18n);
export class EscaToken extends TokenContract {
  @method async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  async deploy(): Promise<void> {
    await super.deploy();
    this.account.tokenSymbol.set("ESCA");
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}
