/**
 * A ledger of accounts - simple model of a local blockchain.
 */
import { PublicKey } from '../../provable/crypto/signature.js';
import type { AccountUpdate } from '../account-update.js';
import { Account } from '../account.js';
import { Field } from '../../provable/field.js';
export { SimpleLedger };
declare class SimpleLedger {
    accounts: Map<bigint, Account>;
    constructor();
    static create(): SimpleLedger;
    exists({ publicKey, tokenId, }: InputAccountId): boolean;
    store(account: Account): void;
    load({ publicKey, tokenId, }: InputAccountId): Account | undefined;
    apply(update: AccountUpdate): void;
}
type InputAccountId = {
    publicKey: PublicKey;
    tokenId?: Field;
};
