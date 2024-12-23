<<<<<<< HEAD
import { AccountUpdateForest, method, TokenContractV2, UInt64 } from "o1js";

const SUPPLY = UInt64.from(10n ** 18n);

export class JusToken extends TokenContractV2 {
  @method
  async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  @method
  async init() {
    super.init();

    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
=======
import { TokenContract } from "o1JS";

export class JusToken extends TokenContract {
  /** todo */
>>>>>>> e870ec377312d24c76b21d66173a8d60aee679fb
}
