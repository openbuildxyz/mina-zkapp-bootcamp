import type { Field } from '../field.js';
import type { Bool } from '../bool.js';
import { Field3 } from './foreign-field.js';
export { scaleField, scaleShifted, fieldToShiftedScalar, field3ToShiftedScalar, shiftedScalarToField3, add, ShiftedScalar, };
type Point = {
    x: Field;
    y: Field;
};
type ShiftedScalar = {
    lowBit: Bool;
    high254: Field;
};
/**
 * Dedicated gadget to scale a point by a scalar, where the scalar is represented as a _native_ Field.
 */
declare function scaleField(P: Point, s: Field): Point;
/**
 * Internal helper to compute `(t + 2^255)*P`.
 * `t` is expected to be split into 254 high bits (t >> 1) and a low bit (t & 1).
 *
 * The gadget proves that `tHi` is in [0, 2^254) but assumes that `tLo` is a single bit.
 *
 * Optionally, you can specify a different number of high bits by passing in `numHighBits`.
 */
declare function scaleShifted({ x, y }: Point, { lowBit: tLo, high254: tHi }: ShiftedScalar, numHighBits?: number): Point;
/**
 * Converts a field element s to a shifted representation t = s - 2^254 mod q,
 * where t is represented as a low bit and a 254-bit high part.
 *
 * This is the representation we use for scalars, since it can be used as input to `scaleShifted()`.
 */
declare function fieldToShiftedScalar(s: Field): ShiftedScalar;
/**
 * Converts a 3-limb bigint to a shifted representation t = s - 2^255 mod q,
 * where t is represented as a low bit and a 254-bit high part.
 *
 * Note: The output is proven to be a canonical scalar, t < q.
 */
declare function field3ToShiftedScalar(s: Field3): ShiftedScalar;
/**
 * Converts a shifted representation t = s - 2^255 mod q to s as a Field3 bigint.
 *
 * Note: This method is complete for all t such that tLo < 2 and tHi < 2^254.
 * The output is can always be made a canonical scalar element by an honest prover.
 */
declare function shiftedScalarToField3(t: ShiftedScalar): Field3;
/**
 * Wraps the `EC_add` gate to perform complete addition of two non-zero curve points.
 */
declare function add(g: Point, h: Point): {
    result: Point;
    isInfinity: Bool;
};
