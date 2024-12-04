import type { Nullifier as JsonNullifier } from '../../../mina-signer/src/types.js';
import { Field, Scalar } from '../wrapped.js';
import { MerkleMapWitness } from '../merkle-map.js';
import { PrivateKey, PublicKey } from './signature.js';
export { Nullifier };
declare const Nullifier_base: (new (value: {
    publicKey: import("../group.js").Group;
    public: {
        nullifier: import("../group.js").Group;
        s: Scalar;
    };
    private: {
        c: import("../field.js").Field;
        g_r: import("../group.js").Group;
        h_m_pk_r: import("../group.js").Group;
    };
}) => {
    publicKey: import("../group.js").Group;
    public: {
        nullifier: import("../group.js").Group;
        s: Scalar;
    };
    private: {
        c: import("../field.js").Field;
        g_r: import("../group.js").Group;
        h_m_pk_r: import("../group.js").Group;
    };
}) & {
    _isStruct: true;
} & Omit<import("../types/provable-intf.js").Provable<{
    publicKey: import("../group.js").Group;
    public: {
        nullifier: import("../group.js").Group;
        s: Scalar;
    };
    private: {
        c: import("../field.js").Field;
        g_r: import("../group.js").Group;
        h_m_pk_r: import("../group.js").Group;
    };
}, {
    publicKey: {
        x: bigint;
        y: bigint;
    };
    public: {
        nullifier: {
            x: bigint;
            y: bigint;
        };
        s: bigint;
    };
    private: {
        c: bigint;
        g_r: {
            x: bigint;
            y: bigint;
        };
        h_m_pk_r: {
            x: bigint;
            y: bigint;
        };
    };
}>, "fromFields"> & {
    fromFields: (fields: import("../field.js").Field[]) => {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    };
} & {
    fromValue: (value: {
        publicKey: import("../group.js").Group | {
            x: number | bigint | import("../field.js").Field;
            y: number | bigint | import("../field.js").Field;
        };
        public: {
            nullifier: import("../group.js").Group | {
                x: number | bigint | import("../field.js").Field;
                y: number | bigint | import("../field.js").Field;
            };
            s: bigint | Scalar;
        };
        private: {
            c: string | number | bigint | import("../field.js").Field;
            g_r: import("../group.js").Group | {
                x: number | bigint | import("../field.js").Field;
                y: number | bigint | import("../field.js").Field;
            };
            h_m_pk_r: import("../group.js").Group | {
                x: number | bigint | import("../field.js").Field;
                y: number | bigint | import("../field.js").Field;
            };
        };
    }) => {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    };
    toInput: (x: {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    }) => {
        fields?: import("../field.js").Field[] | undefined;
        packed?: [import("../field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    }) => {
        publicKey: {
            x: string;
            y: string;
        };
        public: {
            nullifier: {
                x: string;
                y: string;
            };
            s: string;
        };
        private: {
            c: string;
            g_r: {
                x: string;
                y: string;
            };
            h_m_pk_r: {
                x: string;
                y: string;
            };
        };
    };
    fromJSON: (x: {
        publicKey: {
            x: string;
            y: string;
        };
        public: {
            nullifier: {
                x: string;
                y: string;
            };
            s: string;
        };
        private: {
            c: string;
            g_r: {
                x: string;
                y: string;
            };
            h_m_pk_r: {
                x: string;
                y: string;
            };
        };
    }) => {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    };
    empty: () => {
        publicKey: import("../group.js").Group;
        public: {
            nullifier: import("../group.js").Group;
            s: Scalar;
        };
        private: {
            c: import("../field.js").Field;
            g_r: import("../group.js").Group;
            h_m_pk_r: import("../group.js").Group;
        };
    };
};
/**
 *
 * Nullifiers are used as a public commitment to a specific anonymous account,
 * to forbid actions like double spending, or allow a consistent identity between anonymous actions.
 *
 * RFC: https://github.com/o1-labs/o1js/issues/756
 *
 * Paper: https://eprint.iacr.org/2022/1255.pdf
 */
declare class Nullifier extends Nullifier_base {
    static fromJSON(json: JsonNullifier): Nullifier;
    /**
     * Verifies that the Nullifier belongs to a specific message. Throws an error if the Nullifier is incorrect.
     *
     * @example
     *
     * ```ts
     * let nullifierMessage = [voteId, ...otherData];
     * // throws an error if the nullifier is invalid or doesn't belong to this specific message
     * nullifier.verify(nullifierMessage);
     * ```
     */
    verify(message: Field[]): void;
    /**
     * The key of the nullifier, which belongs to a unique message and a public key.
     * Used as an index in Merkle trees.
     *
     * @example
     * ```ts
     * // returns the key of the nullifier which can be used as index in a Merkle tree/map
     * let key = nullifier.key();
     * ```
     */
    key(): import("../field.js").Field;
    /**
     * Returns the state of the Nullifier.
     *
     * @example
     * ```ts
     * // returns a Bool based on whether or not the nullifier has been used before
     * let isUnused = nullifier.isUnused();
     * ```
     */
    isUnused(witness: MerkleMapWitness, root: Field): import("../bool.js").Bool;
    /**
     * Checks if the Nullifier has been used before.
     *
     * @example
     * ```ts
     * // asserts that the nullifier has not been used before, throws an error otherwise
     * nullifier.assertUnused();
     * ```
     */
    assertUnused(witness: MerkleMapWitness, root: Field): void;
    /**
     * Sets the Nullifier, returns the new Merkle root.
     *
     * @example
     * ```ts
     * // calculates the new root of the Merkle tree in which the nullifier is set to used
     * let newRoot = nullifier.setUsed(witness);
     * ```
     */
    setUsed(witness: MerkleMapWitness): import("../field.js").Field;
    /**
     * Returns the {@link PublicKey} that is associated with this Nullifier.
     *
     * @example
     * ```ts
     * let pk = nullifier.getPublicKey();
     * ```
     */
    getPublicKey(): PublicKey;
    /**
     *
     * _Note_: This is *not* the recommended way to create a Nullifier in production. Please use mina-signer to create Nullifiers.
     * Also, this function cannot be run within provable code to avoid unintended creations of Nullifiers - a Nullifier should never be created inside proveable code (e.g. a smart contract) directly, but rather created inside the users wallet (or other secure enclaves, so the private key never leaves that enclave).
     *
     * PLUME: An ECDSA Nullifier Scheme for Unique
     * Pseudonymity within Zero Knowledge Proofs
     * https://eprint.iacr.org/2022/1255.pdf chapter 3 page 14
     */
    static createTestNullifier(message: Field[], sk: PrivateKey): JsonNullifier;
}
