import { Proof } from '../../proof-system/proof.js';
import { MerkleList, MerkleListIterator } from '../../provable/merkle-list.js';
import { IndexedMerkleMapBase } from '../../provable/merkle-tree-indexed.js';
import { SelfProof } from '../../proof-system/zkprogram.js';
import { Provable } from '../../provable/provable.js';
import { MerkleLeaf } from './offchain-state-serialization.js';
import { Cache } from '../../../lib/proof-system/cache.js';
export { OffchainStateRollup, OffchainStateCommitments };
declare const ActionIterator_base: {
    new (value: import("../../provable/merkle-list.js").MerkleListIteratorBase<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>): MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
    create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleListIterator<T> & {
        from: (array: T[]) => MerkleListIterator<T>;
        startIterating: (list: import("../../provable/merkle-list.js").MerkleListBase<T>) => MerkleListIterator<T>;
        startIteratingFromLast: (list: import("../../provable/merkle-list.js").MerkleListBase<T>) => MerkleListIterator<T>;
        empty: () => MerkleListIterator<T>;
        provable: import("../../../index.js").ProvableHashable<MerkleListIterator<T>>;
    };
    createFromList<T_1>(merkleList: {
        new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<T_1>): MerkleList<T_1>;
        create<T_2>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T_2>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T_2) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): {
            new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<T_2>): MerkleList<T_2>;
            create<T_2>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T_2>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T_2) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): any & {
                empty: () => MerkleList<T_2>;
                from: (array: T_2[]) => MerkleList<T_2>;
                fromReverse: (array: T_2[]) => MerkleList<T_2>;
                provable: import("../../../index.js").ProvableHashable<MerkleList<T_2>>;
            };
            _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
            _emptyHash: import("../../provable/field.js").Field | undefined;
            _provable: import("../../../index.js").ProvableHashable<MerkleList<any>> | undefined;
            _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
            readonly emptyHash: import("../../provable/field.js").Field;
        } & {
            empty: () => MerkleList<T_2>;
            from: (array: T_2[]) => MerkleList<T_2>;
            fromReverse: (array: T_2[]) => MerkleList<T_2>;
            provable: import("../../../index.js").ProvableHashable<MerkleList<T_2>>;
        };
        _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
        _emptyHash: import("../../provable/field.js").Field | undefined;
        _provable: import("../../../index.js").ProvableHashable<MerkleList<any>> | undefined;
        _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
        readonly emptyHash: import("../../provable/field.js").Field;
    }): {
        new (value: import("../../provable/merkle-list.js").MerkleListIteratorBase<T_1>): MerkleListIterator<T_1>;
        create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleListIterator<T> & {
            from: (array: T[]) => MerkleListIterator<T>;
            startIterating: (list: import("../../provable/merkle-list.js").MerkleListBase<T>) => MerkleListIterator<T>;
            startIteratingFromLast: (list: import("../../provable/merkle-list.js").MerkleListBase<T>) => MerkleListIterator<T>;
            empty: () => MerkleListIterator<T>;
            provable: import("../../../index.js").ProvableHashable<MerkleListIterator<T>>;
        };
        createFromList<T_1>(merkleList: {
            new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<T_1>): MerkleList<T_1>;
            create<T_2>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T_2>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T_2) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): {
                new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<T_2>): MerkleList<T_2>;
                create<T_2>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../../index.js").ProvableHashable<T_2>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T_2) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): any & {
                    empty: () => MerkleList<T_2>;
                    from: (array: T_2[]) => MerkleList<T_2>;
                    fromReverse: (array: T_2[]) => MerkleList<T_2>;
                    provable: import("../../../index.js").ProvableHashable<MerkleList<T_2>>;
                };
                _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
                _emptyHash: import("../../provable/field.js").Field | undefined;
                _provable: import("../../../index.js").ProvableHashable<MerkleList<any>> | undefined;
                _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
                readonly emptyHash: import("../../provable/field.js").Field;
            } & {
                empty: () => MerkleList<T_2>;
                from: (array: T_2[]) => MerkleList<T_2>;
                fromReverse: (array: T_2[]) => MerkleList<T_2>;
                provable: import("../../../index.js").ProvableHashable<MerkleList<T_2>>;
            };
            _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
            _emptyHash: import("../../provable/field.js").Field | undefined;
            _provable: import("../../../index.js").ProvableHashable<MerkleList<any>> | undefined;
            _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
            readonly emptyHash: import("../../provable/field.js").Field;
        }): any & {
            from: (array: T_1[]) => MerkleListIterator<T_1>;
            startIterating: (list: import("../../provable/merkle-list.js").MerkleListBase<T_1>) => MerkleListIterator<T_1>;
            startIteratingFromLast: (list: import("../../provable/merkle-list.js").MerkleListBase<T_1>) => MerkleListIterator<T_1>;
            empty: () => MerkleListIterator<T_1>;
            provable: import("../../../index.js").ProvableHashable<MerkleListIterator<T_1>>;
        };
        _nextHash: ((hash: import("../../provable/field.js").Field, value: any) => import("../../provable/field.js").Field) | undefined;
        _emptyHash: import("../../provable/field.js").Field | undefined;
        _provable: import("../../../index.js").ProvableHashable<MerkleListIterator<any>> | undefined;
        _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
        readonly emptyHash: import("../../provable/field.js").Field;
    } & {
        from: (array: T_1[]) => MerkleListIterator<T_1>;
        startIterating: (list: import("../../provable/merkle-list.js").MerkleListBase<T_1>) => MerkleListIterator<T_1>;
        startIteratingFromLast: (list: import("../../provable/merkle-list.js").MerkleListBase<T_1>) => MerkleListIterator<T_1>;
        empty: () => MerkleListIterator<T_1>;
        provable: import("../../../index.js").ProvableHashable<MerkleListIterator<T_1>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, value: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: import("../../../index.js").ProvableHashable<MerkleListIterator<any>> | undefined;
    _innerProvable: import("../../../index.js").ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    from: (array: MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>[]) => MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
    startIterating: (list: import("../../provable/merkle-list.js").MerkleListBase<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>) => MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
    startIteratingFromLast: (list: import("../../provable/merkle-list.js").MerkleListBase<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>) => MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
    empty: () => MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
    provable: import("../../../index.js").ProvableHashable<MerkleListIterator<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
    }>>>;
};
declare class ActionIterator extends ActionIterator_base {
}
declare const OffchainStateCommitments_base: (new (value: {
    root: import("../../provable/field.js").Field;
    length: import("../../provable/field.js").Field;
    actionState: import("../../provable/field.js").Field;
}) => {
    root: import("../../provable/field.js").Field;
    length: import("../../provable/field.js").Field;
    actionState: import("../../provable/field.js").Field;
}) & {
    _isStruct: true;
} & Omit<import("../../provable/types/provable-intf.js").Provable<{
    root: import("../../provable/field.js").Field;
    length: import("../../provable/field.js").Field;
    actionState: import("../../provable/field.js").Field;
}, {
    root: bigint;
    length: bigint;
    actionState: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("../../provable/field.js").Field[]) => {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    };
} & {
    fromValue: (value: {
        root: string | number | bigint | import("../../provable/field.js").Field;
        length: string | number | bigint | import("../../provable/field.js").Field;
        actionState: string | number | bigint | import("../../provable/field.js").Field;
    }) => {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    };
    toInput: (x: {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    }) => {
        root: string;
        length: string;
        actionState: string;
    };
    fromJSON: (x: {
        root: string;
        length: string;
        actionState: string;
    }) => {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    };
    empty: () => {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        actionState: import("../../provable/field.js").Field;
    };
};
/**
 * Commitments that keep track of the current state of an offchain Merkle tree constructed from actions.
 * Intended to be stored on-chain.
 *
 * Fields:
 * - `root`: The root of the current Merkle tree
 * - `length`: The number of elements in the current Merkle tree
 * - `actionState`: The hash pointing to the list of actions that have been applied to form the current Merkle tree
 */
