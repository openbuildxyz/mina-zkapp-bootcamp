import { Bytes } from '../wrapped-classes.js';
export { Hash };
/**
 * A collection of hash functions which can be used in provable code.
 */
declare const Hash: {
    /**
     * Hashes the given field elements using [Poseidon](https://eprint.iacr.org/2019/458.pdf). Alias for `Poseidon.hash()`.
     *
     * ```ts
     * let hash = Hash.hash([a, b, c]);
     * ```
     *
     * **Important:** This is by far the most efficient hash function o1js has available in provable code.
     * Use it by default, if no compatibility concerns require you to use a different hash function.
     *
     * The Poseidon implementation operates over the native [Pallas base field](https://electriccoin.co/blog/the-pasta-curves-for-halo-2-and-beyond/)
     * and uses parameters generated specifically for the [Mina](https://minaprotocol.com) blockchain.
     *
     * We use a `rate` of 2, which means that 2 field elements are hashed per permutation.
     * A permutation causes 11 rows in the constraint system.
     *
     * You can find the full set of Poseidon parameters [here](https://github.com/o1-labs/o1js-bindings/blob/main/crypto/constants.ts).
     */
    hash: (input: import("../field.js").Field[]) => import("../field.js").Field;
    /**
     * The [Poseidon](https://eprint.iacr.org/2019/458.pdf) hash function.
     *
     * See {@link Hash.hash} for details and usage examples.
     */
    Poseidon: {
        hash(input: import("../field.js").Field[]): import("../field.js").Field;
        update(state: [import("../field.js").Field, import("../field.js").Field, import("../field.js").Field], input: import("../field.js").Field[]): [import("../field.js").Field, import("../field.js").Field, import("../field.js").Field];
        hashWithPrefix(prefix: string, input: import("../field.js").Field[]): import("../field.js").Field;
        initialState(): [import("../field.js").Field, import("../field.js").Field, import("../field.js").Field];
        Unsafe: {
            hashToGroup(input: import("../field.js").Field[]): import("../group.js").Group;
        };
        hashToGroup(input: import("../field.js").Field[]): import("../group.js").Group;
        hashPacked<T>(type: import("../types/provable-intf.js").WithProvable<{
            toInput: (x: T) => import("./poseidon.js").HashInput;
            empty: () => T;
        }>, value: T): import("../field.js").Field;
        Sponge: {
            new (): {
                "__#1@#sponge": unknown;
                absorb(x: import("../field.js").Field): void;
                squeeze(): import("../field.js").Field;
            };
        };
    };
    /**
     * The SHA2 hash function with an output length of 256 bits.
     */
    SHA2_256: {
        /**
         * Hashes the given bytes using SHA2-256.
         *
         * This is an alias for `Gadgets.SHA256.hash(bytes)`.\
         * See {@link Gadgets.SHA256.hash} for details and usage examples.
         */
        hash: (data: import("../bytes.js").FlexibleBytes) => import("../bytes.js").Bytes;
    };
    /**
     * The SHA3 hash function with an output length of 256 bits.
     */
    SHA3_256: {
        /**
         * Hashes the given bytes using SHA3-256.
         *
         * This is an alias for `Keccak.nistSha3(256, bytes)`.\
         * See {@link Keccak.nistSha3} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    /**
     * The SHA3 hash function with an output length of 384 bits.
     */
    SHA3_384: {
        /**
         * Hashes the given bytes using SHA3-384.
         *
         * This is an alias for `Keccak.nistSha3(384, bytes)`.\
         * See {@link Keccak.nistSha3} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    /**
     * The SHA3 hash function with an output length of 512 bits.
     */
    SHA3_512: {
        /**
         * Hashes the given bytes using SHA3-512.
         *
         * This is an alias for `Keccak.nistSha3(512, bytes)`.\
         * See {@link Keccak.nistSha3} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    /**
     * The pre-NIST Keccak hash function with an output length of 256 bits.
     */
    Keccak256: {
        /**
         * Hashes the given bytes using Keccak-256.
         *
         * This is an alias for `Keccak.preNist(256, bytes)`.\
         * See {@link Keccak.preNist} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    /**
     * The pre-NIST Keccak hash function with an output length of 384 bits.
     */
    Keccak384: {
        /**
         * Hashes the given bytes using Keccak-384.
         *
         * This is an alias for `Keccak.preNist(384, bytes)`.\
         * See {@link Keccak.preNist} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    /**
     * The pre-NIST Keccak hash function with an output length of 512 bits.
     */
    Keccak512: {
        /**
         * Hashes the given bytes using Keccak-512.
         *
         * This is an alias for `Keccak.preNist(512, bytes)`.\
         * See {@link Keccak.preNist} for details and usage examples.
         */
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
    BLAKE2B: {
        hash(bytes: Bytes): import("../bytes.js").Bytes;
    };
};
