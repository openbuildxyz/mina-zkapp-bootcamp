import type { WasmFpOracles, WasmFqOracles } from '../../compiled/node_bindings/plonk_wasm.cjs';
import type * as wasmNamespace from '../../compiled/node_bindings/plonk_wasm.cjs';
import { Oracles } from './kimchi-types.js';
export { oraclesConversion };
type wasm = typeof wasmNamespace;
type WasmOracles = WasmFpOracles | WasmFqOracles;
declare function oraclesConversion(wasm: wasm): {
    fp: {
        oraclesToRust(oracles: Oracles): WasmOracles;
        oraclesFromRust(oracles: WasmOracles): Oracles;
    };
    fq: {
        oraclesToRust(oracles: Oracles): WasmOracles;
        oraclesFromRust(oracles: WasmOracles): Oracles;
    };
};
