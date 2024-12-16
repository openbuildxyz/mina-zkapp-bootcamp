import { TokenContract, UInt64, method, AccountUpdateForest } from 'o1js';

const SUPPLY = UInt64.from(10n ** 18n);

export class CatToken extends TokenContract {
  @method
  async approveBase(updates: AccountUpdateForest): Promise<void> {
    this.checkZeroBalanceChange(updates);
  }

  @method
  async init() {
    super.init();

    // mint
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('Cat');
  }
}
