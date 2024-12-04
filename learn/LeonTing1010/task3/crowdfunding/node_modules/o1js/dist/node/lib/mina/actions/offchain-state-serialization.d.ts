/**
 * This defines a custom way to serialize various kinds of offchain state into an action.
 *
 * There is a special trick of including Merkle map (keyHash, valueHash) pairs _at the end_ of each action.
 * Thanks to the properties of Poseidon, this enables us to compute the action hash cheaply
 * if we only need to prove that (key, value) are part of it.
 */
import { ProvablePure, WithProvable } from '../../provable/types/provable-intf.js';
import { ProvableHashable } from '../../provable/crypto/poseidon.js';
import { Field } from '../../provable/wrapped.js';
import { Unconstrained } from '../../provable/types/unconstrained.js';
import { MerkleList } from '../../provable/merkle-list.js';
import { PublicKey } from '../../provable/crypto/signature.js';
import { Provable } from '../../provable/provable.js';
import { Option } from '../../provable/option.js';
import { IndexedMerkleMapBase } from '../../provable/merkle-tree-indexed.js';
export { toKeyHash, toAction, fromActionWithoutHashes, MerkleLeaf, LinearizedAction, LinearizedActionList, ActionList, fetchMerkleLeaves, fetchMerkleMap, updateMerkleMap, Actionable, };
type Action = [...Field[], Field, Field];
type Actionable<T, V = any> = WithProvable<ProvableHashable<T, V> & ProvablePure<T, V>>;
declare function toKeyHash<K, KeyType extends Actionable<K> | undefined>(prefix: Field, keyType: KeyType, key: KeyType extends undefined ? undefined : K): Field;
declare function toAction<K, V, KeyType extends Actionable<K> | undefined>({ prefix, keyType, valueType, key, value, previousValue, }: {
    prefix: Field;
    keyType: KeyType;
    valueType: Actionable<V>;
    key: KeyType extends undefined ? undefined : K;
    value: V;
    previousValue?: Option<V>;
}): Action;
declare function fromActionWithoutHashes<V>(valueType: Actionable<V>, action: Field[]): V;
declare const MerkleLeaf_base: (new (value: {
    key: import("../../provable/field.js").Field;
    value: import("../../provable/field.js").Field;
    usesPreviousValue: import("../../provable/bool.js").Bool;
    previousValue: import("../../provable/field.js").Field;
    prefix: Unconstrained<import("../../provable/field.js").Field[]>;
}) => {
    key: import("../../provable/field.js").Field;
    value: import("../../provable/field.js").Field;
    usesPreviousValue: import("../../provable/bool.js").Bool;
    previousValue: import("../../provable/field.js").Field;
    prefix: Unconstrained<import("../../provable/field.js").Field[]>;
}) & {
    _isStruct: true;
} & Provable<{
    key: import("../../provable/field.js").Field;
    value: import("../../provable/field.js").Field;
    usesPreviousValue: import("../../provable/bool.js").Bool;
    previousValue: import("../../provable/field.js").Field;
    prefix: Unconstrained<import("../../provable/field.js").Field[]>;
}, {
    key: bigint;
    value: bigint;
    usesPreviousValue: boolean;
    previousValue: bigint;
    prefix: import("../../provable/field.js").Field[];
}> & {
    fromValue: (value: {
        key: string | number | bigint | import("../../provable/field.js").Field;
        value: string | number | bigint | import("../../provable/field.js").Field;
        usesPreviousValue: boolean | import("../../provable/bool.js").Bool;
        previousValue: string | number | bigint | import("../../provable/field.js").Field;
        prefix: import("../../provable/field.js").Field[] | Unconstrained<import("../../provable/field.js").Field[]>;
    }) => {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    };
    toInput: (x: {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }) => {
        key: string;
        value: string;
        usesPreviousValue: boolean;
        previousValue: string;
        prefix: {
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
        key: string;
        value: string;
        usesPreviousValue: boolean;
        previousValue: string;
        prefix: {
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
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    };
    empty: () => {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    };
};
/**
 * This represents a custom kind of action which includes a Merkle map key and value in its serialization,
 * and doesn't represent the rest of the action's field elements in provable code.
 */
declare class MerkleLeaf extends MerkleLeaf_base {
    static fromAction(action: Field[]): MerkleLeaf;
    /**
     * A custom method to hash an action which only hashes the key and value in provable code.
     * Therefore, it only proves that the key and value are part of the action, and nothing about
     * the rest of the action.
     */
    static hash(action: MerkleLeaf): import("../../provable/field.js").Field;
}
declare const ActionList_base: {
    new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>): MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>;
    create<T>(type: WithProvable<ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    empty: () => MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>;
    from: (array: {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }[]) => MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>;
    fromReverse: (array: {
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }[]) => MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>;
    provable: ProvableHashable<MerkleList<{
        key: import("../../provable/field.js").Field;
        value: import("../../provable/field.js").Field;
        usesPreviousValue: import("../../provable/bool.js").Bool;
        previousValue: import("../../provable/field.js").Field;
        prefix: Unconstrained<import("../../provable/field.js").Field[]>;
    }>>;
};
declare class ActionList extends ActionList_base {
}
declare const LinearizedAction_base: (new (value: {
    action: MerkleLeaf;
    isCheckPoint: import("../../provable/bool.js").Bool;
}) => {
    action: MerkleLeaf;
    isCheckPoint: import("../../provable/bool.js").Bool;
}) & {
    _isStruct: true;
} & Provable<{
    action: MerkleLeaf;
    isCheckPoint: import("../../provable/bool.js").Bool;
}, {
    action: {
        key: bigint;
        value: bigint;
        usesPreviousValue: boolean;
        previousValue: bigint;
        prefix: import("../../provable/field.js").Field[];
    };
    isCheckPoint: boolean;
}> & {
    fromValue: (value: {
        action: MerkleLeaf | {
            key: string | number | bigint | import("../../provable/field.js").Field;
            value: string | number | bigint | import("../../provable/field.js").Field;
            usesPreviousValue: boolean | import("../../provable/bool.js").Bool;
            previousValue: string | number | bigint | import("../../provable/field.js").Field;
            prefix: import("../../provable/field.js").Field[] | Unconstrained<import("../../provable/field.js").Field[]>;
        };
        isCheckPoint: boolean | import("../../provable/bool.js").Bool;
    }) => {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    };
    toInput: (x: {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }) => {
        action: {
            key: string;
            value: string;
            usesPreviousValue: boolean;
            previousValue: string;
            prefix: {
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
        isCheckPoint: boolean;
    };
    fromJSON: (x: {
        action: {
            key: string;
            value: string;
            usesPreviousValue: boolean;
            previousValue: string;
            prefix: {
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
        isCheckPoint: boolean;
    }) => {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    };
    empty: () => {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    };
};
declare class LinearizedAction extends LinearizedAction_base {
    /**
     * A custom method to hash an action which only hashes the key and value in provable code.
     * Therefore, it only proves that the key and value are part of the action, and nothing about
     * the rest of the action.
     */
    static hash({ action, isCheckPoint }: LinearizedAction): import("../../provable/field.js").Field;
}
declare const LinearizedActionList_base: {
    new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>): MerkleList<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>;
    create<T>(type: WithProvable<ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    empty: () => MerkleList<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>;
    from: (array: {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }[]) => MerkleList<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>;
    fromReverse: (array: {
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }[]) => MerkleList<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>;
    provable: ProvableHashable<MerkleList<{
        action: MerkleLeaf;
        isCheckPoint: import("../../provable/bool.js").Bool;
    }>>;
};
declare class LinearizedActionList extends LinearizedActionList_base {
}
declare function fetchMerkleLeaves(contract: {
    address: PublicKey;
    tokenId: Field;
}, config?: {
    fromActionState?: Field;
    endActionState?: Field;
}): Promise<MerkleList<MerkleList<MerkleLeaf>>>;
/**
 * Recreate Merkle tree from fetched actions.
 *
 * We also deserialize a keyHash -> value map from the leaves.
 */
declare function fetchMerkleMap(height: number, contract: {
    address: PublicKey;
    tokenId: Field;
}, endActionState?: Field): Promise<{
    merkleMap: IndexedMerkleMapBase;
    valueMap: Map<bigint, Field[]>;
}>;
declare function updateMerkleMap(updates: MerkleLeaf[][], tree: IndexedMerkleMapBase, valueMap?: Map<bigint, Field[]>): void;
