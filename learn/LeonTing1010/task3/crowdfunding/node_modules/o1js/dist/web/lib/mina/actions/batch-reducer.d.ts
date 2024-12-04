import { SelfProof } from '../../proof-system/zkprogram.js';
import { Proof } from '../../proof-system/proof.js';
import { Bool, Field } from '../../provable/wrapped.js';
import { SmartContract } from '../zkapp.js';
import { Constructor, From } from '../../../bindings/lib/provable-generic.js';
import { InferProvable } from '../../provable/types/struct.js';
import { Provable } from '../../provable/provable.js';
import { Actionable } from './offchain-state-serialization.js';
import { State } from '../state.js';
import { Unconstrained } from '../../provable/types/unconstrained.js';
import { MerkleActions } from './action-types.js';
import { ProvableHashable, ProvablePure } from '../../provable/types/provable-intf.js';
export { BatchReducer, ActionBatch };
export { actionStackProgram, proveActionStack };
/**
 * A reducer to process actions in fixed-size batches.
 *
 * ```ts
 * let batchReducer = new BatchReducer({ actionType: Action, batchSize: 5 });
 *
 * // in contract: concurrent dispatching of actions
 * batchReducer.dispatch(action);
 *
 * // reducer logic
 * // outside contract: prepare a list of { batch, proof } objects which cover all pending actions
 * let batches = await batchReducer.prepareBatches();
 *
 * // in contract: process a single batch
 * // create one transaction that does this for each batch!
 * batchReducer.processBatch({ batch, proof }, (action, isDummy) => {
 *   // ...
 * });
 * ```
 */
