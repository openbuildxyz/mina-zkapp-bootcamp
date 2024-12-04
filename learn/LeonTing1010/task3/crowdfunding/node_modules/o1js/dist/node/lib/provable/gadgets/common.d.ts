import type { Field, VarField } from '../field.js';
import { FieldVar, VarFieldVar } from '../core/fieldvar.js';
import { Tuple } from '../../util/types.js';
import type { Bool } from '../bool.js';
export { toVars, toVar, isVar, assert, bitSlice, bit, divideWithRemainder, packBits, isConstant, };
/**
 * Given a Field, collapse its AST to a pure Var. See {@link FieldVar}.
 *
 * This is useful to prevent rogue Generic gates added in the middle of gate chains,
 * which are caused by snarky auto-resolving constants, adds and scales to vars.
 *
 * Same as `Field.seal()` with the difference that `seal()` leaves constants as is.
 */
declare function toVar(x_: Field | FieldVar | bigint): VarField;
declare function isVar(x: FieldVar | bigint): x is VarFieldVar;
declare function isVar(x: Field | bigint): x is VarField;
/**
 * Apply {@link toVar} to each element of a tuple.
 */
declare function toVars<T extends Tuple<Field | bigint>>(fields: T): {
    [k in keyof T]: VarField;
};
/**
 * Assert that a statement is true. If the statement is false, throws an error with the given message.
 * Can be used in provable code.
 */
declare function assert(stmt: boolean | Bool, message?: string): asserts stmt;
declare function bitSlice(x: bigint, start: number, length: number): bigint;
declare function bit(x: bigint, i: number): bigint;
declare function divideWithRemainder(numerator: bigint, denominator: bigint): {
    quotient: bigint;
    remainder: bigint;
};
/**
 * Helper function to provably pack bits into a single field element.
 * Just returns the sum without any boolean checks.
 */
declare function packBits(bits: (Field | Bool)[]): Field;
declare function isConstant(...args: (Field | Bool)[]): boolean;
