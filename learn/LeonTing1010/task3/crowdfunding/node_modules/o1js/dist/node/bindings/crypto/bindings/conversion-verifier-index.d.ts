import type { WasmFpPlonkVerifierIndex, WasmFpShifts, WasmFqPlonkVerifierIndex, WasmFqShifts } from '../../compiled/node_bindings/plonk_wasm.cjs';
import type * as wasmNamespace from '../../compiled/node_bindings/plonk_wasm.cjs';
import { MlArray } from '../../../lib/ml/base.js';
import { Field, VerifierIndex } from './kimchi-types.js';
import { ConversionCores } from './conversion-core.js';
export { verifierIndexConversion };
type wasm = typeof wasmNamespace;
type WasmShifts = WasmFpShifts | WasmFqShifts;
type WasmVerifierIndex = WasmFpPlonkVerifierIndex | WasmFqPlonkVerifierIndex;
declare function verifierIndexConversion(wasm: wasm, core: ConversionCores): {
    fp: {
        shiftsToRust([, ...shifts]: MlArray<Field>): WasmShifts;
        shiftsFromRust(s: WasmShifts): MlArray<Field>;
        verifierIndexToRust(vk: VerifierIndex): WasmVerifierIndex;
        verifierIndexFromRust(vk: WasmVerifierIndex): VerifierIndex;
    };
    fq: {
        shiftsToRust([, ...shifts]: MlArray<Field>): WasmShifts;
        shiftsFromRust(s: WasmShifts): MlArray<Field>;
        verifierIndexToRust(vk: VerifierIndex): WasmVerifierIndex;
        verifierIndexFromRust(vk: WasmVerifierIndex): VerifierIndex;
    };
};