declare class OffchainStateCommitments extends OffchainStateCommitments_base {
    static emptyFromHeight(height: number): OffchainStateCommitments;
}
/**
 * This program represents a proof that we can go from OffchainStateCommitments A -> B
 */
declare function OffchainStateRollup({ 
/**
 * the constraints used in one batch proof with a height-31 tree are:
 *
 * 1967*A + 87*A*U + 2
 *
 * where A = maxActionsPerProof and U = maxActionsPerUpdate.
 *
 * To determine defaults, we set U=4 which should cover most use cases while ensuring
 * that the main loop which is independent of U dominates.
 *
 * Targeting ~50k constraints, to leave room for recursive verification, yields A=22.
 */
maxActionsPerProof, maxActionsPerUpdate, logTotalCapacity, }?: {
    maxActionsPerProof?: number | undefined;
    maxActionsPerUpdate?: number | undefined;
    logTotalCapacity?: number | undefined;
}): {
    Proof: {
        new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
            proof: unknown;
            publicInput: OffchainStateCommitments;
            publicOutput: OffchainStateCommitments;
            maxProofsVerified: 0 | 2 | 1;
        }): Proof<OffchainStateCommitments, OffchainStateCommitments>;
        fromJSON<S extends import("../../util/types.js").Subclass<typeof Proof>>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("../../proof-system/zkprogram.js").JsonProof): Promise<Proof<import("../../provable/types/provable-derivers.js").InferProvable<S["publicInputType"]>, import("../../provable/types/provable-derivers.js").InferProvable<S["publicOutputType"]>>>;
        dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 2 | 1, domainLog2?: number): Promise<Proof<Input, OutPut>>;
        readonly provable: {
            toFields: (value: Proof<any, any>) => import("../../provable/field.js").Field[];
            toAuxiliary: (value?: Proof<any, any> | undefined) => any[];
            fromFields: (fields: import("../../provable/field.js").Field[], aux: any[]) => Proof<any, any>;
            sizeInFields(): number;
            check: (value: Proof<any, any>) => void;
            toValue: (x: Proof<any, any>) => import("../../proof-system/proof.js").ProofValue<any, any>;
            fromValue: (x: Proof<any, any> | import("../../proof-system/proof.js").ProofValue<any, any>) => Proof<any, any>;
            toCanonical?: ((x: Proof<any, any>) => Proof<any, any>) | undefined;
        };
        publicInputType: import("../../provable/types/struct.js").FlexibleProvablePure<any>;
        publicOutputType: import("../../provable/types/struct.js").FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
        publicFields(value: import("../../proof-system/proof.js").ProofBase<any, any>): {
            input: import("../../provable/field.js").Field[];
            output: import("../../provable/field.js").Field[];
        };
    } & {
        provable: Provable<Proof<OffchainStateCommitments, OffchainStateCommitments>, import("../../proof-system/proof.js").ProofValue<{
            root: bigint;
            length: bigint;
            actionState: bigint;
        }, {
            root: bigint;
            length: bigint;
            actionState: bigint;
        }>>;
    };
    program: {
        name: string;
        compile: (options?: {
            cache?: Cache | undefined;
            forceRecompile?: boolean | undefined;
            proofsEnabled?: boolean | undefined;
        } | undefined) => Promise<{
            verificationKey: {
                data: string;
                hash: import("../../provable/field.js").Field;
            };
        }>;
        verify: (proof: Proof<OffchainStateCommitments, OffchainStateCommitments>) => Promise<boolean>;
        digest: () => Promise<string>;
        analyzeMethods: () => Promise<{
            firstBatch: {
                rows: number;
                digest: string;
                gates: import("../../../snarky.js").Gate[];
                publicInputSize: number;
                print(): void;
                summary(): Partial<Record<import("../../../snarky.js").GateType | "Total rows", number>>;
            };
            nextBatch: {
                rows: number;
                digest: string;
                gates: import("../../../snarky.js").Gate[];
                publicInputSize: number;
                print(): void;
                summary(): Partial<Record<import("../../../snarky.js").GateType | "Total rows", number>>;
            };
        }>;
        publicInputType: typeof OffchainStateCommitments;
        publicOutputType: typeof OffchainStateCommitments;
        privateInputTypes: {
            firstBatch: [typeof ActionIterator, {
                new (): {
                    root: import("../../provable/field.js").Field;
                    length: import("../../provable/field.js").Field;
                    readonly height: number;
                    readonly data: import("../../../index.js").Unconstrained<{
                        readonly nodes: (bigint | undefined)[][];
                        readonly sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    }>;
                    clone(): IndexedMerkleMapBase;
                    overwrite(other: IndexedMerkleMapBase): void;
                    overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
                    insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
                    update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
                    _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
                    _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveUpdate(leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, path: {
                        index: import("../../provable/bool.js").Bool[];
                        witness: import("../../provable/field.js").Field[];
                    }): import("../../provable/field.js").Field;
                    _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
                        root: import("../../provable/field.js").Field;
                        path: {
                            witness: import("../../provable/field.js").Field[];
                            index: import("../../provable/bool.js").Bool[];
                        };
                    };
                    _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
                        low: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                        self: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                    };
                    _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
                };
                provable: Provable<IndexedMerkleMapBase, {
                    root: bigint;
                    length: bigint;
                    data: {
                        nodes: (bigint | undefined)[][];
                        sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    };
                }>;
                _firstLeaf: {
                    key: bigint;
                    value: bigint;
                    nextKey: bigint;
                    index: number;
                };
            }];
            nextBatch: [typeof ActionIterator, {
                new (): {
                    root: import("../../provable/field.js").Field;
                    length: import("../../provable/field.js").Field;
                    readonly height: number;
                    readonly data: import("../../../index.js").Unconstrained<{
                        readonly nodes: (bigint | undefined)[][];
                        readonly sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    }>;
                    clone(): IndexedMerkleMapBase;
                    overwrite(other: IndexedMerkleMapBase): void;
                    overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
                    insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
                    update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
                    _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
                    _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveUpdate(leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, path: {
                        index: import("../../provable/bool.js").Bool[];
                        witness: import("../../provable/field.js").Field[];
                    }): import("../../provable/field.js").Field;
                    _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
                        root: import("../../provable/field.js").Field;
                        path: {
                            witness: import("../../provable/field.js").Field[];
                            index: import("../../provable/bool.js").Bool[];
                        };
                    };
                    _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
                        low: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                        self: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                    };
                    _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
                };
                provable: Provable<IndexedMerkleMapBase, {
                    root: bigint;
                    length: bigint;
                    data: {
                        nodes: (bigint | undefined)[][];
                        sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    };
                }>;
                _firstLeaf: {
                    key: bigint;
                    value: bigint;
                    nextKey: bigint;
                    index: number;
                };
            }, typeof SelfProof];
        };
        auxiliaryOutputTypes: {
            firstBatch: {
                new (): {
                    root: import("../../provable/field.js").Field;
                    length: import("../../provable/field.js").Field;
                    readonly height: number;
                    readonly data: import("../../../index.js").Unconstrained<{
                        readonly nodes: (bigint | undefined)[][];
                        readonly sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    }>;
                    clone(): IndexedMerkleMapBase;
                    overwrite(other: IndexedMerkleMapBase): void;
                    overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
                    insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
                    update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
                    _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
                    _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveUpdate(leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, path: {
                        index: import("../../provable/bool.js").Bool[];
                        witness: import("../../provable/field.js").Field[];
                    }): import("../../provable/field.js").Field;
                    _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
                        root: import("../../provable/field.js").Field;
                        path: {
                            witness: import("../../provable/field.js").Field[];
                            index: import("../../provable/bool.js").Bool[];
                        };
                    };
                    _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
                        low: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                        self: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                    };
                    _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
                };
                provable: Provable<IndexedMerkleMapBase, {
                    root: bigint;
                    length: bigint;
                    data: {
                        nodes: (bigint | undefined)[][];
                        sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    };
                }>;
                _firstLeaf: {
                    key: bigint;
                    value: bigint;
                    nextKey: bigint;
                    index: number;
                };
            };
            nextBatch: {
                new (): {
                    root: import("../../provable/field.js").Field;
                    length: import("../../provable/field.js").Field;
                    readonly height: number;
                    readonly data: import("../../../index.js").Unconstrained<{
                        readonly nodes: (bigint | undefined)[][];
                        readonly sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    }>;
                    clone(): IndexedMerkleMapBase;
                    overwrite(other: IndexedMerkleMapBase): void;
                    overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
                    insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
                    update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
                    getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
                    assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
                    isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
                    _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
                    _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, message?: string | undefined): {
                        witness: import("../../provable/field.js").Field[];
                        index: import("../../provable/bool.js").Bool[];
                    };
                    _proveUpdate(leaf: {
                        key: import("../../provable/field.js").Field;
                        value: import("../../provable/field.js").Field;
                        nextKey: import("../../provable/field.js").Field;
                    }, path: {
                        index: import("../../provable/bool.js").Bool[];
                        witness: import("../../provable/field.js").Field[];
                    }): import("../../provable/field.js").Field;
                    _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
                        root: import("../../provable/field.js").Field;
                        path: {
                            witness: import("../../provable/field.js").Field[];
                            index: import("../../provable/bool.js").Bool[];
                        };
                    };
                    _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
                        low: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                        self: {
                            value: bigint;
                            key: bigint;
                            nextKey: bigint;
                            index: number;
                            sortedIndex: number;
                        };
                    };
                    _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
                };
                provable: Provable<IndexedMerkleMapBase, {
                    root: bigint;
                    length: bigint;
                    data: {
                        nodes: (bigint | undefined)[][];
                        sortedLeaves: {
                            readonly value: bigint;
                            readonly key: bigint;
                            readonly nextKey: bigint;
                            readonly index: number;
                        }[];
                    };
                }>;
                _firstLeaf: {
                    key: bigint;
                    value: bigint;
                    nextKey: bigint;
                    index: number;
                };
            };
        };
        rawMethods: {
            firstBatch: (publicInput: OffchainStateCommitments, ...args: [MerkleListIterator<MerkleList<{
                key: import("../../provable/field.js").Field;
                value: import("../../provable/field.js").Field;
                usesPreviousValue: import("../../provable/bool.js").Bool;
                previousValue: import("../../provable/field.js").Field;
                prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
            }>>, IndexedMerkleMapBase] & any[]) => Promise<{
                publicOutput: OffchainStateCommitments;
                auxiliaryOutput: IndexedMerkleMapBase;
            }>;
            nextBatch: (publicInput: OffchainStateCommitments, ...args: [MerkleListIterator<MerkleList<{
                key: import("../../provable/field.js").Field;
                value: import("../../provable/field.js").Field;
                usesPreviousValue: import("../../provable/bool.js").Bool;
                previousValue: import("../../provable/field.js").Field;
                prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
            }>>, IndexedMerkleMapBase, SelfProof<unknown, unknown>] & any[]) => Promise<{
                publicOutput: OffchainStateCommitments;
                auxiliaryOutput: IndexedMerkleMapBase;
            }>;
        };
        proofsEnabled: boolean;
        setProofsEnabled(proofsEnabled: boolean): void;
    } & {
        firstBatch: (publicInput: OffchainStateCommitments, ...args: [MerkleListIterator<MerkleList<{
            key: import("../../provable/field.js").Field;
            value: import("../../provable/field.js").Field;
            usesPreviousValue: import("../../provable/bool.js").Bool;
            previousValue: import("../../provable/field.js").Field;
            prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
        }>>, IndexedMerkleMapBase] & any[]) => Promise<{
            proof: Proof<OffchainStateCommitments, OffchainStateCommitments>;
            auxiliaryOutput: IndexedMerkleMapBase;
        }>;
        nextBatch: (publicInput: OffchainStateCommitments, ...args: [MerkleListIterator<MerkleList<{
            key: import("../../provable/field.js").Field;
            value: import("../../provable/field.js").Field;
            usesPreviousValue: import("../../provable/bool.js").Bool;
            previousValue: import("../../provable/field.js").Field;
            prefix: import("../../../index.js").Unconstrained<import("../../provable/field.js").Field[]>;
        }>>, IndexedMerkleMapBase, SelfProof<unknown, unknown>] & any[]) => Promise<{
            proof: Proof<OffchainStateCommitments, OffchainStateCommitments>;
            auxiliaryOutput: IndexedMerkleMapBase;
        }>;
    };
    compile(options?: {
        cache?: Cache;
        forceRecompile?: boolean;
        proofsEnabled?: boolean;
    }): Promise<{
        verificationKey: {
            data: string;
            hash: import("../../provable/field.js").Field;
        };
    } | undefined>;
    prove(tree: {
        root: import("../../provable/field.js").Field;
        length: import("../../provable/field.js").Field;
        readonly height: number;
        readonly data: import("../../../index.js").Unconstrained<{
            readonly nodes: (bigint | undefined)[][];
            readonly sortedLeaves: {
                readonly value: bigint;
                readonly key: bigint;
                readonly nextKey: bigint;
                readonly index: number;
            }[];
        }>;
        clone(): IndexedMerkleMapBase;
        overwrite(other: IndexedMerkleMapBase): void;
        overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
        insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
        update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
        set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
        setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
        get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
        getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
        assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
        assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
        isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
        _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
            witness: import("../../provable/field.js").Field[];
            index: import("../../provable/bool.js").Bool[];
        };
        _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
        _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
            witness: import("../../provable/field.js").Field[];
            index: import("../../provable/bool.js").Bool[];
        };
        _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
            key: import("../../provable/field.js").Field;
            value: import("../../provable/field.js").Field;
            nextKey: import("../../provable/field.js").Field;
        }, message?: string | undefined): {
            witness: import("../../provable/field.js").Field[];
            index: import("../../provable/bool.js").Bool[];
        };
        _proveUpdate(leaf: {
            key: import("../../provable/field.js").Field;
            value: import("../../provable/field.js").Field;
            nextKey: import("../../provable/field.js").Field;
        }, path: {
            index: import("../../provable/bool.js").Bool[];
            witness: import("../../provable/field.js").Field[];
        }): import("../../provable/field.js").Field;
        _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
            root: import("../../provable/field.js").Field;
            path: {
                witness: import("../../provable/field.js").Field[];
                index: import("../../provable/bool.js").Bool[];
            };
        };
        _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
            low: {
                value: bigint;
                key: bigint;
                nextKey: bigint;
                index: number;
                sortedIndex: number;
            };
            self: {
                value: bigint;
                key: bigint;
                nextKey: bigint;
                index: number;
                sortedIndex: number;
            };
        };
        _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
    }, actions: MerkleList<MerkleList<MerkleLeaf>>): Promise<{
        proof: Proof<OffchainStateCommitments, OffchainStateCommitments>;
        tree: {
            root: import("../../provable/field.js").Field;
            length: import("../../provable/field.js").Field;
            readonly height: number;
            readonly data: import("../../../index.js").Unconstrained<{
                readonly nodes: (bigint | undefined)[][];
                readonly sortedLeaves: {
                    readonly value: bigint;
                    readonly key: bigint;
                    readonly nextKey: bigint;
                    readonly index: number;
                }[];
            }>;
            clone(): IndexedMerkleMapBase;
            overwrite(other: IndexedMerkleMapBase): void;
            overwriteIf(condition: boolean | import("../../provable/bool.js").Bool, other: IndexedMerkleMapBase): void;
            insert(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): void;
            update(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
            set(key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
            setIf(condition: boolean | import("../../provable/bool.js").Bool, key: bigint | import("../../provable/field.js").Field, value: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
            get(key: bigint | import("../../provable/field.js").Field): import("../../provable/field.js").Field;
            getOption(key: bigint | import("../../provable/field.js").Field): import("../../provable/option.js").Option<import("../../provable/field.js").Field, bigint>;
            assertIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
            assertNotIncluded(key: bigint | import("../../provable/field.js").Field, message?: string | undefined): void;
            isIncluded(key: bigint | import("../../provable/field.js").Field): import("../../provable/bool.js").Bool;
            _proveInclusion(leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): {
                witness: import("../../provable/field.js").Field[];
                index: import("../../provable/bool.js").Bool[];
            };
            _proveInclusionIf(condition: import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf, message?: string | undefined): void;
            _proveEmpty(index: import("../../provable/bool.js").Bool[]): {
                witness: import("../../provable/field.js").Field[];
                index: import("../../provable/bool.js").Bool[];
            };
            _proveInclusionOrEmpty(condition: import("../../provable/bool.js").Bool, index: import("../../provable/bool.js").Bool[], leaf: {
                key: import("../../provable/field.js").Field;
                value: import("../../provable/field.js").Field;
                nextKey: import("../../provable/field.js").Field;
            }, message?: string | undefined): {
                witness: import("../../provable/field.js").Field[];
                index: import("../../provable/bool.js").Bool[];
            };
            _proveUpdate(leaf: {
                key: import("../../provable/field.js").Field;
                value: import("../../provable/field.js").Field;
                nextKey: import("../../provable/field.js").Field;
            }, path: {
                index: import("../../provable/bool.js").Bool[];
                witness: import("../../provable/field.js").Field[];
            }): import("../../provable/field.js").Field;
            _computeRoot(node: import("../../provable/field.js").Field, index: import("../../provable/bool.js").Bool[] | import("../../../index.js").Unconstrained<number>, witness?: import("../../provable/field.js").Field[] | undefined): {
                root: import("../../provable/field.js").Field;
                path: {
                    witness: import("../../provable/field.js").Field[];
                    index: import("../../provable/bool.js").Bool[];
                };
            };
            _findLeaf(key_: bigint | import("../../provable/field.js").Field): {
                low: {
                    value: bigint;
                    key: bigint;
                    nextKey: bigint;
                    index: number;
                    sortedIndex: number;
                };
                self: {
                    value: bigint;
                    key: bigint;
                    nextKey: bigint;
                    index: number;
                    sortedIndex: number;
                };
            };
            _setLeafUnconstrained(leafExists: boolean | import("../../provable/bool.js").Bool, leaf: import("../../provable/merkle-tree-indexed.js").Leaf): void;
        };
        nProofs: number;
    }>;
};
