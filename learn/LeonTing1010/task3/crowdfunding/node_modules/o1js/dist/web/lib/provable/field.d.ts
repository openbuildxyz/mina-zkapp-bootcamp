import type { NonNegativeInteger } from '../../bindings/crypto/non-negative.js';
import { Bool } from './bool.js';
import { FieldVar, FieldConst, VarFieldVar, ConstantFieldVar } from './core/fieldvar.js';
export { Field };
export { ConstantField, VarField, withMessage, readVarMessage, toConstantField, toFp, checkBitLength, };
type ConstantField = Field & {
    value: ConstantFieldVar;
};
type VarField = Field & {
    value: VarFieldVar;
};
/**
 * A {@link Field} is an element of a prime order [finite field](https://en.wikipedia.org/wiki/Finite_field).
 * Every other provable type is built using the {@link Field} type.
 *
 * The field is the [pasta base field](https://electriccoin.co/blog/the-pasta-curves-for-halo-2-and-beyond/) of order 2^254 + 0x224698fc094cf91b992d30ed00000001 ({@link Field.ORDER}).
 *
 * You can create a new Field from everything "field-like" (`bigint`, integer `number`, decimal `string`, `Field`).
 * @example
 * ```
 * Field(10n); // Field construction from a big integer
 * Field(100); // Field construction from a number
 * Field("1"); // Field construction from a decimal string
 * ```
 *
 * **Beware**: Fields _cannot_ be constructed from fractional numbers or alphanumeric strings:
 * ```ts
 * Field(3.141); // ERROR: Cannot convert a float to a field element
 * Field("abc"); // ERROR: Invalid argument "abc"
 * ```
 *
 * Creating a Field from a negative number can result in unexpected behavior if you are not familiar with [modular arithmetic](https://en.wikipedia.org/wiki/Modular_arithmetic).
 * @example
 * ```
 * const x = Field(-1); // Valid Field construction from negative number
 * const y = Field(Field.ORDER - 1n); // equivalent to `x`
 * ```
 *
 * **Important**: All the functions defined on a Field (arithmetic, logic, etc.) take their arguments as "field-like". A Field itself is also defined as a "field-like" element.
 *
 * @param value - the value to convert to a {@link Field}
 *
 * @return A {@link Field} with the value converted from the argument
 */
