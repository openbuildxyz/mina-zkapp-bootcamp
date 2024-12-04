import { InferProvable } from '../../provable/types/struct.js';
import { Actionable } from './offchain-state-serialization.js';
import { Proof } from '../../proof-system/proof.js';
import { OffchainStateCommitments } from './offchain-state-rollup.js';
import { Option, OptionOrValue } from '../../provable/option.js';
import { Constructor, InferValue } from '../../../bindings/lib/provable-generic.js';
import { SmartContract } from '../zkapp.js';
import { State } from '../state.js';
import { Provable } from '../../provable/provable.js';
export { OffchainState, OffchainStateCommitments };
export { OffchainField, OffchainMap, OffchainStateInstance };
type OffchainStateInstance<Config extends {
    [key: string]: OffchainStateKind;
}> = {
    /**
     * The individual fields of the offchain state.
     *
     * ```ts
     * const state = OffchainState({ totalSupply: OffchainState.Field(UInt64) });
     *
     * state.fields.totalSupply.overwrite(UInt64.from(100));
     *
     * let supply = await state.fields.totalSupply.get();
     * ```
     */
    readonly fields: {
        [K in keyof Config]: OffchainStateIntf<Config[K]>;
    };
    /**
     * Set the contract that this offchain state instance is connected with.
     *
     * This tells the offchain state about the account to fetch data from and modify, and lets it handle actions and onchain state.
     */
    setContractInstance(contractInstance: OffchainStateContract<Config>): void;
    /**
     * Set the smart contract class that this offchain state instance is connected with.
     *
     * This is an alternative for `setContractInstance()` which lets you compile offchain state without having a contract instance.
     * However, you must call `setContractInstance()` before calling `createSettlementProof()`.
     */
    setContractClass(contractClass: OffchainStateContractClass<Config>): void;
    /**
     * Create a proof that updates the commitments to offchain state: Merkle root and action state.
     */
    createSettlementProof(): Promise<Proof<OffchainStateCommitments, OffchainStateCommitments>>;
    /**
     * Settle the offchain state.
     *
     * Use this in a contract method as follows:
     *
     * @example
     * ```ts
     * class StateProof extends offchainState.Proof {}
     *
     * const offchainState = OffchainState(...);
     *
     * const offchainStateInstance = offchainState.init();
     *
     * class MyContract extends SmartContract {
     *   @state(OffchainStateCommitments) offchainStateCommitments = State(OffchainStateCommitments.empty());
     *
     *   offchainState = offchainStateInstance;
     *
     *   \@method
     *   async settle(proof: StateProof) {
     */
    settle(proof: Proof<OffchainStateCommitments, OffchainStateCommitments>): Promise<void>;
    /**
     * Commitments to the offchain state, to use in your onchain state.
     */
    commitments(): State<OffchainStateCommitments>;
};
type OffchainState<Config extends {
    [key: string]: OffchainStateKind;
}> = {
    /**
     * Compile the offchain state ZkProgram.
     */
    compile(): Promise<void>;
    /**
     * The custom proof class for state settlement proofs, that have to be passed into the settling method.
     */
    Proof: typeof Proof<OffchainStateCommitments, OffchainStateCommitments>;
    /**
     * Create an empty set of offchain state commitments to use as a default value
     */
    emptyCommitments(): State<OffchainStateCommitments>;
    /**
     * Initialize an offchain state instance for a specific contract, or
     * return a memoized instance if one already exists for the contract.
     */
    init(contractInstance: OffchainStateContract<Config>): OffchainStateInstance<Config>;
};
type OffchainStateContract<Config extends {
    [key: string]: OffchainStateKind;
}> = SmartContract & {
    offchainStateCommitments: State<OffchainStateCommitments>;
    offchainState: OffchainStateInstance<Config>;
};
type OffchainStateContractClass<Config extends {
    [key: string]: OffchainStateKind;
}> = typeof SmartContract & Constructor<OffchainStateContract<Config>>;
/**
 * Offchain state for a `SmartContract`.
 *
 * ```ts
 * // declare your offchain state
 *
 * const offchainState = OffchainState({
 *   accounts: OffchainState.Map(PublicKey, UInt64),
 *   totalSupply: OffchainState.Field(UInt64),
 * });
 *
 * // use it in a contract, by adding an onchain state field of type `OffchainStateCommitments`
 *
 * class MyContract extends SmartContract {
 *  \@state(OffchainStateCommitments) offchainState = State(
 *    OffchainStateCommitments.empty()
 *   );
 *
 *   // ...
 * }
 *
 * // set the contract instance
 *
 * let contract = new MyContract(address);
 * offchainState.setContractInstance(contract);
 * ```
 *
 * See the individual methods on `offchainState` for more information on usage.
 */
