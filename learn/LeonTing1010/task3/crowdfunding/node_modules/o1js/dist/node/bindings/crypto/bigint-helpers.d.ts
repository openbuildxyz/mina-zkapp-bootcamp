export { changeBase, bytesToBigInt, bigIntToBytes, bigIntToBits, parseHexString32, log2, max, abs, sign, bytesToBigint32, bigintToBytes32, };
declare function bytesToBigint32(bytes: Uint8Array): bigint;
declare function bigintToBytes32(x: bigint, bytes: Uint8Array): Uint8Array;
declare function bytesToBigInt(bytes: Uint8Array | number[]): bigint;
declare function parseHexString32(input: string): bigint;
/**
 * Transforms bigint to little-endian array of bytes (numbers between 0 and 255) of a given length.
 * Throws an error if the bigint doesn't fit in the given number of bytes.
 */
declare function bigIntToBytes(x: bigint, length?: number): number[];
/**
 * Transforms bigint to little-endian array of bits (booleans).
 * The length of the bit array is determined as needed.
 */
declare function bigIntToBits(x: bigint): boolean[];
declare function changeBase(digits: bigint[], base: bigint, newBase: bigint): bigint[];
/**
 * ceil(log2(n))
 * = smallest k such that n <= 2^k
 */
declare function log2(n: number | bigint): number;
declare function max(a: bigint, b: bigint): bigint;
declare function abs(x: bigint): bigint;
declare function sign(x: bigint): 1n | -1n;
