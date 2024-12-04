import { CircuitValue } from './types/circuit-value.js';
import { Field, Bool } from './wrapped.js';
import { MerkleTree } from './merkle-tree.js';
export { MerkleMap, MerkleMapWitness };
declare class MerkleMap {
    tree: MerkleTree;
    /**
     * Creates a new, empty Merkle Map.
     * @returns A new MerkleMap
     * @example
     * ```ts
     * const merkleMap = new MerkleMap();
     * ```
     */
    constructor();
    _keyToIndex(key: Field): bigint;
    /**
     * Sets a key of the merkle map to a given value.
     * @param key The key to set in the map.
     * @param value The value to set.
     * @example
     * ```ts
     * const key = Field(5);
     * const value = Field(10);
     * merkleMap.set(key, value);
     * ```
     */
    set(key: Field, value: Field): void;
    /**
     * Returns a value given a key. Values are by default Field(0).
     * @param key The key to get the value from.
     * @returns The value stored at the key.
     * @example
     * ```ts
     * const key = Field(5);
     * const value = merkleMap.get(key);
     * console.log(value); // Output: the value at key 5 or Field(0) if key does not exist
     * ```
     */
    get(key: Field): import("./field.js").Field;
    /**
     * Returns the root of the Merkle Map.
     * @returns The root of the Merkle Map.
     * @example
     * ```ts
     * const root = merkleMap.getRoot();
     * ```
     */
    getRoot(): import("./field.js").Field;
    /**
     * Returns a circuit-compatible witness (also known as [Merkle Proof or Merkle Witness](https://computersciencewiki.org/index.php/Merkle_proof)) for the given key.
     * @param key The key to make a witness for.
     * @returns A MerkleMapWitness, which can be used to assert changes to the MerkleMap, and the witness's key.
     * @example
     * ```ts
     * const key = Field(5);
     * const witness = merkleMap.getWitness(key);
     * ```
     */
    getWitness(key: Field): MerkleMapWitness;
}
declare class MerkleMapWitness extends CircuitValue {
    isLefts: Bool[];
    siblings: Field[];
    constructor(isLefts: Bool[], siblings: Field[]);
    /**
     * Computes the merkle tree root for a given value and the key for this witness
     * @param value The value to compute the root for.
     * @returns A tuple of the computed merkle root, and the key that is connected to the path updated by this witness.
     */
    computeRootAndKey(value: Field): import("./field.js").Field[];
}
