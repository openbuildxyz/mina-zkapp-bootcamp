import type { Field } from '../field.js';
import { TupleN } from '../../util/types.js';
export { rangeCheck64, rangeCheck32, multiRangeCheck, compactMultiRangeCheck, rangeCheckN, isDefinitelyInRangeN, rangeCheck8, rangeCheck16, rangeCheckLessThan16, rangeCheckLessThan64, };
export { l, l2, l3, lMask, l2Mask };
/**
 * Asserts that x is in the range [0, 2^32)
 */
declare function rangeCheck32(x: Field): void;
/**
 * Asserts that x is in the range [0, 2^64).
 *
 * Returns the 4 highest 12-bit limbs of x in reverse order: [x52, x40, x28, x16].
 */
declare function rangeCheck64(x: Field): TupleN<Field, 4>;
declare const l = 88n;
declare const l2: bigint;
declare const l3: bigint;
declare const lMask: bigint;
declare const l2Mask: bigint;
/**
 * Asserts that x, y, z \in [0, 2^88)
 */
declare function multiRangeCheck([x, y, z]: [Field, Field, Field]): void;
/**
 * Compact multi-range-check - checks
 * - xy = x + 2^88*y
 * - x, y, z \in [0, 2^88)
 *
 * Returns the full limbs x, y, z
 */
declare function compactMultiRangeCheck(xy: Field, z: Field): [Field, Field, Field];
/**
 * Asserts that x is in the range [0, 2^n)
 */
declare function rangeCheckN(n: number, x: Field, message?: string): void;
/**
 * Returns a boolean which, being true, proves that x is in the range [0, 2^n).
 *
 * **Beware**: The output being false does **not** prove that x is not in the range [0, 2^n).
 * In other words, it can happen that this returns false even if x is in the range [0, 2^n).
 *
 * This should not be viewed as a standalone provable method but as an advanced helper function
 * for gadgets which need a weakened form of range check.
 */
declare function isDefinitelyInRangeN(n: number, x: Field): import("../bool.js").Bool;
declare function rangeCheck16(x: Field): void;
declare function rangeCheck8(x: Field): void;
declare function rangeCheckLessThan16(bits: number, x: Field): void;
declare function rangeCheckLessThan64(bits: number, x: Field): void;
