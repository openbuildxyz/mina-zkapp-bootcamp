import type { Field } from '../field.js';
import type { Bool } from '../bool.js';
export { assertLessThanGeneric, assertLessThanOrEqualGeneric, lessThanGeneric, lessThanOrEqualGeneric, assertLessThanFull, assertLessThanOrEqualFull, lessThanFull, lessThanOrEqualFull, isOddAndHigh, compareCompatible, fieldToField3, };
/**
 * Prove x <= y assuming 0 <= x, y < c.
 * The upper bound c must satisfy 2c <= p, where p is the field order.
 *
 * Expects a function `rangeCheck(v: Field)` which proves that v is in [0, p-c).
 * (Note: the range check on v can be looser than the assumption on x and y, but it doesn't have to be)
 * The efficiency of the gadget largely depends on the efficiency of `rangeCheck()`.
 *
 * **Warning:** The gadget does not prove x <= y if either 2c > p or x or y are not in [0, c).
 * Neither of these conditions are enforced by the gadget.
 */
declare function assertLessThanOrEqualGeneric(x: Field, y: Field, rangeCheck: (v: Field) => void): void;
/**
 * Prove x < y assuming 0 <= x, y < c.
 *
 * Assumptions are the same as in {@link assertLessThanOrEqualGeneric}.
 */
declare function assertLessThanGeneric(x: Field, y: Field, rangeCheck: (v: Field) => void): void;
/**
 * Return a Bool b that is true if and only if x < y.
 *
 * Assumptions are similar as in {@link assertLessThanOrEqualGeneric}, with some important differences:
 * - c is a required input
 * - the `rangeCheck` function must fully prove that its input is in [0, c)
 */
declare function lessThanGeneric(x: Field, y: Field, c: bigint, rangeCheck: (v: Field) => void): Bool;
/**
 * Return a Bool b that is true if and only if x <= y.
 *
 * Assumptions are similar as in {@link assertLessThanOrEqualGeneric}, with some important differences:
 * - c is a required input
 * - the `rangeCheck` function must fully prove that its input is in [0, c)
 */
declare function lessThanOrEqualGeneric(x: Field, y: Field, c: bigint, rangeCheck: (v: Field) => void): Bool;
/**
 * Assert that x < y.
 *
 * There are no assumptions on the range of x and y, they can occupy the full range [0, p).
 */
declare function assertLessThanFull(x: Field, y: Field): void;
/**
 * Assert that x <= y.
 *
 * There are no assumptions on the range of x and y, they can occupy the full range [0, p).
 */
declare function assertLessThanOrEqualFull(x: Field, y: Field): void;
/**
 * Return a Bool b that is true if and only if x < y.
 *
 * There are no assumptions on the range of x and y, they can occupy the full range [0, p).
 */
declare function lessThanFull(x: Field, y: Field): Bool;
/**
 * Return a Bool b that is true if and only if x <= y.
 *
 * There are no assumptions on the range of x and y, they can occupy the full range [0, p).
 */
declare function lessThanOrEqualFull(x: Field, y: Field): Bool;
/**
 * Splits a field element into a low bit `isOdd` and a 254-bit `high` part.
 *
 * There are no assumptions on the range of x and y, they can occupy the full range [0, p).
 */
declare function isOddAndHigh(x: Field): {
    isOdd: Bool;
    high: Field;
};
/**
 * internal helper, split Field into a 3-limb bigint
 *
 * **Warning:** the output is underconstrained up to a multiple of the modulus that could be added to the bigint.
 */
declare function fieldToField3(x: Field): [Field, Field, Field];
/**
 * Compare x and y assuming both have at most `n` bits.
 *
 * **Important:** If `x` and `y` have more than `n` bits, this doesn't prove the comparison correctly.
 * It is up to the caller to prove that `x` and `y` have at most `n` bits.
 *
 * **Warning:** This was created for 1:1 compatibility with snarky's `compare` gadget.
 * It was designed for R1CS and is extremely inefficient when used with plonkish arithmetization.
 */
declare function compareCompatible(x: Field, y: Field, n?: number): {
    lessOrEqual: Bool;
    less: Bool;
};