declare function OffchainState<const Config extends {
    [key: string]: OffchainStateKind;
}>(config: Config, options?: {
    /**
     * The base-2 logarithm of the total capacity of the offchain state.
     *
     * Example: if you want to have 1 million individual state fields and map entries available,
     * set this to 20, because 2^20 ~= 1M.
     *
     * The default is 30, which allows for ~1 billion entries.
     *
     * Passing in lower numbers will reduce the number of constraints required to prove offchain state updates,
     * which we will make proof creation slightly faster.
     * Instead, you could also use a smaller total capacity to increase the `maxActionsPerProof`, so that fewer proofs are required,
     * which will reduce the proof time even more, but only in the case of many actions.
     */
    logTotalCapacity?: number;
    /**
     * The maximum number of offchain state actions that can be included in a single account update.
     *
     * In other words, you must not call `.update()` or `.overwrite()` more than this number of times in any of your smart contract methods.
     *
     * The default is 4.
     *
     * Note: When increasing this, consider decreasing `maxActionsPerProof` or `logTotalCapacity` in order to not exceed the circuit size limit.
     */
    maxActionsPerUpdate?: number;
    maxActionsPerProof?: number;
}): OffchainState<Config>;
declare namespace OffchainState {
    var Map: typeof OffchainMap;
    var Field: typeof OffchainField;
    var Commitments: typeof OffchainStateCommitments;
}
type Any = Actionable<any>;
declare function OffchainField<T extends Any>(type: T): {
    kind: "offchain-field";
    type: T;
};
type OffchainField<T, TValue> = {
    _type: Provable<T, TValue>;
    /**
     * Get the value of the field, or none if it doesn't exist yet.
     */
    get(): Promise<Option<T, TValue>>;
    /**
     * Update the value of the field, while requiring a specific previous value.
     *
     * If the previous value does not match, the update will not be applied.
     *
     * Note that the previous value is an option: to require that the field was not set before, use `Option(type).none()` or `undefined`.
     */
    update(update: {
        from: OptionOrValue<T, TValue>;
        to: T | TValue;
    }): void;
    /**
     * Set the value of the field to the given value, without taking into account the previous value.
     *
     * **Warning**: if this is performed by multiple zkapp calls concurrently (between one call to `settle()` and the next),
     * calls that are applied later will simply overwrite and ignore whatever changes were made by earlier calls.
     *
     * This behaviour can imply a security risk in many applications, so use `overwrite()` with caution.
     */
    overwrite(value: T | TValue): void;
};
declare function OffchainMap<K extends Any, V extends Any>(key: K, value: V): {
    kind: "offchain-map";
    keyType: K;
    valueType: V;
};
type OffchainMap<K, V, VValue> = {
    _keyType: Provable<K>;
    _valueType: Provable<V, VValue>;
    /**
     * Get the value for this key, or none if it doesn't exist.
     */
    get(key: K): Promise<Option<V, VValue>>;
    /**
     * Update the value of the field, while requiring a specific previous value.
     *
     * If the previous value does not match, the update will not be applied.
     *
     * Note that the previous value is an option: to require that the field was not set before, use `Option(type).none()` or `undefined`.
     */
    update(key: K, update: {
        from: OptionOrValue<V, VValue>;
        to: V | VValue;
    }): void;
    /**
     * Set the value for this key to the given value, without taking into account the previous value.
     *
     * **Warning**: if the same key is modified by multiple zkapp calls concurrently (between one call to `settle()` and the next),
     * calls that are applied later will simply overwrite and ignore whatever changes were made by earlier calls.
     *
     * This behaviour can imply a security risk in many applications, so use `overwrite()` with caution.
     */
    overwrite(key: K, value: V | VValue): void;
};
type OffchainStateKind = {
    kind: 'offchain-field';
    type: Any;
} | {
    kind: 'offchain-map';
    keyType: Any;
    valueType: Any;
};
type OffchainStateIntf<Kind extends OffchainStateKind> = Kind extends {
    kind: 'offchain-field';
    type: infer T;
} ? OffchainField<InferProvable<T>, InferValue<T>> : Kind extends {
    kind: 'offchain-map';
    keyType: infer K;
    valueType: infer V;
} ? OffchainMap<InferProvable<K>, InferProvable<V>, InferValue<V>> : never;
