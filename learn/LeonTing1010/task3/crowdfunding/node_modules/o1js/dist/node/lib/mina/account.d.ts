import { Types } from '../../bindings/mina-transaction/types.js';
import { Field } from '../provable/wrapped.js';
import { PublicKey } from '../provable/crypto/signature.js';
import { FetchedAccount } from './graphql.js';
export { Account, PartialAccount };
export { newAccount, parseFetchedAccount, fillPartialAccount };
type Account = Types.Account;
declare const Account: import("../../bindings/lib/generic.js").GenericProvableExtended<Types.Account, import("../../bindings/mina-transaction/gen/transaction-bigint.js").Account, Types.Json.Account, import("../provable/field.js").Field>;
declare function newAccount(accountId: {
    publicKey: PublicKey;
    tokenId?: Field;
}): Account;
type PartialAccount = Omit<Partial<Account>, 'zkapp'> & {
    zkapp?: Partial<Account['zkapp']>;
};
declare function parseFetchedAccount(account: FetchedAccount): Account;
declare function fillPartialAccount(account: PartialAccount): Account;
