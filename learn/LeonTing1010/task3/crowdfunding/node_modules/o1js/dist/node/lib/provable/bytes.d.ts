import type { ProvablePureExtended } from './types/struct.js';
import { UInt8 } from './int.js';
import { Field } from './field.js';
export { Bytes };
export { createBytes, FlexibleBytes };
type FlexibleBytes = Bytes | (UInt8 | bigint | number)[] | Uint8Array;
/**
 * A provable type representing an array of bytes.
 */
declare class Bytes {
    bytes: UInt8[];
    constructor(bytes: UInt8[]);
    /**
     * Coerce the input to {@link Bytes}.
     *
     * Inputs smaller than `this.size` are padded with zero bytes.
     */
    static from(data: (UInt8 | bigint | number)[] | Uint8Array | Bytes): Bytes;
    toBytes(): Uint8Array;
    toFields(): Field[];
    /**
     * Create {@link Bytes} from a string.
     *
     * Inputs smaller than `this.size` are padded with zero bytes.
     */
    static fromString(s: string): Bytes;
    /**
     * Create random {@link Bytes} using secure builtin randomness.
     */
    static random(): Bytes;
    /**
     * Create {@link Bytes} from a hex string.
     *
     * Inputs smaller than `this.size` are padded with zero bytes.
     */
    static fromHex(xs: string): Bytes;
    /**
     * Convert {@link Bytes} to a hex string.
     */
    toHex(): string;
    /**
     * Base64 encode bytes.
     */
    base64Encode(): Bytes;
    /**
     * Decode Base64-encoded bytes.
     *
     * @param byteLength The length of the output decoded bytes.
     * @returns Decoded bytes as {@link Bytes}.
     *
     * @warning
     * Ensure the input Base64 string does not contain '=' characters in the middle,
     * as it can cause unexpected decoding results.
     */
    base64Decode(byteLength: number): Bytes;
    /**
     * Returns an array of chunks, each of size `size`.
     * @param size size of each chunk
     * @returns an array of {@link UInt8} chunks
     */
    chunk(size: number): UInt8[][];
    static _size?: number;
    static _provable?: ProvablePureExtended<Bytes, {
        bytes: {
            value: bigint;
        }[];
    }, {
        bytes: {
            value: string;
        }[];
    }>;
    /**
     * The size of the {@link Bytes}.
     */
    static get size(): number;
    get length(): number;
    /**
     * `Provable<Bytes>`
     */
    static get provable(): ProvablePureExtended<Bytes, {
        bytes: {
            value: bigint;
        }[];
    }, {
        bytes: {
            value: string;
        }[];
    }>;
}
declare function createBytes(size: number): typeof Bytes;
