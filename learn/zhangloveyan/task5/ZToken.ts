import {
    AccountUpdateForest,
    method,
    TokenContract,
    UInt64
} from 'o1js';

const SUPPLY = UInt64.from(10n ** 18n);

export default class ZToken extends TokenContract {

    @method
    async approveBase(updates: AccountUpdateForest) {
        this.checkZeroBalanceChange(updates)
    }

    async deploy() {
        await super.deploy();
        this.account.tokenSymbol.set("ZT");
    }

    @method
    async init() {
        super.init();
        // mint 
        this.internal.mint({ address: this.address, amount: SUPPLY });
        // console.log("铸造 ztoken");
    }
}