import { HashInput } from '../types/struct.js';
import { Field } from '../wrapped.js';
import { Provable } from '../provable.js';
import { Group } from '../group.js';
import { WithProvable } from '../types/provable-intf.js';
export { Poseidon, TokenSymbol };
export { ProvableHashable, HashInput, HashHelpers, emptyHashWithPrefix, hashWithPrefix, salt, packToFields, emptyReceiptChainHash, hashConstant, isHashable, };
type Hashable<T> = {
    toInput: (x: T) => HashInput;
    empty: () => T;
};
type ProvableHashable<T, V = any> = Provable<T, V> & Hashable<T>;
declare class Sponge {
    #private;
    constructor();
    absorb(x: Field): void;
    squeeze(): Field;
}
declare const Poseidon: {
    hash(input: Field[]): import("../field.js").Field;
    update(state: [Field, Field, Field], input: Field[]): [import("../field.js").Field, import("../field.js").Field, import("../field.js").Field];
    hashWithPrefix(prefix: string, input: Field[]): import("../field.js").Field;
    initialState(): [Field, Field, Field];
    Unsafe: {
        /**
         * Low-level version of `Poseidon.hashToGroup()`.
         *
         * **Warning**: This function is marked unsafe because its output is not deterministic.
         * It returns the square root of a value without constraining which of the two possible
         * square roots is chosen. This allows the prover to choose between two different hashes,
         * which can be a vulnerability if consuming code treats the output as unique.
         */
        hashToGroup(input: Field[]): Group;
    };
    /**
     * Hashes a list of field elements to a point on the Pallas curve.
     *
     * The output point is deterministic and its discrete log is not efficiently computable.
     */
    hashToGroup(input: Field[]): Group;
    /**
     * Hashes a provable type efficiently.
     *
     * ```ts
     * let skHash = Poseidon.hashPacked(PrivateKey, secretKey);
     * ```
     *
     * Note: Instead of just doing `Poseidon.hash(value.toFields())`, this
     * uses the `toInput()` method on the provable type to pack the input into as few
     * field elements as possible. This saves constraints because packing has a much
     * lower per-field element cost than hashing.
     */
    hashPacked<T>(type: WithProvable<Hashable<T>>, value: T): import("../field.js").Field;
    Sponge: typeof Sponge;
};
declare function hashConstant(input: Field[]): import("../field.js").Field;
declare const HashHelpers: {
    salt: (prefix: string) => import("../field.js").Field[];
    emptyHashWithPrefix: (prefix: string) => import("../field.js").Field;
    hashWithPrefix: (prefix: string, input: import("../field.js").Field[]) => import("../field.js").Field;
};
declare let salt: (prefix: string) => import("../field.js").Field[], emptyHashWithPrefix: (prefix: string) => import("../field.js").Field, hashWithPrefix: (prefix: string, input: import("../field.js").Field[]) => import("../field.js").Field;
/**
 * Convert the {fields, packed} hash input representation to a list of field elements
 * Random_oracle_input.Chunked.pack_to_fields
 */
declare function packToFields({ fields, packed }: HashInput): import("../field.js").Field[];
declare function isHashable<T>(obj: any): obj is Hashable<T>;
declare const TokenSymbol_base: (new (value: {
    symbol: string;
    field: import("../field.js").Field;
}) => {
    symbol: string;
    field: import("../field.js").Field;
}) & {
    _isStruct: true;
} & Provable<{
    symbol: string;
    field: import("../field.js").Field;
}, string> & {
    fromValue: (value: string | {
        symbol: string;
        field: import("../field.js").Field;
    }) => {
        symbol: string;
        field: import("../field.js").Field;
    };
    toInput: (x: {
        symbol: string;
        field: import("../field.js").Field;
    }) => {
        fields?: import("../field.js").Field[] | undefined;
        packed?: [import("../field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        symbol: string;
        field: import("../field.js").Field;
    }) => string;
    fromJSON: (x: string) => {
        symbol: string;
        field: import("../field.js").Field;
    };
    empty: () => {
        symbol: string;
        field: import("../field.js").Field;
    };
};
declare class TokenSymbol extends TokenSymbol_base {
    static from(value: string | TokenSymbol): TokenSymbol;
}
declare function emptyReceiptChainHash(): import("../field.js").Field;
