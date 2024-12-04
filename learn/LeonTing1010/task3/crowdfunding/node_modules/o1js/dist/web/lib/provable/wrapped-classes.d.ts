import { Bytes as InternalBytes } from './bytes.js';
export { Bytes };
type Bytes = InternalBytes;
/**
 * A provable type representing an array of bytes.
 *
 * ```ts
 * class Bytes32 extends Bytes(32) {}
 *
 * let bytes = Bytes32.fromHex('deadbeef');
 * ```
 */
declare function Bytes(size: number): typeof InternalBytes;
declare namespace Bytes {
    var from: typeof InternalBytes.from;
    var fromHex: typeof InternalBytes.fromHex;
    var fromString: typeof InternalBytes.fromString;
    var Base: typeof InternalBytes;
}
