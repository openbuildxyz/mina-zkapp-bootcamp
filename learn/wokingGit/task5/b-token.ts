import { AccountUpdateForest, method, TokenContract, UInt64 } from 'o1js';

const SUPPLY = UInt64.from(10n ** 18n);

export class WToken extends TokenContract {
  @method
  async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('WTK');
  }

  @method
  async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
    console.log('铸币');
  }
}
