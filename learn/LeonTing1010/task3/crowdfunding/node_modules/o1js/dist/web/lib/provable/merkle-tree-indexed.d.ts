import { Bool, Field } from './wrapped.js';
import { Option } from './option.js';
import { From, InferValue } from '../../bindings/lib/provable-generic.js';
import { Unconstrained } from './types/unconstrained.js';
import { Provable } from './provable.js';
export { IndexedMerkleMap, IndexedMerkleMapBase };
export { Leaf };
/**
 * Class factory for an Indexed Merkle Map with a given height.
 *
 * ```ts
 * class MerkleMap extends IndexedMerkleMap(33) {}
 *
 * let map = new MerkleMap();
 *
 * map.insert(2n, 14n);
 * map.insert(1n, 13n);
 *
 * let x = map.get(2n); // 14
 * ```
 *
 * Indexed Merkle maps can be used directly in provable code:
 *
 * ```ts
 * ZkProgram({
 *   methods: {
 *     test: {
 *       privateInputs: [MerkleMap, Field],
 *
 *       method(map: MerkleMap, key: Field) {
 *         // get the value associated with `key`
 *         let value = map.getOption(key).orElse(0n);
 *
 *         // increment the value by 1
 *         map.set(key, value.add(1));
 *       }
 *     }
 *   }
 * })
 * ```
 *
 * Initially, every `IndexedMerkleMap` is populated by a single key-value pair: `(0, 0)`. The value for key `0` can be updated like any other.
 * When keys and values are hash outputs, `(0, 0)` can serve as a convenient way to represent a dummy update to the tree, since 0 is not
 * effciently computable as a hash image, and this update doesn't affect the Merkle root.
 */
