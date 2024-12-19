import {
    AccountUpdateForest,
    method,
    TokenContract,
    UInt64
  } from 'o1js';
  
  const SUPPLY = UInt64.from(10n ** 18n);
  
  export class Token extends TokenContract {
  
    @method
    async approveBase(updates: AccountUpdateForest) {
        this.checkZeroBalanceChange(updates)
    }
  
    async deploy() {
        await super.deploy();
        this.account.tokenSymbol.set("YUN");
    }
  
    @method
    async init() {
        super.init();
        this.internal.mint({ address: this.address, amount: SUPPLY });
    }
  }