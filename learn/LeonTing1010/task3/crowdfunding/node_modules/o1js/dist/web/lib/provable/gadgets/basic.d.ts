import type { Field, VarField } from '../field.js';
import { FieldType, FieldVar, FieldConst, VarFieldVar } from '../core/fieldvar.js';
import { TupleN } from '../../util/types.js';
export { assertMul, assertBilinear, arrayGet, assertOneOf, assertNotVectorEquals, };
export { reduceToScaledVar, toLinearCombination, emptyCell, linear, bilinear, ScaledVar, Constant, };
/**
 * Assert multiplication constraint, `x * y === z`
 */
declare function assertMul(x: Field | FieldVar, y: Field | FieldVar, z: Field | FieldVar): void;
/**
 * Get value from array in O(n) rows.
 *
 * Assumes that index is in [0, n), returns an unconstrained result otherwise.
 *
 * Note: This saves 0.5*n constraints compared to equals() + switch() even if equals() were implemented optimally.
 */
declare function arrayGet(array: Field[], index: Field): Field;
/**
 * Assert that a value equals one of a finite list of constants:
 * `(x - c1)*(x - c2)*...*(x - cn) === 0`
 *
 * TODO: what prevents us from getting the same efficiency with snarky DSL code?
 */
declare function assertOneOf(x: Field, allowed: [bigint, bigint, ...bigint[]]): void;
/**
 * Assert that x does not equal a constant vector c:
 *
 * `(x[0],...,x[n-1]) !== (c[0],...,c[n-1])`
 *
 * We prove this by witnessing a vector z such that:
 *
 * `sum_i (x[i] - c[i])*z[i] === 1`
 *
 * If we had `x[i] === c[i]` for all i, the left-hand side would be 0 regardless of z.
 */
declare function assertNotVectorEquals(x: Field[], c: [bigint, bigint, ...bigint[]]): void;
/**
 * Compute linear function of x:
 * `z = a*x + b`
 */
declare function linear(x: VarField | VarFieldVar, [a, b]: TupleN<bigint, 2>): VarField;
/**
 * Compute bilinear function of x and y:
 * `z = a*x*y + b*x + c*y + d`
 */
declare function bilinear(x: VarField | VarFieldVar, y: VarField | VarFieldVar, [a, b, c, d]: TupleN<bigint, 4>): VarField;
/**
 * Assert bilinear equation on x, y and z:
 * `a*x*y + b*x + c*y + d === z`
 *
 * The default for z is 0.
 */
declare function assertBilinear(x: VarField | VarFieldVar, y: VarField | VarFieldVar, [a, b, c, d]: TupleN<bigint, 4>, z?: VarField | VarFieldVar): void;
declare function emptyCell(): VarField;
/**
 * Converts a `FieldVar` into a set of constraints, returns the remainder as a ScaledVar | Constant
 *
 * Collapses duplicated variables, so e.g. x - x just becomes the 0 constant.
 *
 * This is better than fully reducing to a Var, because it allows callers to fold the scaling factor into the next operation,
 * instead of wasting a constraint on `c * x === y` before using `c * x`.
 */
declare function reduceToScaledVar(x: Field | FieldVar): ScaledVar | Constant;
/**
 * Flatten the AST of a `FieldVar` to a linear combination of the form
 *
 * `c + s1*x1 + s2*x2 + ... + sn*xn`
 *
 * where none of the vars xi are duplicated.
 */
declare function toLinearCombination(x: FieldVar, sx?: bigint, lincom?: {
    constant: bigint;
    terms: [bigint, VarFieldVar][];
}): {
    constant: bigint;
    terms: [bigint, VarFieldVar][];
};
type ScaledVar = [FieldType.Scale, FieldConst, VarFieldVar];
type Constant = [FieldType.Constant, FieldConst];
declare function isVar(x: ScaledVar | Constant): x is ScaledVar;
declare function isConst(x: ScaledVar | Constant): x is Constant;
declare function getVar(x: ScaledVar): [bigint, VarFieldVar];
declare function getConst(x: Constant): bigint;
declare const ScaledVar: {
    isVar: typeof isVar;
    getVar: typeof getVar;
    isConst: typeof isConst;
    getConst: typeof getConst;
};
