import { Json, AccountUpdate } from '../../bindings/mina-transaction/gen/transaction-bigint.js';
import { PublicKey } from '../../bindings/mina-transaction/transaction-leaves-bigint.js';
import type { FiniteField } from '../../bindings/crypto/finite-field.js';
export { Random, sample, withHardCoded };
type Random<T> = {
    create(): () => T;
    invalid?: Random<T>;
};
type RandomWithInvalid<T> = Required<Random<T>>;
declare function Random_<T>(next: () => T, toInvalid?: (valid: Random<T>) => Random<T>): Random<T>;
declare function sample<T>(rng: Random<T>, size: number): T[];
declare const Random: typeof Random_ & {
    constant: typeof constant;
    int: typeof int;
    nat: typeof nat;
    fraction: typeof fraction;
    boolean: Random<boolean>;
    byte: Random<number>;
    bytes: typeof bytes;
    string: typeof string;
    base58: typeof base58;
    array: typeof array & {
        ofSize: typeof arrayOfSizeValid;
    };
    record: typeof record;
    map: typeof map & {
        withInvalid: typeof mapWithInvalid;
    };
    step: typeof step;
    oneOf: typeof oneOf;
    withHardCoded: typeof withHardCoded;
    dependent: typeof dependent;
    apply: typeof apply;
    reject: typeof reject;
    dice: typeof dice & {
        ofSize: Random<(size: number) => number>;
    };
    field: Required<Random<bigint>>;
    otherField: typeof fieldWithInvalid;
    bool: Random<boolean>;
    uint8: Required<Random<bigint>>;
    uint32: Required<Random<bigint>>;
    uint64: Required<Random<bigint>>;
    biguint: typeof biguintWithInvalid;
    bignat: typeof bignatWithInvalid;
    privateKey: Random<bigint>;
    publicKey: Random<PublicKey> & {
        invalid: Random<PublicKey>;
    };
    scalar: Required<Random<bigint>>;
    signature: Random<{
        r: bigint;
        s: bigint;
    }>;
    accountUpdate: Random<AccountUpdate>;
    feePayer: Random<{
        body: {
            publicKey: PublicKey;
            fee: bigint;
            validUntil?: bigint | undefined;
            nonce: bigint;
        };
        authorization: string;
    }>;
    memo: Random<string>;
    json: {
        accountUpdate: Random<Json.AccountUpdate>;
        feePayer: Random<{
            body: {
                publicKey: string;
                fee: string;
                validUntil: string | null;
                nonce: string;
            };
            authorization: string;
        }>;
        memoString: Random<string>;
        uint32: {
            invalid: Random<string>;
            create(): () => string;
        };
        uint64: {
            invalid: Random<string>;
            create(): () => string;
        };
        sign: {
            invalid: Random<"Positive" | "Negative">;
            create(): () => "Positive" | "Negative";
        };
        publicKey: Required<Random<string>>;
        privateKey: Required<Random<string>>;
        keypair: Random<{
            privateKey: string;
            publicKey: string;
        }>;
        signature: Required<Random<string>>;
        signatureJson: Random<import("../../mina-signer/src/signature.js").SignatureJson>;
        field: Random<string>;
    };
};
declare function constant<T>(t: T): Random<T>;
declare function bytes(size: number | Random<number>): Random<number[]>;
declare function string(size: number | Random<number>): Random<string>;
declare function base58(size: number | Random<number>): Random<string>;
declare function oneOf<Types extends readonly any[]>(...values: {
    [K in keyof Types]: Random<Types[K]> | RandomWithInvalid<Types[K]> | Types[K];
}): Random<Types[number]>;
/**
 * map a list of generators to a new generator, by specifying the transformation which maps samples
 * of the input generators to a sample of the result.
 */
declare function map<T extends readonly any[], S>(...args: [...rngs: {
    [K in keyof T]: Random<T[K]>;
}, to: (...values: T) => S]): Random<S>;
/**
 * dependent is like {@link map}, with the difference that the mapping contains a free variable
 * whose samples have to be provided as inputs separately. this is useful to create correlated generators, where
 * multiple generators are all dependent on the same extra variable which is sampled independently.
 *
 * dependent can be used in two different ways:
 * - as a function from a random generator of the free variable to a random generator of the result
 * - as a random generator whose samples are _functions_ from free variable to result: `Random<(arg: Free) => Result>`
 */
declare function dependent<T extends readonly any[], Result, Free>(...args: [
    ...rngs: {
        [K in keyof T]: Random<T[K]>;
    },
    to: (free: Free, values: T) => Result
]): Random<(arg: Free) => Result> & ((arg: Random<Free>) => Random<Result>);
declare function step<T extends readonly any[], S>(...args: [
    ...rngs: {
        [K in keyof T]: Random<T[K]>;
    },
    step: (current: S, ...values: T) => S,
    initial: S
]): Random<S>;
declare function arrayOfSizeValid<T>(element: Random<T>, { reset }?: {
    reset?: boolean | undefined;
}): Random<(n: number) => T[]>;
declare function reject<T>(rng: Random<T>, isRejected: (t: T) => boolean): Random<T>;
type Action<S> = Random<(s: S) => S>;
declare function apply<S>(rng: Random<S>, howMany: number | Random<number>, ...actions: Action<S>[]): Random<S>;
declare function withHardCoded<T>(rng: Random<T>, ...hardCoded: T[]): Random<T>;
/**
 * uniform distribution over range [min, max]
 * with bias towards special values 0, 1, -1, 2, min, max
 */
declare function int(min: number, max: number): Random<number>;
/**
 * log-uniform distribution over range [0, max]
 * with bias towards 0, 1, 2
 */
declare function nat(max: number): Random<number>;
declare function fraction(fixedPrecision?: number): {
    create: () => () => number;
};
/**
 * unbiased, uniform distribution over range [0, max-1]
 */
declare function dice(max: number): Random<number>;
/**
 * we get invalid uints by sampling from a larger range plus negative numbers
 */
declare function biguintWithInvalid(bits: number): RandomWithInvalid<bigint>;
declare function bignatWithInvalid(max: bigint): RandomWithInvalid<bigint>;
declare function fieldWithInvalid(F: FiniteField): RandomWithInvalid<bigint>;
/**
 * invalid arrays are sampled by generating an array with exactly one invalid input (and any number of valid inputs);
 * (note: invalid arrays have the same length distribution as valid ones, except that they are never empty)
 */
declare function array<T>(element: Random<T>, size: number | Random<number>, options?: {
    reset?: boolean;
}): Random<T[]>;
/**
 * invalid records are similar to arrays: randomly choose one of the fields that have an invalid generator,
 * and set it to its invalid value
 */
declare function record<T extends {}>(gens: {
    [K in keyof T]: Random<T[K]>;
}): Random<T>;
/**
 * map assuming that invalid inputs can be mapped just like valid ones.
 * _one_ of the inputs is sampled as invalid
 */
declare function mapWithInvalid<T extends readonly any[], S>(...args: [...rngs: {
    [K in keyof T]: Random<T[K]>;
}, to: (...values: T) => S]): Random<S>;