declare class Field {
    value: FieldVar;
    /**
     * The order of the pasta curve that {@link Field} type build on as a `bigint`.
     * Order of the {@link Field} is 28948022309329048855892746252171976963363056481941560715954676764349967630337.
     */
    static ORDER: bigint;
    /**
     * Coerce anything "field-like" (bigint, number, string, and {@link Field}) to a Field.
     */
    constructor(x: bigint | number | string | Field | FieldVar | FieldConst);
    static from(x: bigint | number | string | Field): Field;
    /**
     * Check whether this {@link Field} element is a hard-coded constant in the constraint system.
     * If a {@link Field} is constructed outside a zkApp method, it is a constant.
     *
     * @example
     * ```ts
     * console.log(Field(42).isConstant()); // true
     * ```
     *
     * @example
     * ```ts
     * \@method myMethod(x: Field) {
     *    console.log(x.isConstant()); // false
     * }
     * ```
     *
     * @return A `boolean` showing if this {@link Field} is a constant or not.
     */
    isConstant(): this is {
        value: ConstantFieldVar;
    };
    /**
     * Create a {@link Field} element equivalent to this {@link Field} element's value,
     * but is a constant.
     * See {@link Field.isConstant} for more information about what is a constant {@link Field}.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * someField.toConstant().assertEquals(someField); // Always true
     * ```
     *
     * @return A constant {@link Field} element equivalent to this {@link Field} element.
     */
    toConstant(): ConstantField;
    /**
     * Serialize the {@link Field} to a bigint, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the bigint representation of the {@link Field}. Use the operation only during debugging.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * console.log(someField.toBigInt());
     * ```
     *
     * @return A bigint equivalent to the bigint representation of the Field.
     */
    toBigInt(): bigint;
    /**
     * Serialize the {@link Field} to a string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the {@link Field}. Use the operation only during debugging.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * console.log(someField.toString());
     * ```
     *
     * @return A string equivalent to the string representation of the Field.
     */
    toString(): string;
    /**
     * Assert that this {@link Field} is equal another "field-like" value.
     * Calling this function is equivalent to `Field(...).equals(...).assertEquals(Bool(true))`.
     * See {@link Field.equals} for more details.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param value - the "field-like" value to compare & assert with this {@link Field}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertEquals(y: Field | bigint | number | string, message?: string): void;
    /**
     * Add a field-like value to this {@link Field} element.
     *
     * @example
     * ```ts
     * const x = Field(3);
     * const sum = x.add(5);
     *
     * sum.assertEquals(Field(8));
     * ```
     *
     * **Warning**: This is a modular addition in the pasta field.
     * @example
     * ```ts
     * const x = Field(1);
     * const sum = x.add(Field(-7));
     *
     * // If you try to print sum - `console.log(sum.toBigInt())` - you will realize that it prints a very big integer because this is modular arithmetic, and 1 + (-7) circles around the field to become p - 6.
     * // You can use the reverse operation of addition (subtraction) to prove the sum is calculated correctly.
     *
     * sum.sub(x).assertEquals(Field(-7));
     * sum.sub(Field(-7)).assertEquals(x);
     * ```
     *
     * @param value - a "field-like" value to add to the {@link Field}.
     *
     * @return A {@link Field} element equivalent to the modular addition of the two value.
     */
    add(y: Field | bigint | number | string): Field;
    /**
     * Negate a {@link Field}. This is equivalent to multiplying the {@link Field} by -1.
     *
     * @example
     * ```ts
     * const negOne = Field(1).neg();
     * negOne.assertEquals(-1);
     * ```
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * someField.neg().assertEquals(someField.mul(Field(-1))); // This statement is always true regardless of the value of `someField`
     * ```
     *
     * **Warning**: This is a modular negation. For details, see the {@link sub} method.
     *
     * @return A {@link Field} element that is equivalent to the element multiplied by -1.
     */
    neg(): Field;
    /**
     * Subtract another "field-like" value from this {@link Field} element.
     *
     * @example
     * ```ts
     * const x = Field(3);
     * const difference = x.sub(5);
     *
     * difference.assertEquals(Field(-2));
     * ```
     *
     * **Warning**: This is a modular subtraction in the pasta field.
     *
     * @example
     * ```ts
     * const x = Field(1);
     * const difference = x.sub(Field(2));
     *
     * // If you try to print difference - `console.log(difference.toBigInt())` - you will realize that it prints a very big integer because this is modular arithmetic, and 1 - 2 circles around the field to become p - 1.
     * // You can use the reverse operation of subtraction (addition) to prove the difference is calculated correctly.
     * difference.add(Field(2)).assertEquals(x);
     * ```
     *
     * @param value - a "field-like" value to subtract from the {@link Field}.
     *
     * @return A {@link Field} element equivalent to the modular difference of the two value.
     */
    sub(y: Field | bigint | number | string): Field;
    /**
     * Checks if this {@link Field} is odd. Returns `true` for odd elements and `false` for even elements.
     *
     * See {@link Field.isEven} for examples.
     */
    isOdd(): Bool;
    /**
     * Checks if this {@link Field} is even. Returns `true` for even elements and `false` for odd elements.
     *
     * @example
     * ```ts
     * let a = Field(5);
     * a.isEven(); // false
     *
     * let b = Field(4);
     * b.isEven(); // true
     * ```
     */
    isEven(): Bool;
    /**
     * Multiply another "field-like" value with this {@link Field} element.
     *
     * @example
     * ```ts
     * const x = Field(3);
     * const product = x.mul(Field(5));
     *
     * product.assertEquals(Field(15));
     * ```
     *
     * @param value - a "field-like" value to multiply with the {@link Field}.
     *
     * @return A {@link Field} element equivalent to the modular difference of the two value.
     */
    mul(y: Field | bigint | number | string): Field;
    /**
     * [Modular inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse) of this {@link Field} element.
     * Equivalent to 1 divided by this {@link Field}, in the sense of modular arithmetic.
     *
     * Proves that this Field is non-zero, or throws a "Division by zero" error.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * const inverse = someField.inv();
     * inverse.assertEquals(Field(1).div(someField)); // This statement is always true regardless of the value of `someField`
     * ```
     *
     * **Warning**: This is a modular inverse. See {@link div} method for more details.
     *
     * @return A {@link Field} element that is equivalent to one divided by this element.
     */
    inv(): Field;
    /**
     * Divide another "field-like" value through this {@link Field}.
     *
     * Proves that the denominator is non-zero, or throws a "Division by zero" error.
     *
     * @example
     * ```ts
     * const x = Field(6);
     * const quotient = x.div(Field(3));
     *
     * quotient.assertEquals(Field(2));
     * ```
     *
     * **Warning**: This is a modular division in the pasta field. You can think this as the reverse operation of modular multiplication.
     *
     * @example
     * ```ts
     * const x = Field(2);
     * const y = Field(5);
     *
     * const quotient = x.div(y);
     *
     * // If you try to print quotient - `console.log(quotient.toBigInt())` - you will realize that it prints a very big integer because this is a modular inverse.
     * // You can use the reverse operation of division (multiplication) to prove the quotient is calculated correctly.
     *
     * quotient.mul(y).assertEquals(x);
     * ```
     *
     * @param value - a "field-like" value to divide with the {@link Field}.
     *
     * @return A {@link Field} element equivalent to the modular division of the two value.
     */
    div(y: Field | bigint | number | string): Field;
    /**
     * Square this {@link Field} element.
     *
     * @example
     * ```ts
     * const someField = Field(7);
     * const square = someField.square();
     *
     * square.assertEquals(someField.mul(someField)); // This statement is always true regardless of the value of `someField`
     * ```
     *
     * ** Warning: This is a modular multiplication. See `mul()` method for more details.
     *
     * @return A {@link Field} element equivalent to the multiplication of the {@link Field} element with itself.
     */
    square(): Field;
    /**
     * Take the square root of this {@link Field} element.
     *
     * Proves that the Field element has a square root in the finite field, or throws if it doesn't.
     *
     * @example
     * ```ts
     * let z = x.sqrt();
     * z.mul(z).assertEquals(x); // true for every `x`
     * ```
     *
     * **Warning**: This is a modular square root, which is any number z that satisfies z*z = x (mod p).
     * Note that, if a square root z exists, there also exists a second one, -z (which is different if z != 0).
     * Therefore, this method leaves an adversarial prover the choice between two different values to return.
     *
     * @return A {@link Field} element equivalent to the square root of the {@link Field} element.
     */
    sqrt(): Field;
    /**
     * Check if this {@link Field} is equal another "field-like" value.
     * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
     *
     * @example
     * ```ts
     * Field(5).equals(5).assertEquals(Bool(true));
     * ```
     *
     * @param value - the "field-like" value to compare with this {@link Field}.
     *
     * @return A {@link Bool} representing if this {@link Field} is equal another "field-like" value.
     */
    equals(y: Field | bigint | number | string): Bool;
    /**
     * Check if this {@link Field} is less than another "field-like" value.
     * Returns a {@link Bool}, which is a provable type and can be used prove to the validity of this statement.
     *
     * @example
     * ```ts
     * let isTrue = Field(2).lessThan(3);
     * ```
     *
     * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behavior when used with negative inputs or modular division.
     *
     * @example
     * ```ts
     * let isFalse = Field(1).div(3).lessThan(Field(1).div(2)); // in fact, 1/3 > 1/2
     * ```
     *
     * @param value - the "field-like" value to compare with this {@link Field}.
     *
     * @return A {@link Bool} representing if this {@link Field} is less than another "field-like" value.
     */
    lessThan(y: Field | bigint | number | string): Bool;
    /**
     * Check if this {@link Field} is less than or equal to another "field-like" value.
     * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
     *
     * @example
     * ```ts
     * let isTrue = Field(3).lessThanOrEqual(3);
     * ```
     *
     * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
     *
     * @example
     * ```ts
     * let isFalse = Field(1).div(3).lessThanOrEqual(Field(1).div(2)); // in fact, 1/3 > 1/2
     * ```
     *
     * @param value - the "field-like" value to compare with this {@link Field}.
     *
     * @return A {@link Bool} representing if this {@link Field} is less than or equal another "field-like" value.
     */
    lessThanOrEqual(y: Field | bigint | number | string): Bool;
    /**
     * Check if this {@link Field} is greater than another "field-like" value.
     * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
     *
     * @example
     * ```ts
     * let isTrue = Field(5).greaterThan(3);
     * ```
     *
     * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
     *
     * @example
     * ```ts
     * let isFalse = Field(1).div(2).greaterThan(Field(1).div(3); // in fact, 1/3 > 1/2
     * ```
     *
     * @param value - the "field-like" value to compare with this {@link Field}.
     *
     * @return A {@link Bool} representing if this {@link Field} is greater than another "field-like" value.
     */
    greaterThan(y: Field | bigint | number | string): Bool;
    /**
     * Check if this {@link Field} is greater than or equal another "field-like" value.
     * Returns a {@link Bool}, which is a provable type and can be used to prove the validity of this statement.
     *
     * @example
     * ```ts
     * let isTrue = Field(3).greaterThanOrEqual(3);
     * ```
     *
     * **Warning**: As this method compares the bigint value of a {@link Field}, it can result in unexpected behaviour when used with negative inputs or modular division.
     *
     * @example
     * ```ts
     * let isFalse = Field(1).div(2).greaterThanOrEqual(Field(1).div(3); // in fact, 1/3 > 1/2
     * ```
     *
     * @param value - the "field-like" value to compare with this {@link Field}.
     *
     * @return A {@link Bool} representing if this {@link Field} is greater than or equal another "field-like" value.
     */
    greaterThanOrEqual(y: Field | bigint | number | string): Bool;
    /**
     * Assert that this {@link Field} is less than another "field-like" value.
     *
     * Note: This uses fewer constraints than `x.lessThan(y).assertTrue()`.
     * See {@link lessThan} for more details.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param value - the "field-like" value to compare & assert with this {@link Field}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertLessThan(y: Field | bigint | number | string, message?: string): void;
    /**
     * Assert that this {@link Field} is less than or equal to another "field-like" value.
     *
     * Note: This uses fewer constraints than `x.lessThanOrEqual(y).assertTrue()`.
     * See {@link Field.lessThanOrEqual} for more details.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param value - the "field-like" value to compare & assert with this {@link Field}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertLessThanOrEqual(y: Field | bigint | number | string, message?: string): void;
    /**
     * Assert that this {@link Field} is greater than another "field-like" value.
     *
     * Note: This uses fewer constraints than `x.greaterThan(y).assertTrue()`.
     * See {@link Field.greaterThan} for more details.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param value - the "field-like" value to compare & assert with this {@link Field}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertGreaterThan(y: Field | bigint | number | string, message?: string): void;
    /**
     * Assert that this {@link Field} is greater than or equal to another "field-like" value.
     *
     * Note: This uses fewer constraints than `x.greaterThanOrEqual(y).assertTrue()`.
     * See {@link Field.greaterThanOrEqual} for more details.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param value - the "field-like" value to compare & assert with this {@link Field}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertGreaterThanOrEqual(y: Field | bigint | number | string, message?: string): void;
    /**
     * Assert that this {@link Field} does not equal another field-like value.
     *
     * Note: This uses fewer constraints than `x.equals(y).assertFalse()`.
     *
     * @example
     * ```ts
     * x.assertNotEquals(0, "expect x to be non-zero");
     * ```
     */
    assertNotEquals(y: Field | bigint | number | string, message?: string): void;
    /**
     * Prove that this {@link Field} is equal to 0 or 1.
     * Returns the Field wrapped in a {@link Bool}.
     *
     * If the assertion fails, the code throws an error.
     *
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertBool(message?: string): Bool;
    /**
     * Returns an array of {@link Bool} elements representing [little endian binary representation](https://en.wikipedia.org/wiki/Endianness) of this {@link Field} element.
     *
     * If you use the optional `length` argument, proves that the field element fits in `length` bits.
     * The `length` has to be between 0 and 254 and the method throws if it isn't.
     *
     * **Warning**: The cost of this operation in a zk proof depends on the `length` you specify,
     * which by default is 254 bits. Prefer to pass a smaller `length` if possible.
     *
     * @param length - the number of bits to fit the element. If the element does not fit in `length` bits, the functions throws an error.
     *
     * @return An array of {@link Bool} element representing little endian binary representation of this {@link Field}.
     */
    toBits(length?: number): Bool[];
    /**
     * Convert a bit array into a {@link Field} element using [little endian binary representation](https://en.wikipedia.org/wiki/Endianness)
     *
     * The method throws if the given bits do not fit in a single Field element. In this case, no more than 254 bits are allowed because some 255 bit integers do not fit into a single Field element.
     *
     * **Important**: If the given `bytes` array is an array of `booleans` or {@link Bool} elements that all are `constant`, the resulting {@link Field} element will be a constant as well. Or else, if the given array is a mixture of constants and variables of {@link Bool} type, the resulting {@link Field} will be a variable as well.
     *
     * @param bytes - An array of {@link Bool} or `boolean` type.
     *
     * @return A {@link Field} element matching the [little endian binary representation](https://en.wikipedia.org/wiki/Endianness) of the given `bytes` array.
     */
    static fromBits(bits: (Bool | boolean)[]): Field;
    /**
     * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
     *
     * In o1js, addition and scaling (multiplication of variables by a constant) of variables is represented as an AST - [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree). For example, the expression `x.add(y).mul(2)` is represented as `Scale(2, Add(x, y))`.
     *
     *  A new internal variable is created only when the variable is needed in a multiplicative or any higher level constraint (for example multiplication of two {@link Field} elements) to represent the operation.
     *
     * The `seal()` function tells o1js to stop building an AST and create a new variable right away.
     *
     * @return A {@link Field} element that is equal to the result of AST that was previously on this {@link Field} element.
     */
    seal(): VarField | ConstantField;
    /**
     * A random {@link Field} element.
     *
     * @example
     * ```ts
     * console.log(Field.random().toBigInt()); // Run this code twice!
     * ```
     *
     * @return A random {@link Field} element.
     */
    static random(): Field;
    /**
     * This function is the implementation of {@link Provable.toFields} for the {@link Field} type.
     *
     * Static function to serializes a {@link Field} into an array of {@link Field} elements.
     * This will be always an array of length 1, where the first and only element equals the given parameter itself.
     *
     * @param value - the {@link Field} element to cast the array from.
     *
     * @return A {@link Field} array of length 1 created from this {@link Field}.
     */
    static toFields(x: Field): Field[];
    /**
     * This function is the implementation of {@link Provable.toAuxiliary} for the {@link Field} type.
     *
     * As the primitive {@link Field} type has no auxiliary data associated with it, this function will always return an empty array.
     *
     * @param value - The {@link Field} element to get the auxiliary data of, optional. If not provided, the function returns an empty array.
     */
    static toAuxiliary(): [];
    /**
     * This function is the implementation of {@link Provable.sizeInFields} for the {@link Field} type.
     *
     * Size of the {@link Field} type is 1, as it is the primitive type.
     * This function returns a regular number, so you cannot use it to prove something on chain. You can use it during debugging or to understand the memory complexity of some type.
     *
     * @example
     * ```ts
     * console.log(Field.sizeInFields()); // Prints 1
     * ```
     *
     * @return A number representing the size of the {@link Field} type in terms of {@link Field} type itself.
     */
    static sizeInFields(): number;
    /**
     * Implementation of {@link Provable.fromFields} for the {@link Field} type.
     *
     * **Warning**: This function is designed for internal use. It is not intended to be used by a zkApp developer.
     *
     * Creates a {@link Field} from an array of Fields of length 1.
     *
     * @param fields - an array of length 1 serialized from {@link Field} elements.
     *
     * @return The first {@link Field} element of the given array.
     */
    static fromFields([x]: Field[]): Field;
    /**
     * This function is the implementation of {@link Provable.check} in {@link Field} type.
     *
     * As any field element can be a {@link Field}, this function does not create any assertions, so it does nothing.
     *
     * @param value - the {@link Field} element to check.
     */
    static check(): void;
    /**
     * `Provable<Field>.toValue()`
     */
    static toValue(x: Field): bigint;
    /**
     * Convert a {@link Field} element to a bigint.
     */
    static toBigint(x: Field): bigint;
    /**
     * `Provable<Field>.fromValue()`
     */
    static fromValue(x: Field | bigint | number | string): Field;
    /**
     * This function is the implementation of {@link Provable.toFields} for the {@link Field} type.
     *
     * The result will be always an array of length 1, where the first and only element equals the {@link Field} itself.
     *
     * @return A {@link Field} array of length 1 created from this {@link Field}.
     */
    toFields(): Field[];
    /**
     * This function is the implementation of {@link Provable.toAuxiliary} for the {@link Field} type.
     *
     * As the primitive {@link Field} type has no auxiliary data associated with it, this function will always return an empty array.
     */
    toAuxiliary(): [];
    static empty(): Field;
    /**
     * Serialize the {@link Field} to a JSON string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the JSON string representation of the {@link Field}. Use the operation only during debugging.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * console.log(someField.toJSON());
     * ```
     *
     * @return A string equivalent to the JSON representation of the {@link Field}.
     */
    toJSON(): string;
    /**
     * Serialize the given {@link Field} element to a JSON string, e.g. for printing. Trying to print a {@link Field} without this function will directly stringify the Field object, resulting in unreadable output.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the JSON string representation of the {@link Field}. Use the operation only during debugging.
     *
     * @example
     * ```ts
     * const someField = Field(42);
     * console.log(Field.toJSON(someField));
     * ```
     *
     * @param value - The JSON string to coerce the {@link Field} from.
     *
     * @return A string equivalent to the JSON representation of the given {@link Field}.
     */
    static toJSON(x: Field): string;
    /**
     * Deserialize a JSON string containing a "field-like" value into a {@link Field} element.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the string representation of the {@link Field}.
     *
     * @param value - the "field-like" value to coerce the {@link Field} from.
     *
     * @return A {@link Field} coerced from the given JSON string.
     */
    static fromJSON(json: string): Field;
    /**
     * **Warning**: This function is mainly for internal use. Normally it is not intended to be used by a zkApp developer.
     *
     * This function is the implementation of `ProvableExtended.toInput()` for the {@link Field} type.
     *
     * @param value - The {@link Field} element to get the `input` array.
     *
     * @return An object where the `fields` key is a {@link Field} array of length 1 created from this {@link Field}.
     *
     */
    static toInput(x: Field): {
        fields: Field[];
    };
    /**
     * Create an array of digits equal to the [little-endian](https://en.wikipedia.org/wiki/Endianness) byte order of the given {@link Field} element.
     * Note that the array has always 32 elements as the {@link Field} is a `finite-field` in the order of {@link Field.ORDER}.
     *
     * @param value - The {@link Field} element to generate the array of bytes of.
     *
     * @return An array of digits equal to the [little-endian](https://en.wikipedia.org/wiki/Endianness) byte order of the given {@link Field} element.
     *
     */
    static toBytes(x: Field): number[];
    /**
     * Part of the `Binable` interface.
     *
     * **Warning**: This function is for internal use. It is not intended to be used by a zkApp developer.
     */
    static readBytes<N extends number>(bytes: number[], offset: NonNegativeInteger<N>): [value: Field, offset: number];
    /**
     * Coerce a new {@link Field} element using the [little-endian](https://en.wikipedia.org/wiki/Endianness) representation of the given `bytes` array.
     * Note that the given `bytes` array may have at most 32 elements as the {@link Field} is a `finite-field` in the order of {@link Field.ORDER}.
     *
     * **Warning**: This operation does _not_ affect the circuit and can't be used to prove anything about the byte representation of the {@link Field}.
     *
     * @param bytes - The bytes array to coerce the {@link Field} from.
     *
     * @return A new {@link Field} element created using the [little-endian](https://en.wikipedia.org/wiki/Endianness) representation of the given `bytes` array.
     */
    static fromBytes(bytes: number[]): Field;
    /**
     * The size of a {@link Field} element in bytes - 32.
     */
    static sizeInBytes: number;
    /**
     * The size of a {@link Field} element in bits - 255.
     */
    static sizeInBits: number;
}
declare function toFp(x: bigint | number | string | Field): bigint;
declare function withMessage(error: unknown, message?: string): unknown;
declare function checkBitLength(name: string, length: number, maxLength?: number): void;
declare function toConstantField(x: Field, methodName: string, varName?: string, varDescription?: string): ConstantField;
declare function readVarMessage(methodName: string, varName: string, varDescription: string): string;
declare function VarField(x: VarFieldVar): VarField;
declare function ConstantField(x: ConstantFieldVar | bigint): ConstantField;
