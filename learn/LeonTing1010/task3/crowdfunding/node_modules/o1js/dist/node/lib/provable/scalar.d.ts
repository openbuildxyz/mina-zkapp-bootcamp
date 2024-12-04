import { Field } from './field.js';
import { Bool } from './bool.js';
import { ShiftedScalar } from './gadgets/native-curve.js';
import type { HashInput } from './types/provable-derivers.js';
export { Scalar, ScalarConst };
type ScalarConst = [0, bigint];
/**
 * Represents a {@link Scalar}.
 */
declare class Scalar implements ShiftedScalar {
    /**
     * We represent a scalar s in shifted form t = s - 2^255 mod q,
     * split into its low bit (t & 1) and high 254 bits (t >> 1).
     * The reason is that we can efficiently compute the scalar multiplication `(t + 2^255) * P = s * P`.
     */
    lowBit: Bool;
    high254: Field;
    static ORDER: bigint;
    private constructor();
    /**
     * Create a constant {@link Scalar} from a bigint, number, string or Scalar.
     *
     * If the input is too large, it is reduced modulo the scalar field size.
     */
    static from(s: Scalar | bigint | number | string): Scalar;
    /**
     * Provable method to convert a {@link ShiftedScalar} to a {@link Scalar}.
     */
    static fromShiftedScalar(s: ShiftedScalar): Scalar;
    /**
     * Provable method to convert a {@link Field} into a {@link Scalar}.
     *
     * This is always possible and unambiguous, since the scalar field is larger than the base field.
     */
    static fromField(s: Field): Scalar;
    /**
     * Check whether this {@link Scalar} is a hard-coded constant in the constraint system.
     * If a {@link Scalar} is constructed outside provable code, it is a constant.
     */
    isConstant(): boolean;
    /**
     * Convert this {@link Scalar} into a constant if it isn't already.
     *
     * If the scalar is a variable, this only works inside `asProver` or `witness` blocks.
     *
     * See {@link FieldVar} for an explanation of constants vs. variables.
     */
    toConstant(): Scalar;
    /**
     * Convert this {@link Scalar} into a bigint
     */
    toBigInt(): bigint;
    /**
     * Creates a Scalar from an array of {@link Bool}.
     * This method is provable.
     */
    static fromBits(bits: Bool[]): Scalar;
    /**
     * Returns a random {@link Scalar}.
     * Randomness can not be proven inside a circuit!
     */
    static random(): Scalar;
    /**
     * Negate a scalar field element.
     *
     * **Warning**: This method is not available for provable code.
     */
    neg(): Scalar;
    /**
     * Add scalar field elements.
     *
     * **Warning**: This method is not available for provable code.
     */
    add(y: Scalar): Scalar;
    /**
     * Subtract scalar field elements.
     *
     * **Warning**: This method is not available for provable code.
     */
    sub(y: Scalar): Scalar;
    /**
     * Multiply scalar field elements.
     *
     * **Warning**: This method is not available for provable code.
     */
    mul(y: Scalar): Scalar;
    /**
     * Divide scalar field elements.
     * Throws if the denominator is zero.
     *
     * **Warning**: This method is not available for provable code.
     */
    div(y: Scalar): Scalar;
    /**
     * Serialize a Scalar into a Field element plus one bit, where the bit is represented as a Bool.
     *
     * **Warning**: This method is not available for provable code.
     *
     * Note: Since the Scalar field is slightly larger than the base Field, an additional high bit
     * is needed to represent all Scalars. However, for a random Scalar, the high bit will be `false` with overwhelming probability.
     */
    toFieldsCompressed(): {
        field: Field;
        highBit: Bool;
    };
    /**
     * Part of the {@link Provable} interface.
     *
     * Serialize a {@link Scalar} into an array of {@link Field} elements.
     *
     * **Warning**: This function is for internal usage. It returns 255 field elements
     * which represent the Scalar in a shifted, bitwise format.
     * The fields are not constrained to be boolean.
     */
    static toFields(x: Scalar): Field[];
    /**
     * Serialize this Scalar to Field elements.
     *
     * **Warning**: This function is for internal usage. It returns 255 field elements
     * which represent the Scalar in a shifted, bitwise format.
     * The fields are not constrained to be boolean.
     *
     * Check out {@link Scalar.toFieldsCompressed} for a user-friendly serialization
     * that can be used outside proofs.
     */
    toFields(): Field[];
    /**
     * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
     *
     * This function is the implementation of `ProvableExtended.toInput()` for the {@link Scalar} type.
     *
     * @param value - The {@link Scalar} element to get the `input` array.
     *
     * @return An object where the `fields` key is a {@link Field} array of length 1 created from this {@link Field}.
     *
     */
    static toInput(x: Scalar): HashInput;
    /**
     * Part of the {@link Provable} interface.
     *
     * Serialize a {@link Scalar} into its auxiliary data, which are empty.
     */
    static toAuxiliary(): never[];
    /**
     * Part of the {@link Provable} interface.
     *
     * Creates a data structure from an array of serialized {@link Field} elements.
     */
    static fromFields(fields: Field[]): Scalar;
    /**
     * Part of the {@link Provable} interface.
     *
     * Returns the size of this type in {@link Field} elements.
     */
    static sizeInFields(): number;
    /**
     * Part of the {@link Provable} interface.
     */
    static check(s: Scalar): void;
    static toCanonical(s: Scalar): Scalar;
    static toValue(x: Scalar): bigint;
    static fromValue(x: bigint): Scalar;
    /**
     * Serialize a {@link Scalar} to a JSON string.
     * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Scalar.
     */
    static toJSON(x: Scalar): string;
    /**
     * Serializes this Scalar to a string
     */
    toJSON(): string;
    /**
     * Deserialize a JSON structure into a {@link Scalar}.
     * This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the Scalar.
     */
    static fromJSON(x: string): Scalar;
    static empty(): Scalar;
}
