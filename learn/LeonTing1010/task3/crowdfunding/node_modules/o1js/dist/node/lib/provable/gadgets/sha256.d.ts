import { UInt32 } from '../int.js';
import { FlexibleBytes } from '../bytes.js';
export { SHA256 };
declare function padding(data: FlexibleBytes): UInt32[][];
declare const SHA256: {
    hash(data: FlexibleBytes): import("../bytes.js").Bytes;
    compression: typeof sha256Compression;
    createMessageSchedule: typeof createMessageSchedule;
    padding: typeof padding;
    readonly initialState: UInt32[];
};
/**
 * Performs the SHA-256 compression function on the given hash values and message schedule.
 *
 * @param H - The initial or intermediate hash values (8-element array of UInt32).
 * @param W - The message schedule (64-element array of UInt32).
 *
 * @returns The updated intermediate hash values after compression.
 */
declare function sha256Compression([...H]: UInt32[], W: UInt32[]): UInt32[];
/**
 * Prepares the message schedule for the SHA-256 compression function from the given message block.
 *
 * @param M - The 512-bit message block (16-element array of UInt32).
 * @returns The message schedule (64-element array of UInt32).
 */
declare function createMessageSchedule(M: UInt32[]): UInt32[];
