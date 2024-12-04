import type { Wasm, RustConversion } from '../bindings.js';
import type { WasmFpSrs, WasmFqSrs } from '../../compiled/node_bindings/plonk_wasm.cjs';
import { PolyComm } from './kimchi-types.js';
import { type Cache } from '../../../lib/proof-system/cache.js';
export { srs, setSrsCache, unsetSrsCache };
type WasmSrs = WasmFpSrs | WasmFqSrs;
declare function setSrsCache(c: Cache): void;
declare function unsetSrsCache(): void;
declare function srs(wasm: Wasm, conversion: RustConversion): {
    fp: {
        /**
         * returns existing stored SRS or falls back to creating a new one
         */
        create(size: number): WasmSrs;
        /**
         * returns ith Lagrange basis commitment for a given domain size
         */
        lagrangeCommitment(srs: WasmSrs, domainSize: number, i: number): PolyComm;
        /**
         * adds Lagrange basis for a given domain size
         */
        addLagrangeBasis(srs: WasmSrs, logSize: number): void;
    };
    fq: {
        /**
         * returns existing stored SRS or falls back to creating a new one
         */
        create(size: number): WasmSrs;
        /**
         * returns ith Lagrange basis commitment for a given domain size
         */
        lagrangeCommitment(srs: WasmSrs, domainSize: number, i: number): PolyComm;
        /**
         * adds Lagrange basis for a given domain size
         */
        addLagrangeBasis(srs: WasmSrs, logSize: number): void;
    };
};
