/**
 * This file provides helpers to
 * - encode and decode all 4 kinds of snark keys to/from bytes
 * - create a header which is passed to the `Cache` so that it can figure out where and if to read from cache
 *
 * The inputs are `SnarkKeyHeader` and `SnarkKey`, which are OCaml tagged enums defined in pickles_bindings.ml
 */
import { WasmPastaFpPlonkIndex, WasmPastaFqPlonkIndex } from '../../bindings/compiled/node_bindings/plonk_wasm.cjs';
import { VerifierIndex } from '../../bindings/crypto/bindings/kimchi-types.js';
import { MlString } from '../ml/base.js';
import { CacheHeader } from './cache.js';
import type { MethodInterface } from './zkprogram.js';
export { parseHeader, encodeProverKey, decodeProverKey, SnarkKeyHeader, SnarkKey, };
export type { MlWrapVerificationKey };
declare enum KeyType {
    StepProvingKey = 0,
    StepVerificationKey = 1,
    WrapProvingKey = 2,
    WrapVerificationKey = 3
}
type SnarkKeyHeader = [KeyType.StepProvingKey, MlStepProvingKeyHeader] | [KeyType.StepVerificationKey, MlStepVerificationKeyHeader] | [KeyType.WrapProvingKey, MlWrapProvingKeyHeader] | [KeyType.WrapVerificationKey, MlWrapVerificationKeyHeader];
type SnarkKey = [KeyType.StepProvingKey, MlBackendKeyPair<WasmPastaFpPlonkIndex>] | [KeyType.StepVerificationKey, VerifierIndex] | [KeyType.WrapProvingKey, MlBackendKeyPair<WasmPastaFqPlonkIndex>] | [KeyType.WrapVerificationKey, MlWrapVerificationKey];
/**
 * Create `CacheHeader` from a `SnarkKeyHeader` plus some context available to `compile()`
 */
declare function parseHeader(programName: string, methods: MethodInterface[], header: SnarkKeyHeader): CacheHeader;
/**
 * Encode a snark key to bytes
 */
declare function encodeProverKey(value: SnarkKey): Uint8Array;
/**
 * Decode bytes to a snark key with the help of its header
 */
declare function decodeProverKey(header: SnarkKeyHeader, bytes: Uint8Array): SnarkKey;
declare class MlConstraintSystem {
}
type MlBackendKeyPair<WasmIndex> = [
    _: 0,
    index: WasmIndex,
    cs: MlConstraintSystem
];
type MlSnarkKeysHeader = [
    _: 0,
    headerVersion: number,
    kind: [_: 0, type: MlString, identifier: MlString],
    constraintConstants: unknown,
    length: number,
    constraintSystemHash: MlString,
    identifyingHash: MlString
];
type MlStepProvingKeyHeader = [
    _: 0,
    typeEqual: number,
    snarkKeysHeader: MlSnarkKeysHeader,
    index: number,
    constraintSystem: MlConstraintSystem
];
type MlStepVerificationKeyHeader = [
    _: 0,
    typeEqual: number,
    snarkKeysHeader: MlSnarkKeysHeader,
    index: number,
    digest: unknown
];
type MlWrapProvingKeyHeader = [
    _: 0,
    typeEqual: number,
    snarkKeysHeader: MlSnarkKeysHeader,
    constraintSystem: MlConstraintSystem
];
type MlWrapVerificationKeyHeader = [
    _: 0,
    typeEqual: number,
    snarkKeysHeader: MlSnarkKeysHeader,
    digest: unknown
];
declare class MlWrapVerificationKey {
}
