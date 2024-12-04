import { Bool, Field } from './wrapped.js';
import { ProvableHashable } from './crypto/poseidon.js';
import { Unconstrained } from './types/unconstrained.js';
import { WithProvable } from './types/provable-intf.js';
export { MerkleListBase, MerkleList, MerkleListIteratorBase, MerkleListIterator, WithHash, emptyHash, genericHash, merkleListHash, withHashes, };
declare const emptyHash: import("./field.js").Field;
type WithHash<T> = {
    previousHash: Field;
    element: T;
};
declare function WithHash<T>(type: ProvableHashable<T>): ProvableHashable<WithHash<T>>;
/**
 * Common base type for {@link MerkleList} and {@link MerkleListIterator}
 */
type MerkleListBase<T> = {
    hash: Field;
    data: Unconstrained<WithHash<T>[]>;
};
declare function MerkleListBase<T>(): ProvableHashable<MerkleListBase<T>>;
/**
 * Dynamic-length list which is represented as a single hash
 *
 * Supported operations are {@link push()} and {@link pop()} and some variants thereof.
 *
 *
 * A Merkle list is generic over its element types, so before using it you must create a subclass for your element type:
 *
 * ```ts
 * class MyList extends MerkleList.create(MyType) {}
 *
 * // now use it
 * let list = MyList.empty();
 *
 * list.push(new MyType(...));
 *
 * let element = list.pop();
 * ```
 *
 * Internal detail: `push()` adds elements to the _start_ of the internal array and `pop()` removes them from the start.
 * This is so that the hash which represents the list is consistent with {@link MerkleListIterator},
 * and so a `MerkleList` can be used as input to `MerkleListIterator.startIterating(list)`
 * (which will then iterate starting from the last pushed element).
 */
