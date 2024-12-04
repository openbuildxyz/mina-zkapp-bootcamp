import { Field } from '../../lib/provable/wrapped.js';
export { stringToFields, stringFromFields, bytesToFields, bytesFromFields, Bijective, };
/**
 * Encodes a JavaScript string into a list of {@link Field} elements.
 *
 * This function is not a valid in-snark computation.
 */
declare function stringToFields(message: string): import("../../lib/provable/field.js").Field[];
/**
 * Decodes a list of {@link Field} elements into a JavaScript string.
 *
 * This function is not a valid in-snark computation.
 */
declare function stringFromFields(fields: Field[]): string;
/**
 * Encodes a {@link Uint8Array} into {@link Field} elements.
 */
declare function bytesToFields(bytes: Uint8Array): import("../../lib/provable/field.js").Field[];
/**
 * Decodes a list of {@link Field} elements into a {@link Uint8Array}.
 */
declare function bytesFromFields(fields: Field[]): Uint8Array;
declare const Bijective: {
    Fp: {
        toBytes: (fields: Field[]) => Uint8Array;
        fromBytes: (bytes: Uint8Array) => import("../../lib/provable/field.js").Field[];
        toString(fields: Field[]): string;
        fromString(message: string): import("../../lib/provable/field.js").Field[];
    };
    Fq: {
        toBytes: (fields: Field[]) => Uint8Array;
        fromBytes: (bytes: Uint8Array) => import("../../lib/provable/field.js").Field[];
        toString(fields: Field[]): string;
        fromString(message: string): import("../../lib/provable/field.js").Field[];
    };
};
