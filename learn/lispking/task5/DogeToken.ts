import { TokenContract, UInt64, method, AccountUpdateForest, Permissions } from "o1js";

const SUPPLY = UInt64.from(10n ** 18n);
export class DogeToken extends TokenContract {
  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('DOGE');

    // make account non-upgradable forever
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
      access: Permissions.proofOrSignature(),
    });
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}
