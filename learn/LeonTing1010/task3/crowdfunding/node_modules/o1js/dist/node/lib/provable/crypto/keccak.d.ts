import { FlexibleBytes } from '../bytes.js';
export { Keccak };
declare const Keccak: {
    /**
     * Implementation of [NIST SHA-3](https://csrc.nist.gov/pubs/fips/202/final) Hash Function.
     * Supports output lengths of 256, 384, or 512 bits.
     *
     * Applies the SHA-3 hash function to a list of big-endian byte-sized {@link Field} elements, flexible to handle varying output lengths (256, 384, 512 bits) as specified.
     *
     * The function accepts {@link Bytes} as the input message, which is a type that represents a static-length list of byte-sized field elements (range-checked using {@link Gadgets.rangeCheck8}).
     * Alternatively, you can pass plain `number[]` of `Uint8Array` to perform a hash outside provable code.
     *
     * Produces an output of {@link Bytes} that conforms to the chosen bit length.
     * Both input and output bytes are big-endian.
     *
     * @param len - Desired output length in bits. Valid options: 256, 384, 512.
     * @param message - Big-endian {@link Bytes} representing the message to hash.
     *
     * ```ts
     * let preimage = Bytes.fromString("hello world");
     * let digest256 = Keccak.nistSha3(256, preimage);
     * let digest384 = Keccak.nistSha3(384, preimage);
     * let digest512 = Keccak.nistSha3(512, preimage);
     * ```
     *
     */
    nistSha3(len: 256 | 384 | 512, message: FlexibleBytes): import("../bytes.js").Bytes;
    /**
     * Ethereum-Compatible Keccak-256 Hash Function.
     * This is a specialized variant of {@link Keccak.preNist} configured for a 256-bit output length.
     *
     * Primarily used in Ethereum for hashing transactions, messages, and other types of payloads.
     *
     * The function accepts {@link Bytes} as the input message, which is a type that represents a static-length list of byte-sized field elements (range-checked using {@link Gadgets.rangeCheck8}).
     * Alternatively, you can pass plain `number[]` of `Uint8Array` to perform a hash outside provable code.
     *
     * Produces an output of {@link Bytes} of length 32. Both input and output bytes are big-endian.
     *
     * @param message - Big-endian {@link Bytes} representing the message to hash.
     *
     * ```ts
     * let preimage = Bytes.fromString("hello world");
     * let digest = Keccak.ethereum(preimage);
     * ```
     */
    ethereum(message: FlexibleBytes): import("../bytes.js").Bytes;
    /**
     * Implementation of [pre-NIST Keccak](https://keccak.team/keccak.html) hash function.
     * Supports output lengths of 256, 384, or 512 bits.
     *
     * Keccak won the SHA-3 competition and was slightly altered before being standardized as SHA-3 by NIST in 2015.
     * This variant was used in Ethereum before the NIST standardization, by specifying `len` as 256 bits you can obtain the same hash function as used by Ethereum {@link Keccak.ethereum}.
     *
     * The function applies the pre-NIST Keccak hash function to a list of byte-sized {@link Field} elements and is flexible to handle varying output lengths (256, 384, 512 bits) as specified.
     *
     * {@link Keccak.preNist} accepts {@link Bytes} as the input message, which is a type that represents a static-length list of byte-sized field elements (range-checked using {@link Gadgets.rangeCheck8}).
     * Alternatively, you can pass plain `number[]` of `Uint8Array` to perform a hash outside provable code.
     *
     * Produces an output of {@link Bytes} that conforms to the chosen bit length.
     * Both input and output bytes are big-endian.
     *
     * @param len - Desired output length in bits. Valid options: 256, 384, 512.
     * @param message - Big-endian {@link Bytes} representing the message to hash.
     *
     * ```ts
     * let preimage = Bytes.fromString("hello world");
     * let digest256 = Keccak.preNist(256, preimage);
     * let digest384 = Keccak.preNist(384, preimage);
     * let digest512= Keccak.preNist(512, preimage);
     * ```
     *
     */
    preNist(len: 256 | 384 | 512, message: FlexibleBytes): import("../bytes.js").Bytes;
};
