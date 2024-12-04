import { Unconstrained } from './types/unconstrained.js';
import { Field } from './field.js';
import { ProvableHashable } from './crypto/poseidon.js';
import { WithProvable } from './types/provable-intf.js';
export { Packed, Hashed };
/**
 * `Packed<T>` is a "packed" representation of any type `T`.
 *
 * "Packed" means that field elements which take up fewer than 254 bits are packed together into
 * as few field elements as possible.
 *
 * For example, you can pack several Bools (1 bit) or UInt32s (32 bits) into a single field element.
 *
 * Using a packed representation can make sense in provable code where the number of constraints
 * depends on the number of field elements per value.
 *
 * For example, `Provable.if(bool, x, y)` takes O(n) constraints, where n is the number of field
 * elements in x and y.
 *
 * Usage:
 *
 * ```ts
 * // define a packed type from a type
 * let PackedType = Packed.create(MyType);
 *
 * // pack a value
 * let packed = PackedType.pack(value);
 *
 * // ... operations on packed values, more efficient than on plain values ...
 *
 * // unpack a value
 * let value = packed.unpack();
 * ```
 *
 * **Warning**: Packing only makes sense where packing actually reduces the number of field elements.
 * For example, it doesn't make sense to pack a _single_ Bool, because it will be 1 field element before
 * and after packing. On the other hand, it does makes sense to pack a type that holds 10 or 20 Bools.
 *
 * **Warning**: When wrapping a type with `Packed`, make sure that that type is safe to automatically _pack_
 * and _unpack_ in provable code. In particular, do not use `Packed` with types that define a custom `toInput()`
 * (specifying a certain bit packing) but no corresponding `check()` method (that constrains the bit lengths of the packed parts).
 */
declare class Packed<T> {
    packed: Field[];
    value: Unconstrained<T>;
    /**
     * Create a packed representation of `type`. You can then use `PackedType.pack(x)` to pack a value.
     */
    static create<T, V>(type: WithProvable<ProvableHashable<T, V>>): typeof Packed<T> & {
        provable: ProvableHashable<Packed<T>, V>;
        /**
         * Pack a value.
         */
        pack(x: T): Packed<T>;
    };
    constructor(packed: Field[], value: Unconstrained<T>);
    /**
     * Unpack a value.
     */
    unpack(): T;
    toFields(): Field[];
    static _provable: ProvableHashable<Packed<any>> | undefined;
    static _innerProvable: ProvableHashable<any> | undefined;
    get Constructor(): typeof Packed;
    static get innerProvable(): ProvableHashable<any>;
}
/**
 * `Hashed<T>` represents a type `T` by its hash.
 *
 * Since a hash is only a single field element, this can be more efficient in provable code
 * where the number of constraints depends on the number of field elements per value.
 *
 * For example, `Provable.if(bool, x, y)` takes O(n) constraints, where n is the number of field
 * elements in x and y. With Hashed, this is reduced to O(1).
 *
 * The downside is that you will pay the overhead of hashing your values, so it helps to experiment
 * in which parts of your code a hashed representation is beneficial.
 *
 * Usage:
 *
 * ```ts
 * // define a hashed type from a type
 * let HashedType = Hashed.create(MyType);
 *
 * // hash a value
 * let hashed = HashedType.hash(value);
 *
 * // ... operations on hashes, more efficient than on plain values ...
 *
 * // unhash to get the original value
 * let value = hashed.unhash();
 * ```
 *
 * **Warning**: When wrapping a type with `Hashed`, make sure that that type is safe to automatically _pack_
 * and _unpack_ in provable code. In particular, do not use `Hashed` with types that define a custom `toInput()`
 * (specifying a certain bit packing) but no corresponding `check()` method  (that constrains the bit lengths of the packed parts).
 */
declare class Hashed<T> {
    hash: Field;
    value: Unconstrained<T>;
    /**
     * Create a hashed representation of `type`. You can then use `HashedType.hash(x)` to wrap a value in a `Hashed`.
     */
    static create<T>(type: WithProvable<ProvableHashable<T>>, hash?: (t: T) => Field): typeof Hashed<T> & {
        provable: ProvableHashable<Hashed<T>>;
        empty(): Hashed<T>;
    };
    constructor(hash: Field, value: Unconstrained<T>);
    static _hash(_: any): Field;
    /**
     * Wrap a value, and represent it by its hash in provable code.
     *
     * ```ts
     * let hashed = HashedType.hash(value);
     * ```
     *
     * Optionally, if you already have the hash, you can pass it in and avoid recomputing it.
     */
    static hash<T>(value: T, hash?: Field): Hashed<T>;
    /**
     * Unwrap a value from its hashed variant.
     */
    unhash(): T;
    toFields(): Field[];
    static _provable: ProvableHashable<Hashed<any>> | undefined;
    static _innerProvable: ProvableHashable<any> | undefined;
    get Constructor(): typeof Hashed;
    static get innerProvable(): ProvableHashable<any>;
}
