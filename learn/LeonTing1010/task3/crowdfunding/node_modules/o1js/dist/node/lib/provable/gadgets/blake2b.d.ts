import { UInt64 } from '../int.js';
import { FlexibleBytes } from '../bytes.js';
export { BLAKE2B };
declare const BLAKE2B: {
    hash(data: FlexibleBytes, digestLength?: number): import("../bytes.js").Bytes;
    readonly IV: UInt64[];
};
