import type { Field } from './field.js';
import { FieldVar, FieldConst } from './core/fieldvar.js';
import { TupleN } from '../util/types.js';
export { Gates, rangeCheck0, rangeCheck1, xor, zero, rotate, generic, lookup, foreignFieldAdd, foreignFieldMul, KimchiGateType, };
export { fieldVar };
declare const Gates: {
    rangeCheck0: typeof rangeCheck0;
    rangeCheck1: typeof rangeCheck1;
    xor: typeof xor;
    zero: typeof zero;
    rotate: typeof rotate;
    generic: typeof generic;
    lookup: typeof lookup;
    foreignFieldAdd: typeof foreignFieldAdd;
    foreignFieldMul: typeof foreignFieldMul;
    raw: typeof raw;
};
declare function rangeCheck0(x: Field, xLimbs12: TupleN<Field, 6>, xLimbs2: TupleN<Field, 8>, isCompact: boolean): void;
/**
 * the rangeCheck1 gate is used in combination with the rangeCheck0,
 * for doing a 3x88-bit range check
 */
declare function rangeCheck1(v2: Field, v12: Field, vCurr: TupleN<Field, 13>, vNext: TupleN<Field, 15>): void;
declare function rotate(field: Field, rotated: Field, excess: Field, limbs: [Field, Field, Field, Field], crumbs: [Field, Field, Field, Field, Field, Field, Field, Field], two_to_rot: bigint): void;
/**
 * Asserts that 16 bit limbs of input two elements are the correct XOR output
 */
declare function xor(input1: Field, input2: Field, outputXor: Field, in1_0: Field, in1_1: Field, in1_2: Field, in1_3: Field, in2_0: Field, in2_1: Field, in2_2: Field, in2_3: Field, out0: Field, out1: Field, out2: Field, out3: Field): void;
/**
 * [Generic gate](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=foreignfield#double-generic-gate)
 * The vanilla PLONK gate that allows us to do operations like:
 * * addition of two registers (into an output register)
 * * multiplication of two registers
 * * equality of a register with a constant
 *
 * More generally, the generic gate controls the coefficients (denoted `c_`) in the equation:
 *
 * `c_l*l + c_r*r + c_o*o + c_m*l*r + c_c === 0`
 */
declare function generic(coefficients: {
    left: bigint | FieldConst;
    right: bigint | FieldConst;
    out: bigint | FieldConst;
    mul: bigint | FieldConst;
    const: bigint | FieldConst;
}, inputs: {
    left: Field | FieldVar;
    right: Field | FieldVar;
    out: Field | FieldVar;
}): void;
/**
 * **[lookup constraint](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=lookup%20gate#lookup)**
 *
 * Lookups allow you to check if a single value, or a series of values, are part of a table. The first case is useful to check for checking if a value belongs to a range (from 0 to 1,000, for example), whereas the second case is useful to check truth tables (for example, checking that three values can be found in the rows of an XOR table) or write and read from a memory vector (where one column is an index, and the other is the value stored at that index).
 *
 * @param tableId the [id](https://github.com/o1-labs/proof-systems/blob/master/kimchi/src/circuits/lookup/tables/mod.rs) of the lookup table.
 * @param index0 the index of the first value to lookup.
 * @param value0 the first value to lookup.
 * @param index1 the index of the second value to lookup.
 * @param value1 the second value to lookup.
 * @param index2 the index of the third value to lookup.
 * @param value2 the third value to lookup.
 *
 */
declare function lookup(tableId: Field, index0: Field, value0: Field, index1: Field, value1: Field, index2: Field, value2: Field): void;
declare function zero(a: Field, b: Field, c: Field): void;
/**
 * bigint addition which allows for field overflow and carry
 *
 * - `l01 + sign*r01 - overflow*f01 - carry*2^2l === r01`
 * - `l2  + sign*r2  - overflow*f2  + carry      === r2`
 * - overflow is 0 or sign
 * - carry is 0, 1 or -1
 *
 * assumes that the result is placed in the first 3 cells of the next row!
 */
declare function foreignFieldAdd({ left, right, overflow, carry, modulus, sign, }: {
    left: TupleN<Field, 3>;
    right: TupleN<Field, 3>;
    overflow: Field;
    carry: Field;
    modulus: TupleN<bigint, 3>;
    sign: 1n | -1n;
}): void;
/**
 * Foreign field multiplication
 */
declare function foreignFieldMul(inputs: {
    left: TupleN<Field, 3>;
    right: TupleN<Field, 3>;
    remainder: TupleN<Field, 2>;
    quotient: TupleN<Field, 3>;
    quotientHiBound: Field;
    product1: TupleN<Field, 3>;
    carry0: Field;
    carry1p: TupleN<Field, 7>;
    carry1c: TupleN<Field, 4>;
    foreignFieldModulus2: bigint;
    negForeignFieldModulus: TupleN<bigint, 3>;
}): void;
declare function raw(kind: KimchiGateType, values: Field[], coefficients: bigint[]): void;
declare enum KimchiGateType {
    Zero = 0,
    Generic = 1,
    Poseidon = 2,
    CompleteAdd = 3,
    VarBaseMul = 4,
    EndoMul = 5,
    EndoMulScalar = 6,
    Lookup = 7,
    CairoClaim = 8,
    CairoInstruction = 9,
    CairoFlags = 10,
    CairoTransition = 11,
    RangeCheck0 = 12,
    RangeCheck1 = 13,
    ForeignFieldAdd = 14,
    ForeignFieldMul = 15,
    Xor16 = 16,
    Rot64 = 17
}
declare function fieldVar(x: Field | FieldVar | bigint): FieldVar;
