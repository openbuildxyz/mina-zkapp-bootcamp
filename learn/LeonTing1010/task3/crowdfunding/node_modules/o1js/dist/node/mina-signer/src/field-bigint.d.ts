import { HashInput } from './derivers-bigint.js';
export { Field, Bool, UInt32, UInt64, Sign };
export { BinableFp, SignableFp };
export { pseudoClass, sizeInBits, checkRange, checkField };
type Field = bigint;
type Bool = boolean;
type UInt32 = bigint;
type UInt64 = bigint;
declare const sizeInBits: number;
type minusOne = 0x40000000000000000000000000000000224698fc094cf91b992d30ed00000000n;
declare const minusOne: minusOne;
type Sign = 1n | minusOne;
declare const checkField: (x: bigint) => void;
declare const BinableFp: import("src/bindings/lib/binable.js").BinableWithBits<bigint>;
declare const SignableFp: import("./derivers-bigint.js").Signable<bigint, string>;
/**
 * The base field of the Pallas curve
 */
declare const Field: ((value: bigint | number | string) => Field) & {
    toBigint: (x: Field) => bigint;
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
 * A field element which is either 0 or 1
 */
declare const Bool: ((value: boolean) => Bool) & {
    fromBigint(x: Field): boolean;
    toBigint(x: Bool): 1n | 0n;
    toInput(x: Bool): HashInput;
    toBoolean(x: Bool): boolean;
    toJSON(x: Bool): boolean;
    fromJSON(b: boolean): boolean;
    empty(): false;
    sizeInBytes: number;
    fromField(x: Field): boolean;
    toBytes(t: boolean): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: boolean, offset: number];
    fromBytes(bytes: number[]): boolean;
    toBits(t: boolean): boolean[];
    fromBits(bits: boolean[]): boolean;
    sizeInBits: number;
};
declare const UInt32: ((value: bigint | number | string) => bigint) & {
    toInput(x: bigint): HashInput;
    maxValue: bigint;
    random(): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    sizeInBits: number;
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
};
declare const UInt64: ((value: bigint | number | string) => bigint) & {
    toInput(x: bigint): HashInput;
    maxValue: bigint;
    random(): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    sizeInBits: number;
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
};
declare const Sign: ((value: 1 | -1) => Sign) & {
    empty(): 1n;
    toInput(x: Sign): HashInput;
    fromFields([x]: Field[]): Sign;
    toJSON(x: Sign): "Positive" | "Negative";
    fromJSON(x: 'Positive' | 'Negative'): Sign;
    toBytes(t: Sign): number[];
    readBytes<N extends number>(bytes: number[], offset: import("src/bindings/crypto/non-negative.js").NonNegativeInteger<N>): [value: Sign, offset: number];
    fromBytes(bytes: number[]): Sign;
    toBits(t: Sign): boolean[];
    fromBits(bits: boolean[]): Sign;
    sizeInBytes: number;
    sizeInBits: number;
};
declare function pseudoClass<F extends (...args: any) => any, M>(constructor: F, module: M): F & M;
declare function checkRange(lower: bigint, upper: bigint, name: string): (x: bigint) => void;
