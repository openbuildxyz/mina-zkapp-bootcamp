/**
 * TS implementation of Kimchi_bindings.FieldVectors
 */
import { MlArray } from '../../../lib/ml/base.js';
import { Field } from './field.js';
export { FpVectorBindings, FqVectorBindings };
export { FieldVector };
type FieldVector = MlArray<Field>;
declare const FpVectorBindings: {
    caml_fp_vector_length: (v: FieldVector) => number;
    caml_fp_vector_set: (v: FieldVector, i: number, x: Field) => void;
    caml_fp_vector_create: () => FieldVector;
    caml_fp_vector_emplace_back: (v: FieldVector, x: Field) => void;
    caml_fp_vector_get: (v: FieldVector, i: number) => Field;
};
declare const FqVectorBindings: {
    caml_fq_vector_length: (v: FieldVector) => number;
    caml_fq_vector_set: (v: FieldVector, i: number, x: Field) => void;
    caml_fq_vector_create: () => FieldVector;
    caml_fq_vector_emplace_back: (v: FieldVector, x: Field) => void;
    caml_fq_vector_get: (v: FieldVector, i: number) => Field;
};
