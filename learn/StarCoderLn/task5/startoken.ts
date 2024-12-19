import {
  Field,
  SmartContract,
  state,
  State,
  method,
  UInt64,
  TokenContract,
  AccountUpdateForest,
  UInt32,
  Permissions,
  DeployArgs,
  AccountUpdate,
  PublicKey,
} from 'o1js';

const SUPPLY = UInt64.from(1000);

export const MINA = 1e9;
export const mina = (amount: number) => Field(amount * MINA);

export class StarToken extends TokenContract {
  @method
  async approveBase(updates: AccountUpdateForest) {
    this.checkZeroBalanceChange(updates);
  }

  @method
  async init() {
    super.init();
    this.internal.mint({ address: this.address, amount: SUPPLY });
  }
}

export class StarTokenPublish extends SmartContract {
  @state(UInt64) total = State<UInt64>(SUPPLY);
  @state(UInt64) remained = State<UInt64>(SUPPLY);
  @state(UInt32) endAt = State<UInt32>();

  async deploy(args: DeployArgs & { endAt: UInt32 }) {
    await super.deploy(args);
    this.endAt.set(args.endAt);
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  @method async buy(receiver: PublicKey, count: UInt64) {
    const endAt = this.endAt.getAndRequireEquals();
    this.network.blockchainLength.requireBetween(UInt32.from(0), endAt);
    
    const remained = this.remained.getAndRequireEquals();
    count.assertLessThanOrEqual(remained);

    const receiverAcctUpt = this.send({ to: receiver, amount: count });
    receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;

    this.remained.set(remained.sub(count));
  }
}
