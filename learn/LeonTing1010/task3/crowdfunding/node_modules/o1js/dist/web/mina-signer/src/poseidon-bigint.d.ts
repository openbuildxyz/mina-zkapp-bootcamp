import { Field } from './field-bigint.js';
import { Poseidon } from '../../bindings/crypto/poseidon.js';
import { prefixes } from '../../bindings/crypto/constants.js';
import { GenericHashInput } from '../../bindings/lib/generic.js';
export { Poseidon, HashHelpers, HashInput, prefixes, packToFields, hashWithPrefix, packToFieldsLegacy, HashInputLegacy, inputToBitsLegacy, HashLegacy, };
type HashInput = GenericHashInput<Field>;
declare const HashInput: {
    readonly empty: {};
    append(input1: GenericHashInput<bigint>, input2: GenericHashInput<bigint>): GenericHashInput<bigint>;
};
declare const HashHelpers: {
    salt: (prefix: string) => bigint[];
    emptyHashWithPrefix: (prefix: string) => bigint;
    hashWithPrefix: (prefix: string, input: bigint[]) => bigint;
};
declare let hashWithPrefix: (prefix: string, input: bigint[]) => bigint;
declare const HashLegacy: {
    salt: (prefix: string) => bigint[];
    emptyHashWithPrefix: (prefix: string) => bigint;
    hashWithPrefix: (prefix: string, input: bigint[]) => bigint;
};
/**
 * Convert the {fields, packed} hash input representation to a list of field elements
 * Random_oracle_input.Chunked.pack_to_fields
 */
declare function packToFields({ fields, packed }: HashInput): bigint[];
/**
 * Random_oracle_input.Legacy.pack_to_fields
 */
declare function packToFieldsLegacy({ fields, bits }: HashInputLegacy): bigint[];
declare function inputToBitsLegacy({ fields, bits }: HashInputLegacy): boolean[];
type HashInputLegacy = {
    fields: Field[];
    bits: boolean[];
};
declare const HashInputLegacy: {
    empty(): HashInputLegacy;
    bits(bits: boolean[]): HashInputLegacy;
    append(input1: HashInputLegacy, input2: HashInputLegacy): HashInputLegacy;
};
