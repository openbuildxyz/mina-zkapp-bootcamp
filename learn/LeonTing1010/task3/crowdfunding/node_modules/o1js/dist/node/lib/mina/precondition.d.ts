import { Bool, Field } from '../provable/wrapped.js';
import type { AccountUpdate } from './account-update.js';
import { UInt32, UInt64 } from '../provable/int.js';
import { PublicKey } from '../provable/crypto/signature.js';
import type { Types } from '../../bindings/mina-transaction/types.js';
import type { Permissions } from './account-update.js';
export { preconditions, Account, Network, CurrentSlot, assertPreconditionInvariants, cleanPreconditionsCache, ensureConsistentPrecondition, AccountValue, NetworkValue, getAccountPreconditions, Preconditions, OrIgnore, ClosedInterval, };
type AccountUpdateBody = Types.AccountUpdate['body'];
/**
 * Preconditions for the network and accounts
 */
type Preconditions = AccountUpdateBody['preconditions'];
/**
 * Either check a value or ignore it.
 *
 * Used within [[ AccountPredicate ]]s and [[ ProtocolStatePredicate ]]s.
 */
type OrIgnore<T> = {
    isSome: Bool;
    value: T;
};
/**
 * An interval representing all the values between `lower` and `upper` inclusive
 * of both the `lower` and `upper` values.
 *
 * @typeParam A something with an ordering where one can quantify a lower and
 *            upper bound.
 */
type ClosedInterval<T> = {
    lower: T;
    upper: T;
};
type NetworkPrecondition = Preconditions['network'];
declare let NetworkPrecondition: {
    ignoreAll(): NetworkPrecondition;
};
declare const Preconditions: {
    ignoreAll(): Preconditions;
};
declare function preconditions(accountUpdate: AccountUpdate, isSelf: boolean): {
    account: Account;
    network: Network;
    currentSlot: CurrentSlot;
};
declare function Network(accountUpdate: AccountUpdate): Network;
declare function Account(accountUpdate: AccountUpdate): Account;
declare function CurrentSlot(accountUpdate: AccountUpdate): CurrentSlot;
declare function getAccountPreconditions(body: {
    publicKey: PublicKey;
    tokenId?: Field;
}): AccountValue;
declare function cleanPreconditionsCache(accountUpdate: AccountUpdate): void;
declare function assertPreconditionInvariants(accountUpdate: AccountUpdate): void;
/**
 * Asserts that a precondition is not already set or that it matches the new values.
 *
 * This function checks if a precondition is already set for a given property and compares it
 * with new values. If the precondition is not set, it allows the new values. If it's already set,
 * it ensures consistency with the existing precondition.
 *
 * @param property - The property object containing the precondition information.
 * @param newIsSome - A boolean or CircuitValue indicating whether the new precondition should exist.
 * @param value - The new value for the precondition. Can be a simple value or an object with 'lower' and 'upper' properties for range preconditions.
 * @param name - The name of the precondition for error messages.
 *
 * @throws {Error} Throws an error with a detailed message if attempting to set an inconsistent precondition.
 * @todo It would be nice to have the input parameter types more specific, but it's hard to do with the current implementation.
 */
declare function ensureConsistentPrecondition(property: any, newIsSome: any, value: any, name: any): void;
type NetworkValue = PreconditionBaseTypes<NetworkPrecondition>;
type RawNetwork = PreconditionClassType<NetworkPrecondition>;
type Network = RawNetwork & {
    timestamp: PreconditionSubclassRangeType<UInt64>;
};
type AccountPreconditionNoState = Omit<Preconditions['account'], 'state'>;
type AccountValue = PreconditionBaseTypes<AccountPreconditionNoState>;
type Account = PreconditionClassType<AccountPreconditionNoState> & Update;
type CurrentSlot = {
    requireBetween(lower: UInt32, upper: UInt32): void;
};
type PreconditionBaseTypes<T> = {
    [K in keyof T]: T[K] extends RangeCondition<infer U> ? U : T[K] extends FlaggedOptionCondition<infer U> ? U : T[K] extends Field ? Field : PreconditionBaseTypes<T[K]>;
};
type PreconditionSubclassType<U> = {
    get(): U;
    getAndRequireEquals(): U;
    requireEquals(value: U): void;
    requireEqualsIf(condition: Bool, value: U): void;
    requireNothing(): void;
};
type PreconditionSubclassRangeType<U> = PreconditionSubclassType<U> & {
    requireBetween(lower: U, upper: U): void;
};
type PreconditionClassType<T> = {
    [K in keyof T]: T[K] extends RangeCondition<infer U> ? PreconditionSubclassRangeType<U> : T[K] extends FlaggedOptionCondition<infer U> ? PreconditionSubclassType<U> : T[K] extends Field ? PreconditionSubclassType<Field> : PreconditionClassType<T[K]>;
};
type Update_ = Omit<AccountUpdate['body']['update'], 'appState'>;
type Update = {
    [K in keyof Update_]: {
        set(value: UpdateValue[K]): void;
    };
};
type UpdateValue = {
    [K in keyof Update_]: K extends 'zkappUri' | 'tokenSymbol' ? string : K extends 'permissions' ? Permissions : Update_[K]['value'];
};
type RangeCondition<T> = {
    isSome: Bool;
    value: {
        lower: T;
        upper: T;
    };
};
type FlaggedOptionCondition<T> = {
    isSome: Bool;
    value: T;
};
