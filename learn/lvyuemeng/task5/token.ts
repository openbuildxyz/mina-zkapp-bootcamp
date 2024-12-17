import { method, TokenContract, UInt64, type AccountUpdateForest, type DeployArgs, Permissions } from "o1js";

const SUPPLY = UInt64.from(10n ** 12n);
export class MyTokenContract extends TokenContract {
	@method async approveBase(forest: AccountUpdateForest) {
		this.checkZeroBalanceChange(forest);
	}

	async deploy(args?: DeployArgs): Promise<void> {
		await super.deploy(args);
		this.account.tokenSymbol.set("MyToken");
	}

	@method async init() {
		super.init();
		this.internal.mint({ address: this, amount: SUPPLY })
	}
}