declare class BatchReducer<ActionType extends Actionable<any>, BatchSize extends number = number, Action = InferProvable<ActionType>> {
    batchSize: BatchSize;
    actionType: ProvableHashable<Action> & ProvablePure<Action>;
    Batch: ReturnType<typeof ActionBatch>;
    program: ActionStackProgram;
    BatchProof: typeof Proof<Field, ActionStackState>;
    maxUpdatesFinalProof: number;
    maxActionsPerUpdate: number;
    constructor({ actionType, batchSize, maxUpdatesPerProof, maxUpdatesFinalProof, maxActionsPerUpdate, }: {
        /**
         * The provable type of actions submitted by this reducer.
         */
        actionType: ActionType;
        /**
         * The number of actions in a batch. The idea is to process one batch per transaction, by calling `processBatch()`.
         *
         * The motivation for processing actions in small batches is to work around the protocol limit on the number of account updates.
         * If every action should result in an account update, then you have to set the batch size low enough to not exceed the limit.
         *
         * If transaction limits are no concern, the `batchSize` could be set based on amount of logic you do per action.
         * A smaller batch size will make proofs faster, but you might need more individual transactions as more batches are needed to process all pending actions.
         */
        batchSize: BatchSize;
        /**
         * The maximum number of action lists (= all actions on an account update) to process in a single recursive proof, in `prepareBatches()`.
         *
         * Default: 300, which will take up about 9000 constraints.
         *
         * The current default should be sensible for most applications, but here are some trade-offs to consider when changing it:
         *
         * - Using a smaller number means a smaller circuit, so recursive proofs will be faster.
         * - Using a bigger number means you'll need fewer recursive proofs in the case a lot of actions are pending.
         *
         * So, go lower if you expect very few actions, and higher if you expect a lot of actions.
         * (Note: A larger circuit causes longer compilation and proof times for your zkApp even if you _never_ need a recursive proof)
         */
        maxUpdatesPerProof?: number;
        /**
         * The maximum number of action lists (= all actions on an account update) to process inside `processBatch()`,
         * i.e. in your zkApp method.
         *
         * Default: 100, which will take up about 3000 constraints.
         *
         * The current default should be sensible for most applications, but here are some trade-offs to consider when changing it:
         *
         * - Using a smaller number means a smaller circuit, so proofs of your method will be faster.
         * - Using a bigger number means it's more likely that you can prove _all_ actions in the method call and won't need a recursive proof.
         *
         * So, go lower if you expect very few actions, and higher if you expect a lot of actions.
         */
        maxUpdatesFinalProof?: number;
        /**
         * The maximum number of actions dispatched in any of the zkApp methods on the contract.
         *
         * Note: This number just has to be an upper bound of the actual maximum, but if it's the precise number,
         * fewer constraints will be used. (The overhead of a higher number is fairly small though.)
         *
         * A restriction is that the number has to be less or equal than the `batchSize`.
         * The reason is that actions in one account update are always processed together, so if you'd have more actions in one than the batch size, we couldn't process them at all.
         *
         * By default, this is set to `Math.min(batchSize, 5)` which should be sensible for most applications.
         */
        maxActionsPerUpdate?: number;
    });
    static get initialActionState(): import("../../provable/field.js").Field;
    static get initialActionStack(): import("../../provable/field.js").Field;
    _contract?: BatchReducerContract;
    _contractClass?: BatchReducerContractClass;
    contractClass(): BatchReducerContractClass;
    contract(): BatchReducerContract;
    /**
     * Set the smart contract instance this reducer is connected with.
     *
     * Note: This is a required step before using `dispatch()`, `proveNextBatch()` or `processNextBatch()`.
     */
    setContractInstance(contract: BatchReducerContract): void;
    /**
     * Set the smart contract class this reducer is connected with.
     *
     * Note: You can use either this method or `setContractInstance()` before calling `compile()`.
     * However, `setContractInstance()` is required for `proveNextBatch()`.
     */
    setContractClass(contractClass: BatchReducerContractClass): void;
    /**
     * Submit an action.
     */
    dispatch(action: From<ActionType>): void;
    /**
     * Conditionally submit an action.
     */
    dispatchIf(condition: Bool, action: From<ActionType>): void;
    /**
     * Process a batch of actions which was created by `prepareBatches()`.
     *
     * **Important**: The callback exposes the action's value along with an `isDummy` flag.
     * This is necessary because we process a dynamically-sized list in a fixed number of steps.
     * Dummies will be passed to your callback once the actual actions are exhausted.
     *
     * Make sure to write your code to account for dummies. For example, when sending MINA from your contract for every action,
     * you probably want to zero out the balance decrease in the `isDummy` case:
     * ```ts
     * processBatch({ batch, proof }, (action, isDummy) => {
     *   // ... other logic ...
     *
     *   let amountToSend = Provable.if(isDummy, UInt64.zero, action.amount);
     *   this.balance.subInPlace(amountToSend);
     * });
     * ```
     *
     * **Warning**: Don't call `processBatch()` on two _different_ batches within the same method. The second call
     * would override the preconditions set by the first call, which would leave the method insecure.
     * To process more actions per method call, increase the `batchSize`.
     */
    processBatch({ batch, proof, }: {
        batch: ActionBatch<Action>;
        proof: Proof<Field, ActionStackState>;
    }, callback: (action: Action, isDummy: Bool, i: number) => void): void;
    /**
     * Compile the recursive action stack prover.
     */
    compile(): Promise<{
        verificationKey: {
            data: string;
            hash: import("../../provable/field.js").Field;
        };
    }>;
    /**
     * Create a proof which returns the next actions batch(es) to process and helps guarantee their correctness.
     */
    prepareBatches(): Promise<{
        proof: ActionStackProof;
        batch: ActionBatch<Action>;
    }[]>;
}
type BatchReducerContract = SmartContract & {
    reducer?: undefined;
    actionState: State<Field>;
    actionStack: State<Field>;
};
type BatchReducerContractClass = typeof SmartContract & Constructor<BatchReducerContract>;
/**
 * Inputs to a single call of `processBatch()`.
 *
 * `proveBatches()` will prepare as many of these as we need to catch up with the chain.
 */
