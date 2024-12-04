import { GroupProjective } from '../../bindings/crypto/elliptic-curve.js';
import { Bool, Field } from './field-bigint.js';
import { HashInputLegacy } from './poseidon-bigint.js';
export { Group, PublicKey, Scalar, PrivateKey, versionNumbers };
declare const versionNumbers: {
    field: number;
    scalar: number;
    publicKey: number;
    signature: number;
};
type Group = {
    x: Field;
    y: Field;
};
type PublicKey = {
    x: Field;
    isOdd: Bool;
};
type Scalar = bigint;
type PrivateKey = bigint;
/**
 * A non-zero point on the Pallas curve in affine form { x, y }
 */
declare const Group: {
    toProjective({ x, y }: Group): GroupProjective;
    /**
     * Convert a projective point to a non-zero affine point.
     * Throws an error if the point is zero / infinity, i.e. if z === 0
     */
    fromProjective(point: GroupProjective): Group;
    readonly generatorMina: Group;
    scale(point: Group, scalar: Scalar): Group;
    b: bigint;
    toFields({ x, y }: Group): bigint[];
};
/**
 * A public key, represented by a non-zero point on the Pallas curve, in compressed form { x, isOdd }
 */
declare const PublicKey: {
    toJSON(publicKey: PublicKey): string;
    fromJSON(json: string): PublicKey;
    toGroup({ x, isOdd }: PublicKey): Group;
    fromGroup({ x, y }: Group): PublicKey;
    equal(pk1: PublicKey, pk2: PublicKey): boolean;
    toInputLegacy({ x, isOdd }: PublicKey): HashInputLegacy;
    toBytes(t: {
        x: bigint;
        isOdd: boolean;
    }): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: {
        x: bigint;
        isOdd: boolean;
    }, offset: number];
    fromBytes(bytes: number[]): {
        x: bigint;
        isOdd: boolean;
    };
    toBase58(t: {
        x: bigint;
        isOdd: boolean;
    }): string;
    fromBase58(base58: string): {
        x: bigint;
        isOdd: boolean;
    };
    toInput: (x: {
        x: bigint;
        isOdd: boolean;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    empty: () => {
        x: bigint;
        isOdd: boolean;
    };
};
/**
 * The scalar field of the Pallas curve
 */
declare const Scalar: ((value: bigint | number | string) => Scalar) & {
    modulus: bigint;
    sizeInBits: number;
    t: bigint;
    M: bigint;
    twoadicRoot: bigint;
    mod(x: bigint): bigint;
    add(x: bigint, y: bigint): bigint;
    not(x: bigint, bits: number): bigint;
    negate(x: bigint): bigint;
    sub(x: bigint, y: bigint): bigint;
    mul(x: bigint, y: bigint): bigint;
    inverse: (x: bigint) => bigint | undefined;
    div(x: bigint, y: bigint): bigint | undefined;
    square(x: bigint): bigint;
    isSquare(x: bigint): boolean;
    sqrt(x: bigint): bigint | undefined;
    power(x: bigint, n: bigint): bigint;
    dot(x: bigint[], y: bigint[]): bigint;
    equal(x: bigint, y: bigint): boolean;
    isEven(x: bigint): boolean;
    random(): bigint;
    fromNumber(x: number): bigint;
    fromBigint(x: bigint): bigint;
    rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
    leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
    rightShift(x: bigint, bits: number): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
};
/**
 * A private key, represented by a scalar of the Pallas curve
 */
declare const PrivateKey: {
    toPublicKey(key: PrivateKey): PublicKey;
    convertPrivateKeyToBase58WithMod: typeof convertPrivateKeyToBase58WithMod;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBase58(t: bigint): string;
    fromBase58(base58: string): bigint;
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
    modulus: bigint;
    sizeInBits: number;
    t: bigint;
    M: bigint;
    twoadicRoot: bigint;
    mod(x: bigint): bigint;
    add(x: bigint, y: bigint): bigint;
    not(x: bigint, bits: number): bigint;
    negate(x: bigint): bigint;
    sub(x: bigint, y: bigint): bigint;
    mul(x: bigint, y: bigint): bigint;
    inverse: (x: bigint) => bigint | undefined;
    div(x: bigint, y: bigint): bigint | undefined;
    square(x: bigint): bigint;
    isSquare(x: bigint): boolean;
    sqrt(x: bigint): bigint | undefined;
    power(x: bigint, n: bigint): bigint;
    dot(x: bigint[], y: bigint[]): bigint;
    equal(x: bigint, y: bigint): boolean;
    isEven(x: bigint): boolean;
    random(): bigint;
    fromNumber(x: number): bigint;
    fromBigint(x: bigint): bigint;
    rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
    leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
    rightShift(x: bigint, bits: number): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
};
declare function convertPrivateKeyToBase58WithMod(keyBase58: string): string;