declare class MerkleList<T> implements MerkleListBase<T> {
    hash: Field;
    data: Unconstrained<WithHash<T>[]>;
    constructor({ hash, data }: MerkleListBase<T>);
    isEmpty(): import("./bool.js").Bool;
    /**
     * Push a new element to the list.
     */
    push(element: T): void;
    /**
     * Push a new element to the list, if the `condition` is true.
     */
    pushIf(condition: Bool, element: T): void;
    private popWitness;
    /**
     * Remove the last element from the list and return it.
     *
     * This proves that the list is non-empty, and fails otherwise.
     */
    popExn(): T;
    /**
     * Remove the last element from the list and return it.
     *
     * If the list is empty, returns a dummy element.
     */
    pop(): T;
    /**
     * Return the last element, but only remove it if `condition` is true.
     *
     * If the list is empty, returns a dummy element.
     */
    popIf(condition: Bool): T;
    /**
     * Low-level, minimal version of `pop()` which lets the _caller_ decide whether there is an element to pop.
     *
     * I.e. this proves:
     * - If the input condition is true, this returns the last element and removes it from the list.
     * - If the input condition is false, the list is unchanged and the return value is garbage.
     *
     * Note that if the caller passes `true` but the list is empty, this will fail.
     * If the caller passes `false` but the list is non-empty, this succeeds and just doesn't pop off an element.
     */
    popIfUnsafe(shouldPop: Bool): T;
    clone(): MerkleList<T>;
    /**
     * Iterate through the list in a fixed number of steps any apply a given callback on each element.
     *
     * Proves that the iteration traverses the entire list.
     * Once past the last element, dummy elements will be passed to the callback.
     *
     * Note: There are no guarantees about the contents of dummy elements, so the callback is expected
     * to handle the `isDummy` flag separately.
     */
    forEach(length: number, callback: (element: T, isDummy: Bool, i: number) => void): void;
    startIterating(): MerkleListIterator<T>;
    startIteratingFromLast(): MerkleListIterator<T>;
    toArrayUnconstrained(): Unconstrained<T[]>;
    lengthUnconstrained(): Unconstrained<number>;
    /**
     * Create a Merkle list type
     *
     * Optionally, you can tell `create()` how to do the hash that pushes a new list element, by passing a `nextHash` function.
     *
     * @example
     * ```ts
     * class MyList extends MerkleList.create(Field, (hash, x) =>
     *   Poseidon.hashWithPrefix('custom', [hash, x])
     * ) {}
     * ```
     */
    static create<T>(type: WithProvable<ProvableHashable<T>>, nextHash?: (hash: Field, value: T) => Field, emptyHash_?: import("./field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: ProvableHashable<MerkleList<T>>;
    };
    static _nextHash: ((hash: Field, t: any) => Field) | undefined;
    static _emptyHash: Field | undefined;
    static _provable: ProvableHashable<MerkleList<any>> | undefined;
    static _innerProvable: ProvableHashable<any> | undefined;
    get Constructor(): typeof MerkleList;
    nextHash(hash: Field, value: T): Field;
    static get emptyHash(): import("./field.js").Field;
    get innerProvable(): ProvableHashable<T>;
}
type MerkleListIteratorBase<T> = {
    readonly hash: Field;
    readonly data: Unconstrained<WithHash<T>[]>;
    /**
     * The merkle list hash of `[data[currentIndex], ..., data[length-1]]` (when hashing from right to left).
     *
     * For example:
     * - If `currentIndex === 0`, then `currentHash === this.hash` is the hash of the entire array.
     * - If `currentIndex === length`, then `currentHash === emptyHash` is the hash of an empty array.
     */
    currentHash: Field;
    /**
     * The index of the element that will be returned by the next call to `next()`.
     */
    currentIndex: Unconstrained<number>;
};
/**
 * MerkleListIterator helps iterating through a Merkle list.
 * This works similar to calling `list.pop()` or `list.push()` repeatedly, but maintaining the entire list instead of removing elements.
 *
 * The core methods that support iteration are {@link next()} and {@link previous()}.
 *
 * ```ts
 * let iterator = MerkleListIterator.startIterating(list);
 *
 * let firstElement = iterator.next();
 * ```
 *
 * We maintain two commitments:
 * - One to the entire array, to be able to prove that we end iteration at the correct point.
 * - One to the array from the current index until the end, to efficiently step forward.
 */
declare class MerkleListIterator<T> implements MerkleListIteratorBase<T> {
    readonly data: Unconstrained<WithHash<T>[]>;
    readonly hash: Field;
    currentHash: Field;
    currentIndex: Unconstrained<number>;
    constructor(value: MerkleListIteratorBase<T>);
    assertAtStart(): void;
    isAtEnd(): import("./bool.js").Bool;
    jumpToEnd(): void;
    jumpToEndIf(condition: Bool): void;
    assertAtEnd(message?: string): void;
    isAtStart(): import("./bool.js").Bool;
    jumpToStart(): void;
    jumpToStartIf(condition: Bool): void;
    _index(direction: 'next' | 'previous', i?: number): number;
    _updateIndex(direction: 'next' | 'previous'): void;
    previous(): T;
    next(): T;
    /**
     * Low-level APIs for advanced uses
     */
    get Unsafe(): {
        /**
         * Version of {@link previous} which doesn't guarantee anything about
         * the returned element in case the iterator is at the start.
         *
         * Instead, the `isDummy` flag is also returned so that this case can
         * be handled in a custom way.
         */
        previous(): {
            element: T;
            isDummy: import("./bool.js").Bool;
        };
        /**
         * Version of {@link next} which doesn't guarantee anything about
         * the returned element in case the iterator is at the end.
         *
         * Instead, the `isDummy` flag is also returned so that this case can
         * be handled in a custom way.
         */
        next(): {
            element: T;
            isDummy: import("./bool.js").Bool;
        };
    };
    clone(): MerkleListIterator<T>;
    /**
     * Create a Merkle array type
     */
    static create<T>(type: WithProvable<ProvableHashable<T>>, nextHash?: (hash: Field, value: T) => Field, emptyHash_?: import("./field.js").Field): typeof MerkleListIterator<T> & {
        from: (array: T[]) => MerkleListIterator<T>;
        startIterating: (list: MerkleListBase<T>) => MerkleListIterator<T>;
        startIteratingFromLast: (list: MerkleListBase<T>) => MerkleListIterator<T>;
        empty: () => MerkleListIterator<T>;
        provable: ProvableHashable<MerkleListIterator<T>>;
    };
    static createFromList<T>(merkleList: typeof MerkleList<T>): {
        new (value: MerkleListIteratorBase<T>): MerkleListIterator<T>;
        /**
         * Create a Merkle array type
         */
        create<T_1>(type: WithProvable<ProvableHashable<T_1>>, nextHash?: (hash: import("./field.js").Field, value: T_1) => import("./field.js").Field, emptyHash_?: import("./field.js").Field): {
            new (value: MerkleListIteratorBase<T_1>): MerkleListIterator<T_1>;
            create<T_1>(type: WithProvable<ProvableHashable<T_1>>, nextHash?: (hash: import("./field.js").Field, value: T_1) => import("./field.js").Field, emptyHash_?: import("./field.js").Field): any & {
                from: (array: T_1[]) => MerkleListIterator<T_1>;
                startIterating: (list: MerkleListBase<T_1>) => MerkleListIterator<T_1>;
                startIteratingFromLast: (list: MerkleListBase<T_1>) => MerkleListIterator<T_1>;
                empty: () => MerkleListIterator<T_1>;
                provable: ProvableHashable<MerkleListIterator<T_1>>;
            };
            createFromList<T>(merkleList: typeof MerkleList<T>): any & {
                from: (array: T[]) => MerkleListIterator<T>;
                startIterating: (list: MerkleListBase<T>) => MerkleListIterator<T>;
                startIteratingFromLast: (list: MerkleListBase<T>) => MerkleListIterator<T>;
                empty: () => MerkleListIterator<T>;
                provable: ProvableHashable<MerkleListIterator<T>>;
            };
            _nextHash: ((hash: import("./field.js").Field, value: any) => import("./field.js").Field) | undefined;
            _emptyHash: import("./field.js").Field | undefined;
            _provable: ProvableHashable<MerkleListIterator<any>> | undefined;
            _innerProvable: ProvableHashable<any> | undefined;
            readonly emptyHash: import("./field.js").Field;
        } & {
            from: (array: T_1[]) => MerkleListIterator<T_1>;
            startIterating: (list: MerkleListBase<T_1>) => MerkleListIterator<T_1>;
            startIteratingFromLast: (list: MerkleListBase<T_1>) => MerkleListIterator<T_1>;
            empty: () => MerkleListIterator<T_1>;
            provable: ProvableHashable<MerkleListIterator<T_1>>;
        };
        createFromList<T>(merkleList: typeof MerkleList<T>): any & {
            from: (array: T[]) => MerkleListIterator<T>;
            startIterating: (list: MerkleListBase<T>) => MerkleListIterator<T>;
            startIteratingFromLast: (list: MerkleListBase<T>) => MerkleListIterator<T>;
            empty: () => MerkleListIterator<T>;
            provable: ProvableHashable<MerkleListIterator<T>>;
        };
        _nextHash: ((hash: import("./field.js").Field, value: any) => import("./field.js").Field) | undefined;
        _emptyHash: import("./field.js").Field | undefined;
        _provable: ProvableHashable<MerkleListIterator<any>> | undefined;
        _innerProvable: ProvableHashable<any> | undefined;
        readonly emptyHash: import("./field.js").Field;
    } & {
        from: (array: T[]) => MerkleListIterator<T>;
        startIterating: (list: MerkleListBase<T>) => MerkleListIterator<T>;
        startIteratingFromLast: (list: MerkleListBase<T>) => MerkleListIterator<T>;
        empty: () => MerkleListIterator<T>;
        provable: ProvableHashable<MerkleListIterator<T>>;
    };
    static _nextHash: ((hash: Field, value: any) => Field) | undefined;
    static _emptyHash: Field | undefined;
    static _provable: ProvableHashable<MerkleListIterator<any>> | undefined;
    static _innerProvable: ProvableHashable<any> | undefined;
    get Constructor(): typeof MerkleListIterator;
    nextHash(hash: Field, value: T): Field;
    static get emptyHash(): import("./field.js").Field;
    get innerProvable(): ProvableHashable<T>;
}
declare function genericHash<T>(provable: ProvableHashable<T>, prefix: string, value: T): import("./field.js").Field;
declare function merkleListHash<T>(provable: ProvableHashable<T>, prefix?: string): (hash: Field, value: T) => import("./field.js").Field;
declare function withHashes<T>(data: T[], nextHash: (hash: Field, value: T) => Field, emptyHash: Field): {
    data: WithHash<T>[];
    hash: Field;
};
