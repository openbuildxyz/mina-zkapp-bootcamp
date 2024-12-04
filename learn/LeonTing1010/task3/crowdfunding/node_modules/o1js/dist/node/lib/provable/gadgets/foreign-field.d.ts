import type { Field } from '../field.js';
import { Tuple } from '../../util/types.js';
import type { Bool } from '../bool.js';
export { ForeignField, Field3 };
export { bigint3, Sign, split, combine, weakBound, Sum, assertMul, field3FromBits, };
/**
 * A 3-tuple of Fields, representing a 3-limb bigint.
 */
type Field3 = [Field, Field, Field];
type bigint3 = [bigint, bigint, bigint];
type Sign = -1n | 1n;
declare const ForeignField: {
    add(x: Field3, y: Field3, f: bigint): Field3;
    sub(x: Field3, y: Field3, f: bigint): Field3;
    negate(x: Field3, f: bigint): Field3;
    sum: typeof sum;
    Sum(x: Field3): Sum;
    mul: typeof multiply;
    inv: typeof inverse;
    div: typeof divide;
    assertMul: typeof assertMul;
    assertAlmostReduced: typeof assertAlmostReduced;
    assertLessThan: typeof assertLessThan;
    assertLessThanOrEqual: typeof assertLessThanOrEqual;
    equals: typeof equals;
    toCanonical: typeof toCanonical;
};
/**
 * computes x[0] + sign[0] * x[1] + ... + sign[n-1] * x[n] modulo f
 *
 * assumes that inputs are range checked, does range check on the result.
 */
declare function sum(x: Field3[], sign: Sign[], f: bigint): Field3;
declare function multiply(a: Field3, b: Field3, f: bigint): Field3;
declare function inverse(x: Field3, f: bigint): Field3;
declare function divide(x: Field3, y: Field3, f: bigint, { allowZeroOverZero }?: {
    allowZeroOverZero?: boolean | undefined;
}): Field3;
declare function weakBound(x: Field, f: bigint): Field;
/**
 * Apply range checks and weak bounds checks to a list of Field3s.
 * Optimal if the list length is a multiple of 3.
 */
declare function assertAlmostReduced(xs: Field3[], f: bigint, skipMrc?: boolean): void;
/**
 * check whether x = c mod f
 *
 * c is a constant, and we require c in [0, f)
 *
 * assumes that x is almost reduced mod f, so we know that x might be c or c + f, but not c + 2f, c + 3f, ...
 */
declare function equals(x: Field3, c: bigint, f: bigint): Bool;
/**
 * Convert x, which may be unreduced, to a canonical representative < f.
 *
 * Note: This method is complete, it works for all unreduced field elements.
 * It can therefore be used to protect against incompleteness of field operations in other places.
 */
declare function toCanonical(x: Field3, f: bigint): Field3;
declare const Field3: {
    /**
     * Turn a bigint into a 3-tuple of Fields
     */
    from(x: bigint | Field3): Field3;
    /**
     * Turn a 3-tuple of Fields into a bigint
     */
    toBigint(x: Field3): bigint;
    /**
     * Turn several 3-tuples of Fields into bigints
     */
    toBigints<T extends Tuple<Field3>>(...xs: T): [...{ [i in keyof T]: bigint; }];
    /**
     * Check whether a 3-tuple of Fields is constant
     */
    isConstant(x: Field3): boolean;
    /**
     * `Provable<T>` interface for `Field3 = [Field, Field, Field]`.
     *
     * Note: Witnessing this creates a plain tuple of field elements without any implicit
     * range checks.
     */
    provable: {
        toValue(x: Field3): bigint;
        fromValue(x: bigint | Field3): Field3;
        toFields: (x: [Field, Field, Field]) => Field[];
        toAuxiliary: (x?: [Field, Field, Field] | undefined) => any[];
        sizeInFields: () => number;
        check: (x: [Field, Field, Field]) => void;
        toCanonical?: ((x: [Field, Field, Field]) => [Field, Field, Field]) | undefined;
        fromFields: (x: Field[]) => [Field, Field, Field];
        toInput: (x: [Field, Field, Field]) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: [Field, Field, Field]) => [any, any, any];
        fromJSON: (x: [any, any, any]) => [Field, Field, Field];
        empty: () => [Field, Field, Field];
    };
};
declare function combine([x0, x1, x2]: bigint3): bigint;
declare function split(x: bigint): bigint3;
/**
 * Optimized multiplication of sums, like (x + y)*z = a + b + c
 *
 * We use several optimizations over naive summing and then multiplying:
 *
 * - we skip the range check on the remainder sum, because ffmul is sound with r being a sum of range-checked values
 * - we replace the range check on the input sums with an extra low limb sum using generic gates
 * - we chain the first input's sum into the ffmul gate
 *
 * As usual, all values are assumed to be range checked, and the left and right multiplication inputs
 * are assumed to be bounded such that `l * r < 2^264 * (native modulus)`.
 * However, all extra checks that are needed on the _sums_ are handled here.
 */
declare function assertMul(x: Field3 | Sum, y: Field3 | Sum, xy: Field3 | Sum, f: bigint, message?: string): void;
/**
 * Lazy sum of {@link Field3} elements, which can be used as input to `Gadgets.ForeignField.assertMul()`.
 */
declare class Sum {
    #private;
    constructor(x: Field3);
    get result(): Field3;
    get length(): number;
    add(y: Field3): this;
    sub(y: Field3): this;
    isConstant(): boolean;
    finish(f: bigint, isChained?: boolean): Field3;
    finishForMulInput(f: bigint, isChained?: boolean): Field3;
    rangeCheck(): void;
    static fromUnfinished(x: Field3 | Sum): Sum;
}
declare function assertLessThan(x: Field3, y: bigint | Field3): void;
declare function assertLessThanOrEqual(x: Field3, y: bigint | Field3): void;
declare function field3FromBits(bits: Bool[]): Field3;
