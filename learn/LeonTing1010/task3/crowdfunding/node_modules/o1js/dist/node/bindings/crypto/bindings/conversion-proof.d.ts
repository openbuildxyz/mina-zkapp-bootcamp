import type { WasmFpProverProof, WasmFqProverProof } from '../../compiled/node_bindings/plonk_wasm.cjs';
import type * as wasmNamespace from '../../compiled/node_bindings/plonk_wasm.cjs';
import type { ProofWithPublic, RuntimeTable, RuntimeTableCfg, LookupTable } from './kimchi-types.js';
import { MlArray } from '../../../lib/ml/base.js';
import { ConversionCores } from './conversion-core.js';
export { proofConversion };
type wasm = typeof wasmNamespace;
type WasmProverProof = WasmFpProverProof | WasmFqProverProof;
declare function proofConversion(wasm: wasm, core: ConversionCores): {
    fp: {
        proofToRust([, public_evals, proof]: ProofWithPublic): WasmProverProof;
        proofFromRust(wasmProof: WasmProverProof): ProofWithPublic;
        runtimeTablesToRust([, ...tables]: MlArray<RuntimeTable>): Uint32Array;
        runtimeTableCfgsToRust([, ...tableCfgs]: MlArray<RuntimeTableCfg>): Uint32Array;
        lookupTablesToRust([, ...tables]: MlArray<LookupTable>): Uint32Array;
    };
    fq: {
        proofToRust([, public_evals, proof]: ProofWithPublic): WasmProverProof;
        proofFromRust(wasmProof: WasmProverProof): ProofWithPublic;
        runtimeTablesToRust([, ...tables]: MlArray<RuntimeTable>): Uint32Array;
        runtimeTableCfgsToRust([, ...tableCfgs]: MlArray<RuntimeTableCfg>): Uint32Array;
        lookupTablesToRust([, ...tables]: MlArray<LookupTable>): Uint32Array;
    };
};
