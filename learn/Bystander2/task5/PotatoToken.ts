import { AccountUpdateForest, method, TokenContract, UInt64 } from 'o1js';

const SUPPLY = UInt64.from(10n ** 18n);
export class PotatoToken extends TokenContract {
  @method
  async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('POTATO');
  }

  @method
  async init() {
    super.init();

    // mint the entire supply to the token account with the same address as this contract
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}