type ActionBatch<Action> = {
    /**
     * Whether to use the onchain stack or the new one we compute.
     */
    useOnchainStack: Bool;
    /**
     * Current onchain fields, kept track of externally for robustness.
     *
     * Note:
     * - If `useOnchainStack = true`, the `onchainActionState` doesn't have to be correct (we only need it to prove validity of a new stack).
     * - If `useOnchainStack = false`, the `onchainStack` doesn't have to be correct as we don't use it.
     */
    processedActionState: Field;
    onchainActionState: Field;
    onchainStack: Field;
    /**
     * The stack of actions to process.
     *
     * Note: this is either the current onchain stack or the new stack, + witnesses which contain the actual actions.
     */
    stack: MerkleActions<Action>;
    /**
     * Whether a recursive proof was needed to compute the stack, or not.
     */
    isRecursive: Bool;
    /**
     * Witnesses needed to finalize the stack computation.
     */
    witnesses: Unconstrained<ActionWitnesses>;
};
declare function ActionBatch<A extends Actionable<any>>(actionType: A): (new (value: {
    useOnchainStack: import("../../provable/bool.js").Bool;
    processedActionState: import("../../provable/field.js").Field;
    onchainActionState: import("../../provable/field.js").Field;
    onchainStack: import("../../provable/field.js").Field;
    stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    isRecursive: import("../../provable/bool.js").Bool;
    witnesses: Unconstrained<ActionWitnesses>;
}) => {
    useOnchainStack: import("../../provable/bool.js").Bool;
    processedActionState: import("../../provable/field.js").Field;
    onchainActionState: import("../../provable/field.js").Field;
    onchainStack: import("../../provable/field.js").Field;
    stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    isRecursive: import("../../provable/bool.js").Bool;
    witnesses: Unconstrained<ActionWitnesses>;
}) & {
    _isStruct: true;
} & Provable<{
    useOnchainStack: import("../../provable/bool.js").Bool;
    processedActionState: import("../../provable/field.js").Field;
    onchainActionState: import("../../provable/field.js").Field;
    onchainStack: import("../../provable/field.js").Field;
    stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    isRecursive: import("../../provable/bool.js").Bool;
    witnesses: Unconstrained<ActionWitnesses>;
}, {
    useOnchainStack: boolean;
    processedActionState: bigint;
    onchainActionState: bigint;
    onchainStack: bigint;
    stack: any;
    isRecursive: boolean;
    witnesses: ActionWitnesses;
}> & {
    fromValue: (value: {
        useOnchainStack: boolean | import("../../provable/bool.js").Bool;
        processedActionState: string | number | bigint | import("../../provable/field.js").Field;
        onchainActionState: string | number | bigint | import("../../provable/field.js").Field;
        onchainStack: string | number | bigint | import("../../provable/field.js").Field;
        stack: any;
        isRecursive: boolean | import("../../provable/bool.js").Bool;
        witnesses: ActionWitnesses | Unconstrained<ActionWitnesses>;
    }) => {
        useOnchainStack: import("../../provable/bool.js").Bool;
        processedActionState: import("../../provable/field.js").Field;
        onchainActionState: import("../../provable/field.js").Field;
        onchainStack: import("../../provable/field.js").Field;
        stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
        isRecursive: import("../../provable/bool.js").Bool;
        witnesses: Unconstrained<ActionWitnesses>;
    };
    toInput: (x: {
        useOnchainStack: import("../../provable/bool.js").Bool;
        processedActionState: import("../../provable/field.js").Field;
        onchainActionState: import("../../provable/field.js").Field;
        onchainStack: import("../../provable/field.js").Field;
        stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
        isRecursive: import("../../provable/bool.js").Bool;
        witnesses: Unconstrained<ActionWitnesses>;
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        useOnchainStack: import("../../provable/bool.js").Bool;
        processedActionState: import("../../provable/field.js").Field;
        onchainActionState: import("../../provable/field.js").Field;
        onchainStack: import("../../provable/field.js").Field;
        stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
        isRecursive: import("../../provable/bool.js").Bool;
        witnesses: Unconstrained<ActionWitnesses>;
    }) => {
        useOnchainStack: boolean;
        processedActionState: string;
        onchainActionState: string;
        onchainStack: string;
        stack: {
            prototype: {
                hash: string;
                data: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                isEmpty: {};
                push: {};
                pushIf: {};
                popExn: {};
                pop: {};
                popIf: {};
                popIfUnsafe: {};
                clone: {};
                forEach: {};
                startIterating: {};
                startIteratingFromLast: {};
                toArrayUnconstrained: {};
                lengthUnconstrained: {};
                readonly Constructor: {
                    prototype: any;
                    create: {};
                    _nextHash: {} | null;
                    _emptyHash: string | null;
                    _provable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    _innerProvable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    readonly emptyHash: string;
                };
                nextHash: {};
                readonly innerProvable: {
                    toFields: {};
                    toAuxiliary: {};
                    fromFields: {};
                    sizeInFields: {};
                    check: {};
                    toValue: {};
                    fromValue: {};
                    toCanonical?: {} | null | undefined;
                    toInput: {};
                    empty: {};
                };
            };
            create: {};
            _nextHash: {} | null;
            _emptyHash: string | null;
            _provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            _innerProvable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            readonly emptyHash: string;
            empty: {};
            from: {};
            fromReverse: {};
            provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            };
        };
        isRecursive: boolean;
        witnesses: {
            toFields: {};
            toAuxiliary: {};
            fromFields: {};
            sizeInFields: {};
            check: {};
            toValue: {};
            fromValue: {};
            toCanonical?: {} | null | undefined;
            toInput: {};
            empty: {};
        };
    };
    fromJSON: (x: {
        useOnchainStack: boolean;
        processedActionState: string;
        onchainActionState: string;
        onchainStack: string;
        stack: {
            prototype: {
                hash: string;
                data: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                isEmpty: {};
                push: {};
                pushIf: {};
                popExn: {};
                pop: {};
                popIf: {};
                popIfUnsafe: {};
                clone: {};
                forEach: {};
                startIterating: {};
                startIteratingFromLast: {};
                toArrayUnconstrained: {};
                lengthUnconstrained: {};
                readonly Constructor: {
                    prototype: any;
                    create: {};
                    _nextHash: {} | null;
                    _emptyHash: string | null;
                    _provable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    _innerProvable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    readonly emptyHash: string;
                };
                nextHash: {};
                readonly innerProvable: {
                    toFields: {};
                    toAuxiliary: {};
                    fromFields: {};
                    sizeInFields: {};
                    check: {};
                    toValue: {};
                    fromValue: {};
                    toCanonical?: {} | null | undefined;
                    toInput: {};
                    empty: {};
                };
            };
            create: {};
            _nextHash: {} | null;
            _emptyHash: string | null;
            _provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            _innerProvable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            readonly emptyHash: string;
            empty: {};
            from: {};
            fromReverse: {};
            provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            };
        };
        isRecursive: boolean;
        witnesses: {
            toFields: {};
            toAuxiliary: {};
            fromFields: {};
            sizeInFields: {};
            check: {};
            toValue: {};
            fromValue: {};
            toCanonical?: {} | null | undefined;
            toInput: {};
            empty: {};
        };
    }) => {
        useOnchainStack: import("../../provable/bool.js").Bool;
        processedActionState: import("../../provable/field.js").Field;
        onchainActionState: import("../../provable/field.js").Field;
        onchainStack: import("../../provable/field.js").Field;
        stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
        isRecursive: import("../../provable/bool.js").Bool;
        witnesses: Unconstrained<ActionWitnesses>;
    };
    empty: () => {
        useOnchainStack: import("../../provable/bool.js").Bool;
        processedActionState: import("../../provable/field.js").Field;
        onchainActionState: import("../../provable/field.js").Field;
        onchainStack: import("../../provable/field.js").Field;
        stack: import("../../provable/merkle-list.js").MerkleList<import("../../provable/merkle-list.js").MerkleList<import("../../provable/packed.js").Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
        isRecursive: import("../../provable/bool.js").Bool;
        witnesses: Unconstrained<ActionWitnesses>;
    };
};
declare function proveActionStack(endActionState: bigint | Field, actions: ActionWitnesses, program: ActionStackProgram): Promise<{
    isEmpty: Bool;
    proof: ActionStackProof;
}>;
declare const ActionStackState_base: (new (value: {
    actions: import("../../provable/field.js").Field;
    stack: import("../../provable/field.js").Field;
}) => {
    actions: import("../../provable/field.js").Field;
    stack: import("../../provable/field.js").Field;
}) & {
    _isStruct: true;
} & Omit<import("../../provable/types/provable-intf.js").Provable<{
    actions: import("../../provable/field.js").Field;
    stack: import("../../provable/field.js").Field;
}, {
    actions: bigint;
    stack: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("../../provable/field.js").Field[]) => {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    };
} & {
    fromValue: (value: {
        actions: string | number | bigint | import("../../provable/field.js").Field;
        stack: string | number | bigint | import("../../provable/field.js").Field;
    }) => {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    };
    toInput: (x: {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    }) => {
        actions: string;
        stack: string;
    };
    fromJSON: (x: {
        actions: string;
        stack: string;
    }) => {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    };
    empty: () => {
        actions: import("../../provable/field.js").Field;
        stack: import("../../provable/field.js").Field;
    };
};
/**
 * Intermediate result of popping from a list of actions and stacking them in reverse order.
 */