declare function IndexedMerkleMap(height: number): typeof IndexedMerkleMapBase;
declare const provableBase: {
    root: typeof import("./field.js").Field & ((x: string | number | bigint | import("./core/fieldvar.js").FieldConst | import("./core/fieldvar.js").FieldVar | import("./field.js").Field) => import("./field.js").Field);
    length: typeof import("./field.js").Field & ((x: string | number | bigint | import("./core/fieldvar.js").FieldConst | import("./core/fieldvar.js").FieldVar | import("./field.js").Field) => import("./field.js").Field);
    data: Provable<Unconstrained<{
        nodes: (bigint | undefined)[][];
        sortedLeaves: StoredLeaf[];
    }>, {
        nodes: (bigint | undefined)[][];
        sortedLeaves: StoredLeaf[];
    }> & {
        toInput: (x: Unconstrained<{
            nodes: (bigint | undefined)[][];
            sortedLeaves: StoredLeaf[];
        }>) => {
            fields?: import("./field.js").Field[] | undefined;
            packed?: [import("./field.js").Field, number][] | undefined;
        };
        empty: () => Unconstrained<{
            nodes: (bigint | undefined)[][];
            sortedLeaves: StoredLeaf[];
        }>;
    };
};
declare class IndexedMerkleMapBase {
    root: Field;
    length: Field;
    get height(): number;
    readonly data: Unconstrained<{
        readonly nodes: (bigint | undefined)[][];
        readonly sortedLeaves: StoredLeaf[];
    }>;
    static provable: Provable<IndexedMerkleMapBase, InferValue<typeof provableBase>>;
    /**
     * Creates a new, empty Indexed Merkle Map.
     */
    constructor();
    static _firstLeaf: {
        key: bigint;
        value: bigint;
        nextKey: bigint;
        index: number;
    };
    /**
     * Clone the entire Merkle map.
     *
     * This method is provable.
     */
    clone(): IndexedMerkleMapBase;
    /**
     * Overwrite the entire Merkle map with another one.
     *
     * This method is provable.
     */
    overwrite(other: IndexedMerkleMapBase): void;
    /**
     * Overwrite the entire Merkle map with another one, if the condition is true.
     *
     * This method is provable.
     */
    overwriteIf(condition: Bool | boolean, other: IndexedMerkleMapBase): void;
    /**
     * Insert a new leaf `(key, value)`.
     *
     * Proves that `key` doesn't exist yet.
     */
    insert(key: Field | bigint, value: Field | bigint): void;
    /**
     * Update an existing leaf `(key, value)`.
     *
     * Proves that the `key` exists.
     *
     * Returns the previous value.
     */
    update(key: Field | bigint, value: Field | bigint): Field;
    /**
     * Perform _either_ an insertion or update, depending on whether the key exists.
     *
     * Note: This method is handling both the `insert()` and `update()` case at the same time, so you
     * can use it if you don't know whether the key exists or not.
     *
     * However, this comes at an efficiency cost, so prefer to use `insert()` or `update()` if you know whether the key exists.
     *
     * Returns the previous value, as an option (which is `None` if the key didn't exist before).
     */
    set(key: Field | bigint, value: Field | bigint): Option<Field, bigint>;
    /**
     * Perform an insertion or update, if the enabling condition is true.
     *
     * If the condition is false, we instead set the 0 key to the value 0.
     * This is the initial value and for typical uses of `IndexedMerkleMap`, it is guaranteed to be a no-op because the 0 key is never used.
     *
     * **Warning**: Only use this method if you are sure that the 0 key is not used in your application.
     * Otherwise, you might accidentally overwrite a valid key-value pair.
     */
    setIf(condition: Bool | boolean, key: Field | bigint, value: Field | bigint): Option<import("./field.js").Field, bigint>;
    /**
     * Get a value from a key.
     *
     * Proves that the key already exists in the map yet and fails otherwise.
     */
    get(key: Field | bigint): Field;
    /**
     * Get a value from a key.
     *
     * Returns an option which is `None` if the key doesn't exist. (In that case, the option's value is unconstrained.)
     *
     * Note that this is more flexible than `get()` and allows you to handle the case where the key doesn't exist.
     * However, it uses about twice as many constraints for that reason.
     */
    getOption(key: Field | bigint): Option<Field, bigint>;
    /**
     * Prove that the given key exists in the map.
     */
    assertIncluded(key: Field | bigint, message?: string): void;
    /**
     * Prove that the given key does not exist in the map.
     */
    assertNotIncluded(key: Field | bigint, message?: string): void;
    /**
     * Check whether the given key exists in the map.
     */
    isIncluded(key: Field | bigint): Bool;
    /**
     * Helper method to prove inclusion of a leaf in the tree.
     */
    _proveInclusion(leaf: Leaf, message?: string): {
        witness: import("./field.js").Field[];
        index: import("./bool.js").Bool[];
    };
    /**
     * Helper method to conditionally prove inclusion of a leaf in the tree.
     */
    _proveInclusionIf(condition: Bool, leaf: Leaf, message?: string): void;
    /**
     * Helper method to prove inclusion of an empty leaf in the tree.
     *
     * This validates the path against the current root, so that we can use it to insert a new leaf.
     */
    _proveEmpty(index: Bool[]): {
        witness: import("./field.js").Field[];
        index: import("./bool.js").Bool[];
    };
    /**
     * Helper method to conditionally prove inclusion of a leaf in the tree.
     *
     * If the condition is false, we prove that the tree contains an empty leaf instead.
     */
    _proveInclusionOrEmpty(condition: Bool, index: Bool[], leaf: BaseLeaf, message?: string): {
        witness: import("./field.js").Field[];
        index: import("./bool.js").Bool[];
    };
    /**
     * Helper method to update the root against a previously validated path.
     *
     * Returns the new root.
     */
    _proveUpdate(leaf: BaseLeaf, path: {
        index: Bool[];
        witness: Field[];
    }): import("./field.js").Field;
    /**
     * Helper method to compute the root given a leaf node and its index.
     *
     * The index can be given as a `Field` or as an array of bits.
     */
    _computeRoot(node: Field, index: Unconstrained<number> | Bool[], witness?: Field[]): {
        root: import("./field.js").Field;
        path: {
            witness: import("./field.js").Field[];
            index: import("./bool.js").Bool[];
        };
    };
    /**
     * Given a key, returns both the low node and the leaf that contains the key.
     *
     * If the key does not exist, a dummy value is returned for the leaf.
     *
     * Can only be called outside provable code.
     */
    _findLeaf(key_: Field | bigint): InferValue<typeof LeafPair>;
    /**
     * Update or append a leaf in our internal data structures
     */
    _setLeafUnconstrained(leafExists: Bool | boolean, leaf: Leaf): void;
}
declare const BaseLeaf_base: (new (value: {
    key: import("./field.js").Field;
    value: import("./field.js").Field;
    nextKey: import("./field.js").Field;
}) => {
    key: import("./field.js").Field;
    value: import("./field.js").Field;
    nextKey: import("./field.js").Field;
}) & {
    _isStruct: true;
} & Omit<import("./types/provable-intf.js").Provable<{
    key: import("./field.js").Field;
    value: import("./field.js").Field;
    nextKey: import("./field.js").Field;
}, {
    key: bigint;
    value: bigint;
    nextKey: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("./field.js").Field[]) => {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    };
} & {
    fromValue: (value: {
        key: string | number | bigint | import("./field.js").Field;
        value: string | number | bigint | import("./field.js").Field;
        nextKey: string | number | bigint | import("./field.js").Field;
    }) => {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    };
    toInput: (x: {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    }) => {
        key: string;
        value: string;
        nextKey: string;
    };
    fromJSON: (x: {
        key: string;
        value: string;
        nextKey: string;
    }) => {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    };
    empty: () => {
        key: import("./field.js").Field;
        value: import("./field.js").Field;
        nextKey: import("./field.js").Field;
    };
};
declare class BaseLeaf extends BaseLeaf_base {
}
declare const Leaf_base: (new (value: {
    value: import("./field.js").Field;
    key: import("./field.js").Field;
    nextKey: import("./field.js").Field;
    index: Unconstrained<number>;
    sortedIndex: Unconstrained<number>;
}) => {
    value: import("./field.js").Field;
    key: import("./field.js").Field;
    nextKey: import("./field.js").Field;
    index: Unconstrained<number>;
    sortedIndex: Unconstrained<number>;
}) & {
    _isStruct: true;
} & Provable<{
    value: import("./field.js").Field;
    key: import("./field.js").Field;
    nextKey: import("./field.js").Field;
    index: Unconstrained<number>;
    sortedIndex: Unconstrained<number>;
}, {
    value: bigint;
    key: bigint;
    nextKey: bigint;
    index: number;
    sortedIndex: number;
}> & {
    fromValue: (value: {
        value: string | number | bigint | import("./field.js").Field;
        key: string | number | bigint | import("./field.js").Field;
        nextKey: string | number | bigint | import("./field.js").Field;
        index: number | Unconstrained<number>;
        sortedIndex: number | Unconstrained<number>;
    }) => {
        value: import("./field.js").Field;
        key: import("./field.js").Field;
        nextKey: import("./field.js").Field;
        index: Unconstrained<number>;
        sortedIndex: Unconstrained<number>;
    };
    toInput: (x: {
        value: import("./field.js").Field;
        key: import("./field.js").Field;
        nextKey: import("./field.js").Field;
        index: Unconstrained<number>;
        sortedIndex: Unconstrained<number>;
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        value: import("./field.js").Field;
        key: import("./field.js").Field;
        nextKey: import("./field.js").Field;
        index: Unconstrained<number>;
        sortedIndex: Unconstrained<number>;
    }) => {
        value: string;
        key: string;
        nextKey: string;
        index: {
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
        sortedIndex: {
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
        value: string;
        key: string;
        nextKey: string;
        index: {
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
        sortedIndex: {
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
        value: import("./field.js").Field;
        key: import("./field.js").Field;
        nextKey: import("./field.js").Field;
        index: Unconstrained<number>;
        sortedIndex: Unconstrained<number>;
    };
    empty: () => {
        value: import("./field.js").Field;
        key: import("./field.js").Field;
        nextKey: import("./field.js").Field;
        index: Unconstrained<number>;
        sortedIndex: Unconstrained<number>;
    };
};
declare class Leaf extends Leaf_base {
    /**
     * Compute a leaf node: the hash of a leaf that becomes part of the Merkle tree.
     */
    static hashNode(leaf: From<typeof BaseLeaf>): import("./field.js").Field;
    /**
     * Create a new leaf, given its low node and index.
     */
    static nextAfter(low: Leaf, index: Field, leaf: BaseLeaf): Leaf;
    static toStored(leaf: Leaf): StoredLeaf;
    static fromStored(leaf: StoredLeaf, sortedIndex: number): {
        sortedIndex: number;
        value: bigint;
        key: bigint;
        nextKey: bigint;
        index: number;
    };
}
type StoredLeaf = {
    readonly value: bigint;
    readonly key: bigint;
    readonly nextKey: bigint;
    readonly index: number;
};
declare const LeafPair_base: (new (value: {
    low: Leaf;
    self: Leaf;
}) => {
    low: Leaf;
    self: Leaf;
}) & {
    _isStruct: true;
} & Provable<{
    low: Leaf;
    self: Leaf;
}, {
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
}> & {
    fromValue: (value: {
        low: Leaf | {
            value: string | number | bigint | import("./field.js").Field;
            key: string | number | bigint | import("./field.js").Field;
            nextKey: string | number | bigint | import("./field.js").Field;
            index: number | Unconstrained<number>;
            sortedIndex: number | Unconstrained<number>;
        };
        self: Leaf | {
            value: string | number | bigint | import("./field.js").Field;
            key: string | number | bigint | import("./field.js").Field;
            nextKey: string | number | bigint | import("./field.js").Field;
            index: number | Unconstrained<number>;
            sortedIndex: number | Unconstrained<number>;
        };
    }) => {
        low: Leaf;
        self: Leaf;
    };
    toInput: (x: {
        low: Leaf;
        self: Leaf;
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        low: Leaf;
        self: Leaf;
    }) => {
        low: {
            value: string;
            key: string;
            nextKey: string;
            index: {
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
            sortedIndex: {
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
        self: {
            value: string;
            key: string;
            nextKey: string;
            index: {
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
            sortedIndex: {
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
    };
    fromJSON: (x: {
        low: {
            value: string;
            key: string;
            nextKey: string;
            index: {
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
            sortedIndex: {
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
        self: {
            value: string;
            key: string;
            nextKey: string;
            index: {
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
            sortedIndex: {
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
    }) => {
        low: Leaf;
        self: Leaf;
    };
    empty: () => {
        low: Leaf;
        self: Leaf;
    };
};
declare class LeafPair extends LeafPair_base {
}
