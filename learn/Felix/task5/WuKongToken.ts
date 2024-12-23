import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  Provable,
  PublicKey,
  UInt32,
  UInt64,
  Poseidon,
  Struct,
  DeployArgs,
  Permissions,
  AccountUpdate,
  TokenContract,
  AccountUpdateForest,
} from 'o1js';

const totalSupply = UInt64.from(10n ** 18n);

export class WuKongToken extends TokenContract {
  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  async deploy() {
    await super.deploy();
    this.account.tokenSymbol.set('WuKong');
  }

  @method async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: totalSupply });
  }
}
