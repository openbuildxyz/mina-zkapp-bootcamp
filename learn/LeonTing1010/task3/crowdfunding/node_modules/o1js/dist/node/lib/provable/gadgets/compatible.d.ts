import { Field } from '../field.js';
import { FieldVar } from '../core/fieldvar.js';
export { assertMulCompatible as assertMul, assertSquareCompatible as assertSquare, assertBooleanCompatible as assertBoolean, assertEqualCompatible as assertEqual, };
/**
 * Assert multiplication constraint, `x * y === z`
 */
declare function assertMulCompatible(x: Field | FieldVar, y: Field | FieldVar, z: Field | FieldVar): void;
/**
 * Assert square, `x^2 === z`
 */
declare function assertSquareCompatible(x: Field, z: Field): void;
/**
 * Assert that x is either 0 or 1, `x^2 === x`
 */
declare function assertBooleanCompatible(x: Field): void;
/**
 * Assert equality, `x === y`
 */
declare function assertEqualCompatible(x: Field | FieldVar, y: Field | FieldVar): void;
