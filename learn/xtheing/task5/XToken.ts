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

const SUPPLY = UInt64.from(10n ** 10n);
export const MINA = 1e9;
export function mina(amount: number) {
    return Field(amount * MINA)
}
export class XToken extends TokenContract {
    async deploy(args?: DeployArgs) {
        await super.deploy(args);
        this.account.tokenSymbol.set("XToken")
    }
    @method
    async approveBase(updates: AccountUpdateForest) {
        this.checkZeroBalanceChange(updates);  // 检查是否有余额变动
    }
    @method
    async init() {
        super.init();
        this.internal.mint({ address: this.address, amount: SUPPLY });  // 铸造代币并将其分配到合约地址
    }
}

export class XTokenPublish extends SmartContract {
    @state(UInt64) total = State<UInt64>(SUPPLY);
    @state(UInt64) remained = State<UInt64>(SUPPLY);
    @state(UInt32) endTime = State<UInt32>();

    async deploy(args: DeployArgs & { endTime: UInt32 }) {
        await super.deploy(args);
        this.endTime.set(args.endTime);
        this.account.permissions.set({
            ...Permissions.default(),
            send: Permissions.proof(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        });
    }

    @method async buy(receiver: PublicKey, count: UInt64) {
        const endTime = this.endTime.getAndRequireEquals();
        this.network.blockchainLength.requireBetween(UInt32.from(0), endTime);

        const remained = this.remained.getAndRequireEquals();
        count.assertLessThanOrEqual(remained);

        // send token
        const receiverAcctUpt = this.send({ to: receiver, amount: count });
        receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;

        this.remained.set(remained.sub(count));
    }
}
