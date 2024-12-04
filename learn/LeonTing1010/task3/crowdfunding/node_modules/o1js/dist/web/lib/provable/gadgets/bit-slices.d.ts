import { Field } from '../field.js';
import { UInt8 } from '../int.js';
import type { Field3 } from './foreign-field.js';
export { bytesToWord, wordToBytes, wordsToBytes, bytesToWords, sliceField3 };
/**
 * Convert an array of UInt8 to a Field element. Expects little endian representation.
 */
declare function bytesToWord(wordBytes: UInt8[]): Field;
/**
 * Convert a Field element to an array of UInt8. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
declare function wordToBytes(word: Field, bytesPerWord?: number): UInt8[];
/**
 * Convert an array of Field elements to an array of UInt8. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
declare function wordsToBytes(words: Field[], bytesPerWord?: number): UInt8[];
/**
 * Convert an array of UInt8 to an array of Field elements. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
declare function bytesToWords(bytes: UInt8[], bytesPerWord?: number): Field[];
/**
 * Provable method for slicing a 3x88-bit bigint into smaller bit chunks of length `chunkSize`
 *
 * This serves as a range check that the input is in [0, 2^maxBits)
 */
declare function sliceField3([x0, x1, x2]: Field3, { maxBits, chunkSize }: {
    maxBits: number;
    chunkSize: number;
}): Field[];
