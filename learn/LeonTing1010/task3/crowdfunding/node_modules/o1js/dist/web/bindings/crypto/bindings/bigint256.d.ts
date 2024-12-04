import { MlBool } from '../../../lib/ml/base.js';
/**
 * TS implementation of Pasta_bindings.BigInt256
 */
export { Bigint256Bindings, Bigint256, toMlStringAscii, fromMlString, MlBytes, mlBytesFromUint8Array, mlBytesToUint8Array, };
type Bigint256 = [0, bigint];
declare const Bigint256Bindings: {
    caml_bigint_256_div: ([, x]: Bigint256, [, y]: Bigint256) => Bigint256;
    caml_bigint_256_print: ([, x]: Bigint256) => void;
    caml_bigint_256_of_numeral: (s: MlBytes, i: number, j: number) => Bigint256;
    caml_bigint_256_of_decimal_string: (s: MlBytes) => Bigint256;
    caml_bigint_256_num_limbs: () => number;
    caml_bigint_256_bytes_per_limb: () => number;
    caml_bigint_256_compare: ([, x]: Bigint256, [, y]: Bigint256) => number;
    caml_bigint_256_to_string: (x: Bigint256) => MlBytes;
    caml_bigint_256_test_bit: (b: Bigint256, i: number) => MlBool;
    caml_bigint_256_to_bytes: ([, x]: Bigint256) => MlBytes;
    caml_bigint_256_of_bytes: (ocamlBytes: MlBytes) => Bigint256;
    caml_bigint_256_deep_copy: ([, x]: Bigint256) => Bigint256;
};
declare function fromMlString(s: MlBytes): string;
declare function toMlStringAscii(s: string): MlBytes;
declare function mlBytesFromUint8Array(uint8array: Uint8Array | number[]): MlBytes;
declare function mlBytesToUint8Array(ocaml_bytes: MlBytes): Uint8Array;
declare class MlBytes {
    t: number;
    c: string;
    l: number;
    constructor(tag: number, content: string, length: number);
    toString(): string;
    toUtf16(): string;
    slice(): MlBytes;
}