declare class ActionStackState extends ActionStackState_base {
}
type ActionStackProof = Proof<Field, ActionStackState>;
type ActionWitnesses = ({
    hash: bigint;
    stateBefore: bigint;
} | undefined)[];
type ActionStackProgram = {
    name: string;
    publicInputType: typeof Field;
    publicOutputType: typeof ActionStackState;
    compile(): Promise<{
        verificationKey: {
            data: string;
            hash: Field;
        };
    }>;
    proveChunk(input: Field, proofSoFar: ActionStackProof, isRecursive: Bool, actionWitnesses: Unconstrained<ActionWitnesses>): Promise<{
        proof: ActionStackProof;
    }>;
    maxUpdatesPerProof: number;
};
/**
 * Create program that pops actions from a hash list and pushes them to a new list in reverse order.
 */
declare function actionStackProgram(maxUpdatesPerProof: number): {
    name: string;
    compile: (options?: {
        cache?: import("../../proof-system/cache.js").Cache | undefined;
        forceRecompile?: boolean | undefined;
        proofsEnabled?: boolean | undefined;
    } | undefined) => Promise<{
        verificationKey: {
            data: string;
            hash: import("../../provable/field.js").Field;
        };
    }>;
    verify: (proof: Proof<import("../../provable/field.js").Field, ActionStackState>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        proveChunk: {
            rows: number;
            digest: string;
            gates: import("../../../snarky.js").Gate[];
            publicInputSize: number;
            print(): void;
            summary(): Partial<Record<import("../../../snarky.js").GateType | "Total rows", number>>;
        };
    }>;
    publicInputType: typeof import("../../provable/field.js").Field & ((x: string | number | bigint | import("../../provable/core/fieldvar.js").FieldConst | import("../../provable/core/fieldvar.js").FieldVar | import("../../provable/field.js").Field) => import("../../provable/field.js").Field);
    publicOutputType: typeof ActionStackState;
    privateInputTypes: {
        proveChunk: [typeof SelfProof, typeof import("../../provable/bool.js").Bool & ((x: boolean | import("../../provable/core/fieldvar.js").FieldVar | import("../../provable/bool.js").Bool) => import("../../provable/bool.js").Bool), Provable<Unconstrained<ActionWitnesses>, ActionWitnesses> & {
            toInput: (x: Unconstrained<ActionWitnesses>) => {
                fields?: import("../../provable/field.js").Field[] | undefined;
                packed?: [import("../../provable/field.js").Field, number][] | undefined;
            };
            empty: () => Unconstrained<ActionWitnesses>;
        }];
    };
    auxiliaryOutputTypes: {
        proveChunk: undefined;
    };
    rawMethods: {
        proveChunk: (publicInput: import("../../provable/field.js").Field, ...args: [SelfProof<unknown, unknown>, import("../../provable/bool.js").Bool, Unconstrained<ActionWitnesses>] & any[]) => Promise<{
            publicOutput: ActionStackState;
        }>;
    };
    proofsEnabled: boolean;
    setProofsEnabled(proofsEnabled: boolean): void;
} & {
    proveChunk: (publicInput: import("../../provable/field.js").Field, ...args: [SelfProof<unknown, unknown>, import("../../provable/bool.js").Bool, Unconstrained<ActionWitnesses>] & any[]) => Promise<{
        proof: Proof<import("../../provable/field.js").Field, ActionStackState>;
        auxiliaryOutput: undefined;
    }>;
} & {
    maxUpdatesPerProof: number;
};
