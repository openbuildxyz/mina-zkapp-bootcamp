import { MerkleList } from '../../provable/merkle-list.js';
import { Field } from '../../provable/wrapped.js';
import { Actionable } from './offchain-state-serialization.js';
import { Hashed } from '../../provable/packed.js';
export { MerkleActions, MerkleActionHashes, HashedAction, FlatActions };
export { emptyActionState, emptyActionsHash };
declare const emptyActionsHash: import("../../provable/field.js").Field;
declare const emptyActionState: import("../../provable/field.js").Field;
/**
 * Provable representation of actions and their three levels of Merkleization.
 */
type MerkleActions<T> = MerkleList<MerkleList<Hashed<T>>>;
declare function MerkleActions<A extends Actionable<any>>(actionType: A, fromActionState?: Field): {
    new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>): MerkleList<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../provable/crypto/poseidon.js").ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: import("../../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    empty: () => MerkleList<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    from: (array: MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>[]) => MerkleList<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    fromReverse: (array: MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>[]) => MerkleList<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
    provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>>;
};
declare namespace MerkleActions {
    var fromFields: typeof actionFieldsToMerkleList;
}
type HashedAction<T> = Hashed<T>;
declare function HashedAction<A extends Actionable<any>>(actionType: A): {
    new (hash: import("../../provable/field.js").Field, value: import("../../../index.js").Unconstrained<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>): Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>;
    create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../provable/crypto/poseidon.js").ProvableHashable<T>>, hash?: ((t: T) => import("../../provable/field.js").Field) | undefined): typeof Hashed<T> & {
        provable: import("../../provable/crypto/poseidon.js").ProvableHashable<Hashed<T>>;
        empty(): Hashed<T>;
    };
    _hash(_: any): import("../../provable/field.js").Field;
    hash<T_1>(value: T_1, hash?: import("../../provable/field.js").Field | undefined): Hashed<T_1>;
    _provable: import("../../provable/crypto/poseidon.js").ProvableHashable<Hashed<any>> | undefined;
    _innerProvable: import("../../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly innerProvable: import("../../provable/crypto/poseidon.js").ProvableHashable<any>;
} & {
    provable: import("../../provable/crypto/poseidon.js").ProvableHashable<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>;
    empty(): Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>;
};
declare function actionFieldsToMerkleList<T>(actionType: Actionable<T>, fields: bigint[][][], fromActionState?: bigint): MerkleList<MerkleList<Hashed<T>>>;
/**
 * Simplified representation of actions where we don't use inner action lists but
 * only their hashes, which are plain Field elements.
 */
type MerkleActionHashes = MerkleList<Field>;
declare function MerkleActionHashes(fromActionState?: Field): {
    new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<import("../../provable/field.js").Field>): MerkleList<import("../../provable/field.js").Field>;
    create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../provable/crypto/poseidon.js").ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: import("../../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    empty: () => MerkleList<import("../../provable/field.js").Field>;
    from: (array: import("../../provable/field.js").Field[]) => MerkleList<import("../../provable/field.js").Field>;
    fromReverse: (array: import("../../provable/field.js").Field[]) => MerkleList<import("../../provable/field.js").Field>;
    provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<import("../../provable/field.js").Field>>;
};
/**
 * Provable representation of a flat list of actions.
 *
 * If the amount of logic per action is heavy, it is usually good to flatten the nested actions
 * list into a single list like this one.
 */
type FlatActions<T> = MerkleList<Hashed<T>>;
declare function FlatActions<A extends Actionable<any>>(actionType: A): {
    new ({ hash, data }: import("../../provable/merkle-list.js").MerkleListBase<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>): MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>;
    create<T>(type: import("../../provable/types/provable-intf.js").WithProvable<import("../../provable/crypto/poseidon.js").ProvableHashable<T>>, nextHash?: (hash: import("../../provable/field.js").Field, value: T) => import("../../provable/field.js").Field, emptyHash_?: import("../../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../../provable/field.js").Field, t: any) => import("../../provable/field.js").Field) | undefined;
    _emptyHash: import("../../provable/field.js").Field | undefined;
    _provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: import("../../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly emptyHash: import("../../provable/field.js").Field;
} & {
    empty: () => MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>;
    from: (array: Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>[]) => MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>;
    fromReverse: (array: Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>[]) => MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>;
    provable: import("../../provable/crypto/poseidon.js").ProvableHashable<MerkleList<Hashed<import("../../../bindings/lib/provable-generic.js").InferProvable<A, import("../../provable/field.js").Field>>>>;
};
