import { Field, Bool } from './wrapped.js';
import { AnyConstructor } from './types/struct.js';
import { Types } from '../../bindings/mina-transaction/types.js';
import * as TypesBigint from '../../bindings/mina-transaction/transaction-leaves-bigint.js';
import { HashInput } from './crypto/poseidon.js';
import { FieldVar } from './core/fieldvar.js';
import { CircuitValue } from './types/circuit-value.js';
export { UInt8, UInt32, UInt64, Int64, Sign };
/**
 * A 64 bit unsigned integer with values ranging from 0 to 18,446,744,073,709,551,615.
 */
declare class UInt64 extends CircuitValue {
    value: Field;
    static NUM_BITS: number;
    /**
     * Create a {@link UInt64}.
     * The max value of a {@link UInt64} is `2^64 - 1 = UInt64.MAXINT()`.
     *
     * **Warning**: Cannot overflow, an error is thrown if the result is greater than UInt64.MAXINT()
     */
    constructor(x: UInt64 | UInt32 | FieldVar | number | string | bigint);
    static Unsafe: {
        /**
         * Create a {@link UInt64} from a {@link Field} without constraining its range.
         *
         * **Warning**: This is unsafe, because it does not prove that the input {@link Field} actually fits in 64 bits.\
         * Only use this if you know what you are doing, otherwise use the safe {@link UInt64.from}.
         */
        fromField(x: Field): UInt64;
    };
    /**
     * Static method to create a {@link UInt64} with value `0`.
     */
    static get zero(): UInt64;
    /**
     * Static method to create a {@link UInt64} with value `1`.
     */
    static get one(): UInt64;
    /**
     * Turns the {@link UInt64} into a string.
     * @returns
     */
    toString(): string;
    /**
     * Turns the {@link UInt64} into a {@link BigInt}.
     * @returns
     */
    toBigInt(): bigint;
    /**
     * Turns the {@link UInt64} into a {@link UInt32}, asserting that it fits in 32 bits.
     */
    toUInt32(): UInt32;
    /**
     * Turns the {@link UInt64} into a {@link UInt32}, clamping to the 32 bits range if it's too large.
     * ```ts
     * UInt64.from(4294967296).toUInt32Clamped().toString(); // "4294967295"
     * ```
     */
    toUInt32Clamped(): UInt32;
    static check(x: UInt64): void;
    static toInput(x: UInt64): HashInput;
    /**
     * Encodes this structure into a JSON-like object.
     */
    static toJSON(x: UInt64): string;
    /**
     * Decodes a JSON-like object into this structure.
     */
    static fromJSON<T extends AnyConstructor>(x: string): InstanceType<T>;
    private static checkConstant;
    /**
     * Creates a new {@link UInt64}.
     */
    static from(x: UInt64 | UInt32 | number | string | bigint): UInt64;
    /**
     * Creates a {@link UInt64} with a value of 18,446,744,073,709,551,615.
     */
    static MAXINT(): UInt64;
    /**
     * Addition modulo 2^64. Check {@link Gadgets.addMod64} for a detailed description.
     */
    addMod64(y: UInt64): UInt64;
    /**
     * Integer division with remainder.
     *
     * `x.divMod(y)` returns the quotient and the remainder.
     */
    divMod(y: UInt64 | number | string): {
        quotient: UInt64;
        rest: UInt64;
    };
    /**
     * Integer division.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * `z` such that `z * y <= x`.
     *
     */
    div(y: UInt64 | number): UInt64;
    /**
     * Integer remainder.
     *
     * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
     * `x - z` is divisible by `y`.
     */
    mod(y: UInt64 | number): UInt64;
    /**
     * Multiplication with overflow checking.
     */
    mul(y: UInt64 | number): UInt64;
    /**
     * Addition with overflow checking.
     */
    add(y: UInt64 | number): UInt64;
    /**
     * Subtraction with underflow checking.
     */
    sub(y: UInt64 | number): UInt64;
    /**
     * Bitwise XOR gadget on {@link Field} elements. Equivalent to the [bitwise XOR `^` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR).
     * A XOR gate works by comparing two bits and returning `1` if two bits differ, and `0` if two bits are equal.
     *
     * This gadget builds a chain of XOR gates recursively.
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#xor-1)
     *
     * @param x {@link UInt64} element to XOR.
     *
     * @example
     * ```ts
     * let a = UInt64.from(0b0101);
     * let b = UInt64.from(0b0011);
     *
     * let c = a.xor(b);
     * c.assertEquals(0b0110);
     * ```
     */
    xor(x: UInt64): UInt64;
    /**
     * Bitwise NOT gate on {@link Field} elements. Similar to the [bitwise
     * NOT `~` operator in JavaScript](https://developer.mozilla.org/en-US/docs/
     * Web/JavaScript/Reference/Operators/Bitwise_NOT).
     *
     * **Note:** The NOT gate operates over 64 bit for UInt64 types.
     *
     * A NOT gate works by returning `1` in each bit position if the
     * corresponding bit of the operand is `0`, and returning `0` if the
     * corresponding bit of the operand is `1`.
     *
     * NOT is implemented as a subtraction of the input from the all one bitmask
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#not)
     *
     * @example
     * ```ts
     * // NOTing 4 bits with the unchecked version
     * let a = UInt64.from(0b0101);
     * let b = a.not(false);
     *
     * console.log(b.toBigInt().toString(2));
     * // 1111111111111111111111111111111111111111111111111111111111111010
     *
     * ```
     *
     * @param a - The value to apply NOT to.
     *
     */
    not(): UInt64;
    /**
     * A (left and right) rotation operates similarly to the shift operation (`<<` for left and `>>` for right) in JavaScript,
     * with the distinction that the bits are circulated to the opposite end of a 64-bit representation rather than being discarded.
     * For a left rotation, this means that bits shifted off the left end reappear at the right end.
     * Conversely, for a right rotation, bits shifted off the right end reappear at the left end.
     *
     * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
     * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
     * The `direction` parameter is a string that accepts either `'left'` or `'right'`, determining the direction of the rotation.
     *
     * To safely use `rotate()`, you need to make sure that the value passed in is range-checked to 64 bits;
     * for example, using {@link Gadgets.rangeCheck64}.
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#rotation)
     *
     * @param bits amount of bits to rotate this {@link UInt64} element with.
     * @param direction left or right rotation direction.
     *
     *
     * @example
     * ```ts
     * const x = UInt64.from(0b001100);
     * const y = x.rotate(2, 'left');
     * const z = x.rotate(2, 'right'); // right rotation by 2 bits
     * y.assertEquals(0b110000);
     * z.assertEquals(0b000011);
     * ```
     */
    rotate(bits: number, direction?: 'left' | 'right'): UInt64;
    /**
     * Performs a left shift operation on the provided {@link UInt64} element.
     * This operation is similar to the `<<` shift operation in JavaScript,
     * where bits are shifted to the left, and the overflowing bits are discarded.
     *
     * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
     * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
     *
     * @param bits Amount of bits to shift the {@link UInt64} element to the left. The amount should be between 0 and 64 (or else the shift will fail).
     *
     * @example
     * ```ts
     * const x = UInt64.from(0b001100); // 12 in binary
     * const y = x.leftShift(2); // left shift by 2 bits
     * y.assertEquals(0b110000); // 48 in binary
     * ```
     */
    leftShift(bits: number): UInt64;
    /**
     * Performs a right shift operation on the provided {@link UInt64} element.
     * This operation is similar to the `>>` shift operation in JavaScript,
     * where bits are shifted to the right, and the overflowing bits are discarded.
     *
     * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
     * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
     *
     * @param bits Amount of bits to shift the {@link UInt64} element to the right. The amount should be between 0 and 64 (or else the shift will fail).
     *
     * @example
     * ```ts
     * const x = UInt64.from(0b001100); // 12 in binary
     * const y = x.rightShift(2); // right shift by 2 bits
     * y.assertEquals(0b000011); // 3 in binary
     * ```
     */
    rightShift(bits: number): UInt64;
    /**
     * Bitwise AND gadget on {@link UInt64} elements. Equivalent to the [bitwise AND `&` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND).
     * The AND gate works by comparing two bits and returning `1` if both bits are `1`, and `0` otherwise.
     *
     * It can be checked by a double generic gate that verifies the following relationship between the values below.
     *
     * The generic gate verifies:\
     * `a + b = sum` and the conjunction equation `2 * and = sum - xor`\
     * Where:\
     * `a + b = sum`\
     * `a ^ b = xor`\
     * `a & b = and`
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#and)
     *
     *
     * @example
     * ```typescript
     * let a = UInt64.from(3);    // ... 000011
     * let b = UInt64.from(5);    // ... 000101
     *
     * let c = a.and(b);    // ... 000001
     * c.assertEquals(1);
     * ```
     */
    and(x: UInt64): UInt64;
    /**
     * Bitwise OR gadget on {@link UInt64} elements. Equivalent to the [bitwise OR `|` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR).
     * The OR gate works by comparing two bits and returning `1` if at least one bit is `1`, and `0` otherwise.
     *
     * @example
     * ```typescript
     * let a = UInt64.from(3);    // ... 000011
     * let b = UInt64.from(5);    // ... 000101
     *
     * let c = a.or(b);    // ... 000111
     * c.assertEquals(7);
     * ```
     */
    or(x: UInt64): UInt64;
    /**
     * Checks if a {@link UInt64} is less than or equal to another one.
     */
    lessThanOrEqual(y: UInt64): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt64} is less than or equal to another one.
     */
    assertLessThanOrEqual(y: UInt64, message?: string): void;
    /**
     *
     * Checks if a {@link UInt64} is less than another one.
     */
    lessThan(y: UInt64): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt64} is less than another one.
     */
    assertLessThan(y: UInt64, message?: string): void;
    /**
     * Checks if a {@link UInt64} is greater than another one.
     */
    greaterThan(y: UInt64): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt64} is greater than another one.
     */
    assertGreaterThan(y: UInt64, message?: string): void;
    /**
     * Checks if a {@link UInt64} is greater than or equal to another one.
     */
    greaterThanOrEqual(y: UInt64): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt64} is greater than or equal to another one.
     */
    assertGreaterThanOrEqual(y: UInt64, message?: string): void;
    static toValue(x: UInt64): bigint;
    static fromValue<T extends AnyConstructor>(x: bigint | UInt64): InstanceType<T>;
}
/**
 * A 32 bit unsigned integer with values ranging from 0 to 4,294,967,295.
 */
declare class UInt32 extends CircuitValue {
    value: Field;
    static NUM_BITS: number;
    /**
     * Create a {@link UInt32}.
     * The max value of a {@link UInt32} is `2^32 - 1 = UInt32.MAXINT()`.
     *
     * **Warning**: Cannot overflow, an error is thrown if the result is greater than UInt32.MAXINT()
     */
    constructor(x: UInt32 | FieldVar | number | string | bigint);
    static Unsafe: {
        /**
         * Create a {@link UInt32} from a {@link Field} without constraining its range.
         *
         * **Warning**: This is unsafe, because it does not prove that the input {@link Field} actually fits in 32 bits.\
         * Only use this if you know what you are doing, otherwise use the safe {@link UInt32.from}.
         */
        fromField(x: Field): UInt32;
    };
    /**
     * Static method to create a {@link UInt32} with value `0`.
     */
    static get zero(): UInt32;
    /**
     * Static method to create a {@link UInt32} with value `0`.
     */
    static get one(): UInt32;
    /**
     * Turns the {@link UInt32} into a string.
     */
    toString(): string;
    /**
     * Turns the {@link UInt32} into a {@link BigInt}.
     */
    toBigint(): bigint;
    /**
     * Turns the {@link UInt32} into a {@link UInt64}.
     */
    toUInt64(): UInt64;
    static check(x: UInt32): void;
    static toInput(x: UInt32): HashInput;
    /**
     * Encodes this structure into a JSON-like object.
     */
    static toJSON(x: UInt32): string;
    /**
     * Decodes a JSON-like object into this structure.
     */
    static fromJSON<T extends AnyConstructor>(x: string): InstanceType<T>;
    private static checkConstant;
    /**
     * Creates a new {@link UInt32}.
     */
    static from(x: UInt32 | number | string | bigint): UInt32;
    /**
     * Creates a {@link UInt32} with a value of 4,294,967,295.
     */
    static MAXINT(): UInt32;
    /**
     * Addition modulo 2^32. Check {@link Gadgets.addMod32} for a detailed description.
     */
    addMod32(y: UInt32): UInt32;
    /**
     * Integer division with remainder.
     *
     * `x.divMod(y)` returns the quotient and the remainder.
     */
    divMod(y: UInt32 | number | string): {
        quotient: UInt32;
        rest: UInt32;
    };
    /**
     * Integer division.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * `z` such that `x * y <= x`.
     *
     */
    div(y: UInt32 | number): UInt32;
    /**
     * Integer remainder.
     *
     * `x.mod(y)` returns the value `z` such that `0 <= z < y` and
     * `x - z` is divisible by `y`.
     */
    mod(y: UInt32 | number): UInt32;
    /**
     * Multiplication with overflow checking.
     */
    mul(y: UInt32 | number): UInt32;
    /**
     * Addition with overflow checking.
     */
    add(y: UInt32 | number): UInt32;
    /**
     * Subtraction with underflow checking.
     */
    sub(y: UInt32 | number): UInt32;
    /**
     * Bitwise XOR gadget on {@link UInt32} elements. Equivalent to the [bitwise XOR `^` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR).
     * A XOR gate works by comparing two bits and returning `1` if two bits differ, and `0` if two bits are equal.
     *
     * This gadget builds a chain of XOR gates recursively.
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#xor-1)
     *
     * @param x {@link UInt32} element to compare.
     *
     * @example
     * ```ts
     * let a = UInt32.from(0b0101);
     * let b = UInt32.from(0b0011);
     *
     * let c = a.xor(b);
     * c.assertEquals(0b0110);
     * ```
     */
    xor(x: UInt32): UInt32;
    /**
     * Bitwise NOT gate on {@link UInt32} elements. Similar to the [bitwise
     * NOT `~` operator in JavaScript](https://developer.mozilla.org/en-US/docs/
     * Web/JavaScript/Reference/Operators/Bitwise_NOT).
     *
     * **Note:** The NOT gate operates over 32 bit for UInt32 types.
     *
     * A NOT gate works by returning `1` in each bit position if the
     * corresponding bit of the operand is `0`, and returning `0` if the
     * corresponding bit of the operand is `1`.
     *
     * NOT is implemented as a subtraction of the input from the all one bitmask.
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#not)
     *
     * @example
     * ```ts
     * // NOTing 4 bits with the unchecked version
     * let a = UInt32.from(0b0101);
     * let b = a.not();
     *
     * console.log(b.toBigInt().toString(2));
     * // 11111111111111111111111111111010
     * ```
     *
     * @param a - The value to apply NOT to.
     */
    not(): UInt32;
    /**
     * A (left and right) rotation operates similarly to the shift operation (`<<` for left and `>>` for right) in JavaScript,
     * with the distinction that the bits are circulated to the opposite end of a 64-bit representation rather than being discarded.
     * For a left rotation, this means that bits shifted off the left end reappear at the right end.
     * Conversely, for a right rotation, bits shifted off the right end reappear at the left end.
     *
     * It’s important to note that these operations are performed considering the big-endian 64-bit representation of the number,
     * where the most significant (64th) bit is on the left end and the least significant bit is on the right end.
     * The `direction` parameter is a string that accepts either `'left'` or `'right'`, determining the direction of the rotation.
     *
     * To safely use `rotate()`, you need to make sure that the value passed in is range-checked to 64 bits;
     * for example, using {@link Gadgets.rangeCheck64}.
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#rotation)
     *
     * @param bits amount of bits to rotate this {@link UInt32} element with.
     * @param direction left or right rotation direction.
     *
     *
     * @example
     * ```ts
     * const x = UInt32.from(0b001100);
     * const y = x.rotate(2, 'left');
     * const z = x.rotate(2, 'right'); // right rotation by 2 bits
     * y.assertEquals(0b110000);
     * z.assertEquals(0b000011);
     * ```
     */
    rotate(bits: number, direction?: 'left' | 'right'): UInt32;
    /**
     * Performs a left shift operation on the provided {@link UInt32} element.
     * This operation is similar to the `<<` shift operation in JavaScript,
     * where bits are shifted to the left, and the overflowing bits are discarded.
     *
     * It’s important to note that these operations are performed considering the big-endian 32-bit representation of the number,
     * where the most significant (32th) bit is on the left end and the least significant bit is on the right end.
     *
     * The operation expects the input to be range checked to 32 bit.
     *
     * @param bits Amount of bits to shift the {@link UInt32} element to the left. The amount should be between 0 and 32 (or else the shift will fail).
     *
     * @example
     * ```ts
     * const x = UInt32.from(0b001100); // 12 in binary
     * const y = x.leftShift(2); // left shift by 2 bits
     * y.assertEquals(0b110000); // 48 in binary
     * ```
     */
    leftShift(bits: number): UInt32;
    /**
     * Performs a left right operation on the provided {@link UInt32} element.
     * This operation is similar to the `>>` shift operation in JavaScript,
     * where bits are shifted to the right, and the overflowing bits are discarded.
     *
     * It’s important to note that these operations are performed considering the big-endian 32-bit representation of the number,
     * where the most significant (32th) bit is on the left end and the least significant bit is on the right end.
     *
     * @param bits Amount of bits to shift the {@link UInt32} element to the right. The amount should be between 0 and 32 (or else the shift will fail).
     *
     * The operation expects the input to be range checked to 32 bit.
     *
     * @example
     * ```ts
     * const x = UInt32.from(0b001100); // 12 in binary
     * const y = x.rightShift(2); // left shift by 2 bits
     * y.assertEquals(0b000011); // 48 in binary
     * ```
     */
    rightShift(bits: number): UInt32;
    /**
     * Bitwise AND gadget on {@link UInt32} elements. Equivalent to the [bitwise AND `&` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_AND).
     * The AND gate works by comparing two bits and returning `1` if both bits are `1`, and `0` otherwise.
     *
     * It can be checked by a double generic gate that verifies the following relationship between the values below.
     *
     * The generic gate verifies:\
     * `a + b = sum` and the conjunction equation `2 * and = sum - xor`\
     * Where:\
     * `a + b = sum`\
     * `a ^ b = xor`\
     * `a & b = and`
     *
     * You can find more details about the implementation in the [Mina book](https://o1-labs.github.io/proof-systems/specs/kimchi.html?highlight=gates#and)
     *
     *
     * @example
     * ```typescript
     * let a = UInt32.from(3);    // ... 000011
     * let b = UInt32.from(5);    // ... 000101
     *
     * let c = a.and(b, 2);    // ... 000001
     * c.assertEquals(1);
     * ```
     */
    and(x: UInt32): UInt32;
    /**
     * Bitwise OR gadget on {@link UInt32} elements. Equivalent to the [bitwise OR `|` operator in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_OR).
     * The OR gate works by comparing two bits and returning `1` if at least one bit is `1`, and `0` otherwise.
     *
     * @example
     * ```typescript
     * let a = UInt32.from(3);    // ... 000011
     * let b = UInt32.from(5);    // ... 000101
     *
     * let c = a.or(b);    // ... 000111
     * c.assertEquals(7);
     * ```
     */
    or(x: UInt32): UInt32;
    /**
     * Checks if a {@link UInt32} is less than or equal to another one.
     */
    lessThanOrEqual(y: UInt32): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt32} is less than or equal to another one.
     */
    assertLessThanOrEqual(y: UInt32, message?: string): void;
    /**
     * Checks if a {@link UInt32} is less than another one.
     */
    lessThan(y: UInt32): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt32} is less than another one.
     */
    assertLessThan(y: UInt32, message?: string): void;
    /**
     * Checks if a {@link UInt32} is greater than another one.
     */
    greaterThan(y: UInt32): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt32} is greater than another one.
     */
    assertGreaterThan(y: UInt32, message?: string): void;
    /**
     * Checks if a {@link UInt32} is greater than or equal to another one.
     */
    greaterThanOrEqual(y: UInt32): import("./bool.js").Bool;
    /**
     * Asserts that a {@link UInt32} is greater than or equal to another one.
     */
    assertGreaterThanOrEqual(y: UInt32, message?: string): void;
    static toValue(x: UInt32): bigint;
    static fromValue<T extends AnyConstructor>(x: bigint | UInt32): InstanceType<T>;
    /**
     * Split a UInt32 into 4 UInt8s, in little-endian order.
     */
    toBytes(): [UInt8, UInt8, UInt8, UInt8];
    /**
     * Split a UInt32 into 4 UInt8s, in big-endian order.
     */
    toBytesBE(): [UInt8, UInt8, UInt8, UInt8];
    /**
     * Combine 4 UInt8s into a UInt32, in little-endian order.
     */
    static fromBytes(bytes: UInt8[]): UInt32;
    /**
     * Combine 4 UInt8s into a UInt32, in big-endian order.
     */
    static fromBytesBE(bytes: UInt8[]): UInt32;
}
declare class Sign extends CircuitValue {
    value: Field;
    static get one(): Sign;
    static get minusOne(): Sign;
    static check(x: Sign): void;
    static empty<T extends AnyConstructor>(): InstanceType<T>;
    static toInput(x: Sign): HashInput;
    static toJSON(x: Sign): "Positive" | "Negative";
    static fromJSON<T extends AnyConstructor>(x: 'Positive' | 'Negative'): InstanceType<T>;
    neg(): Sign;
    mul(y: Sign): Sign;
    isPositive(): import("./bool.js").Bool;
    isNegative(): import("./bool.js").Bool;
    toString(): string;
    static toValue(x: Sign): TypesBigint.Sign;
    static fromValue<T extends AnyConstructor>(x: bigint | Sign): InstanceType<T>;
}
type BalanceChange = Types.AccountUpdate['body']['balanceChange'];
/**
 * A 64 bit signed integer with values ranging from -18,446,744,073,709,551,615 to 18,446,744,073,709,551,615.
 */
declare class Int64 extends CircuitValue implements BalanceChange {
    magnitude: UInt64;
    sgn: Sign;
    /**
     * @deprecated Use {@link Int64.create} for safe creation.
     *
     * WARNING: This constructor allows for ambiguous representation of zero (both +0 and -0).
     * This can lead to unexpected behavior in operations like {@link isPositive()} and {@link mod()}.
     *
     * Security Implications:
     * 1. A malicious prover could choose either positive or negative zero.
     * 2. Arithmetic operations that result in 0 may allow an attacker to arbitrarily choose the sign.
     * 3. This ambiguity could be exploited in protocols using Int64s for calculations like PNL tracking.
     *
     * Recommended Fix:
     * Use Int64.create() which enforces a canonical representation of zero, or
     * explicitly handle the zero case in operations like mod().
     *
     * @param magnitude - The magnitude of the integer as a UInt64.
     * @param [sgn=Sign.one] - The sign of the integer. Default is positive (Sign.one).
     */
    constructor(magnitude: UInt64, sgn?: Sign);
    /**
     * Safely creates a new Int64 instance, enforcing canonical representation of zero.
     * This is the recommended way to create Int64 instances.
     *
     * @param magnitude - The magnitude of the integer as a UInt64
     * @param sgn - The sign of the integer.
     * @returns A new Int64 instance with a canonical representation.
     *
     * @example
     * ```ts
     * const x = Int64.create(0); // canonical representation of zero
     * ```
     */
    static create(magnitude: UInt64, sign?: Sign): Int64;
    /**
     * Creates a new {@link Int64} from a {@link Field}.
     *
     * Does check if the {@link Field} is within range.
     */
    private static fromFieldUnchecked;
    /**
     * Creates a new {@link Int64} from a {@link Field}.
     *
     * **Does not** check if the {@link Field} is within range.
     */
    static fromUnsigned(x: UInt64 | UInt32): Int64;
    /**
     * Creates a new {@link Int64}.
     *
     * Check the range if the argument is a constant.
     */
    static from(x: Int64 | UInt32 | UInt64 | Field | number | string | bigint): Int64;
    static Unsafe: {
        fromObject(obj: {
            magnitude: UInt64;
            sgn: Sign;
        }): Int64;
    };
    fromObject(obj: {
        magnitude: UInt64 | number | string | bigint;
        sgn: Sign | bigint;
    }): Int64;
    /**
     * Turns the {@link Int64} into a {@link BigInt}.
     */
    toBigint(): bigint;
    /**
     * Turns the {@link Int64} into a string.
     */
    toString(): string;
    isConstant(): boolean;
    /**
     * Static method to create a {@link Int64} with value `0`.
     */
    static get zero(): Int64;
    /**
     * Static method to create a {@link Int64} with value `1`.
     */
    static get one(): Int64;
    /**
     * Static method to create a {@link Int64} with value `-1`.
     */
    static get minusOne(): Int64;
    /**
     * Returns the {@link Field} value.
     */
    toField(): import("./field.js").Field;
    /**
     * Static method to create a {@link Int64} from a {@link Field}.
     */
    static fromField(x: Field): Int64;
    /**
     * Negates the current Int64 value.
     *
     * This method returns a new Int64 instance with the opposite sign of the current value.
     * If the current value is zero, it returns zero.
     *
     * @returns A new Int64 instance with the negated value.
     *
     * @example
     * ```ts
     * Int64.from(5).neg();
     * ```
     *
     * @see {@link Int64#from} for creating Int64 instances
     * @see {@link Int64#zero} for the zero constant
     *
     * @throws {Error} Implicitly, if the internal Provable.if condition fails
     */
    neg(): Int64;
    /**
     * Addition with overflow checking.
     */
    add(y: Int64 | number | string | bigint | UInt64 | UInt32): Int64;
    /**
     * Subtraction with underflow checking.
     */
    sub(y: Int64 | number | string | bigint | UInt64 | UInt32): Int64;
    /**
     * Multiplication with overflow checking.
     */
    mul(y: Int64 | number | string | bigint | UInt64 | UInt32): Int64;
    /**
     * Integer division with canonical zero representation.
     *
     * @param y - The divisor. Can be an Int64, number, string, bigint, UInt64, or UInt32.
     * @returns A new Int64 representing the quotient, with canonical zero representation.
     *
     * `x.div(y)` returns the floor of `x / y`, that is, the greatest
     * *`z`* such that *`z * y <= x`.
     * On negative numbers, this rounds towards zero.
     *
     * This method guarantees that all results, including zero, have a consistent
     * representation, eliminating potential ambiguities in zero handling.
     */
    div(y: Int64 | number | string | bigint | UInt64 | UInt32): Int64;
    /**
     * Calculates the integer remainder of this Int64 divided by the given value.
     *
     * The result `z` satisfies the following conditions:
     * 1. 0 <= z < |y|
     * 2. x - z is divisible by y
     *
     * Note: This method follows the "truncate toward zero" convention for negative numbers.
     *
     * @param y - The divisor. Will be converted to UInt64 if not already.
     * @returns A new Int64 instance representing the remainder.
     *
     * @example
     * ```ts
     * const x1 = Int64.from(17);
     * const y1 = UInt64.from(5);
     * console.log(x1.mod(y1).toString()); // Output: 2
     * ```
     *
     * @throws {Error} Implicitly, if y is zero or negative.
     */
    mod(y: UInt64 | number | string | bigint | UInt32): Int64;
    /**
     * Checks if two values are equal.
     */
    equals(y: Int64 | number | string | bigint | UInt64 | UInt32): import("./bool.js").Bool;
    /**
     * Asserts that two values are equal.
     */
    assertEquals(y: Int64 | number | string | bigint | UInt64 | UInt32, message?: string): void;
    /**
     * Checks if the value is strictly positive (x > 0).
     *
     * @returns True if the value is greater than zero, false otherwise.
     *
     * @remarks
     * This method considers zero as non-positive. It ensures consistency
     * with the mathematical definition of "positive" as strictly greater than zero.
     * This differs from some other methods which may treat zero as non-negative.
     */
    isPositive(): import("./bool.js").Bool;
    /**
     * Checks if the value is non-negative (x >= 0).
     */
    isNonNegative(): import("./bool.js").Bool;
    /**
     * Checks if the value is negative (x < 0).
     */
    isNegative(): import("./bool.js").Bool;
    static check({ magnitude, sgn }: {
        magnitude: UInt64;
        sgn: Sign;
    }): void;
}
declare const UInt8_base: (new (value: {
    value: import("./field.js").Field;
}) => {
    value: import("./field.js").Field;
}) & {
    _isStruct: true;
} & Omit<import("./types/provable-intf.js").Provable<{
    value: import("./field.js").Field;
}, {
    value: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("./field.js").Field[]) => {
        value: import("./field.js").Field;
    };
} & {
    fromValue: (value: {
        value: string | number | bigint | import("./field.js").Field;
    }) => {
        value: import("./field.js").Field;
    };
    toInput: (x: {
        value: import("./field.js").Field;
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        value: import("./field.js").Field;
    }) => {
        value: string;
    };
    fromJSON: (x: {
        value: string;
    }) => {
        value: import("./field.js").Field;
    };
    empty: () => {
        value: import("./field.js").Field;
    };
};
/**
 * A 8 bit unsigned integer with values ranging from 0 to 255.
 */
declare class UInt8 extends UInt8_base {
    static NUM_BITS: number;
    /**
     * Create a {@link UInt8} from a bigint or number.
     * The max value of a {@link UInt8} is `2^8 - 1 = 255`.
     *
     * **Warning**: Cannot overflow past 255, an error is thrown if the result is greater than 255.
     */
    constructor(x: number | bigint | FieldVar | UInt8);
    static Unsafe: {
        /**
         * Create a {@link UInt8} from a {@link Field} without constraining its range.
         *
         * **Warning**: This is unsafe, because it does not prove that the input {@link Field} actually fits in 8 bits.\
         * Only use this if you know what you are doing, otherwise use the safe {@link UInt8.from}.
         */
        fromField(x: Field): UInt8;
    };
    /**
     * Static method to create a {@link UInt8} with value `0`.
     */
    static get zero(): UInt8;
    /**
     * Static method to create a {@link UInt8} with value `1`.
     */
    static get one(): UInt8;
    /**
     * Add a {@link UInt8} to another {@link UInt8} without allowing overflow.
     *
     * @example
     * ```ts
     * const x = UInt8.from(3);
     * const sum = x.add(5);
     * sum.assertEquals(8);
     * ```
     *
     * @throws if the result is greater than 255.
     */
    add(y: UInt8 | bigint | number): UInt8;
    /**
     * Subtract a {@link UInt8} from another {@link UInt8} without allowing underflow.
     *
     * @example
     * ```ts
     * const x = UInt8.from(8);
     * const difference = x.sub(5);
     * difference.assertEquals(3);
     * ```
     *
     * @throws if the result is less than 0.
     */
    sub(y: UInt8 | bigint | number): UInt8;
    /**
     * Multiply a {@link UInt8} by another {@link UInt8} without allowing overflow.
     *
     * @example
     * ```ts
     * const x = UInt8.from(3);
     * const product = x.mul(5);
     * product.assertEquals(15);
     * ```
     *
     * @throws if the result is greater than 255.
     */
    mul(y: UInt8 | bigint | number): UInt8;
    /**
     * Divide a {@link UInt8} by another {@link UInt8}.
     * This is integer division that rounds down.
     *
     * @example
     * ```ts
     * const x = UInt8.from(7);
     * const quotient = x.div(2);
     * quotient.assertEquals(3);
     * ```
     */
    div(y: UInt8 | bigint | number): UInt8;
    /**
     * Get the remainder a {@link UInt8} of division of another {@link UInt8}.
     *
     * @example
     * ```ts
     * const x = UInt8.from(50);
     * const mod = x.mod(30);
     * mod.assertEquals(20);
     * ```
     */
    mod(y: UInt8 | bigint | number): UInt8;
    /**
     * Get the quotient and remainder of a {@link UInt8} divided by another {@link UInt8}:
     *
     * `x == y * q + r`, where `0 <= r < y`.
     *
     * @param y - a {@link UInt8} to get the quotient and remainder of another {@link UInt8}.
     *
     * @return The quotient `q` and remainder `r`.
     */
    divMod(y: UInt8 | bigint | number): {
        quotient: UInt8;
        remainder: UInt8;
    };
    /**
     * Check if this {@link UInt8} is less than or equal to another {@link UInt8} value.
     * Returns a {@link Bool}.
     *
     * @example
     * ```ts
     * UInt8.from(3).lessThanOrEqual(UInt8.from(5));
     * ```
     */
    lessThanOrEqual(y: UInt8 | bigint | number): Bool;
    /**
     * Check if this {@link UInt8} is less than another {@link UInt8} value.
     * Returns a {@link Bool}.
     *
     * @example
     * ```ts
     * UInt8.from(2).lessThan(UInt8.from(3));
     * ```
     */
    lessThan(y: UInt8 | bigint | number): Bool;
    /**
     * Assert that this {@link UInt8} is less than another {@link UInt8} value.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param y - the {@link UInt8} value to compare & assert with this {@link UInt8}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertLessThan(y: UInt8 | bigint | number, message?: string): void;
    /**
     * Assert that this {@link UInt8} is less than or equal to another {@link UInt8} value.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param y - the {@link UInt8} value to compare & assert with this {@link UInt8}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertLessThanOrEqual(y: UInt8 | bigint | number, message?: string): void;
    /**
     * Check if this {@link UInt8} is greater than another {@link UInt8}.
     * Returns a {@link Bool}.
     *
     * @example
     * ```ts
     * // 5 > 3
     * UInt8.from(5).greaterThan(3);
     * ```
     */
    greaterThan(y: UInt8 | bigint | number): import("./bool.js").Bool;
    /**
     * Check if this {@link UInt8} is greater than or equal another {@link UInt8} value.
     * Returns a {@link Bool}.
     *
     * @example
     * ```ts
     * // 3 >= 3
     * UInt8.from(3).greaterThanOrEqual(3);
     * ```
     */
    greaterThanOrEqual(y: UInt8 | bigint | number): import("./bool.js").Bool;
    /**
     * Assert that this {@link UInt8} is greater than another {@link UInt8} value.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param y - the {@link UInt8} value to compare & assert with this {@link UInt8}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertGreaterThan(y: UInt8 | bigint | number, message?: string): void;
    /**
     * Assert that this {@link UInt8} is greater than or equal to another {@link UInt8} value.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param y - the {@link UInt8} value to compare & assert with this {@link UInt8}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertGreaterThanOrEqual(y: UInt8, message?: string): void;
    /**
     * Assert that this {@link UInt8} is equal another {@link UInt8} value.
     *
     * **Important**: If an assertion fails, the code throws an error.
     *
     * @param y - the {@link UInt8} value to compare & assert with this {@link UInt8}.
     * @param message? - a string error message to print if the assertion fails, optional.
     */
    assertEquals(y: UInt8 | bigint | number, message?: string): void;
    /**
     * Serialize the {@link UInt8} to a string, e.g. for printing.
     *
     * **Warning**: This operation is not provable.
     */
    toString(): string;
    /**
     * Serialize the {@link UInt8} to a number.
     *
     * **Warning**: This operation is not provable.
     */
    toNumber(): number;
    /**
     * Serialize the {@link UInt8} to a bigint.
     *
     * **Warning**: This operation is not provable.
     */
    toBigInt(): bigint;
    /**
     * {@link Provable.check} for {@link UInt8}.
     * Proves that the input is in the [0, 255] range.
     */
    static check(x: {
        value: Field;
    } | Field): void;
    static toInput(x: {
        value: Field;
    }): HashInput;
    /**
     * Turns a {@link UInt8} into a {@link UInt32}.
     */
    toUInt32(): UInt32;
    /**
     * Turns a {@link UInt8} into a {@link UInt64}.
     */
    toUInt64(): UInt64;
    /**
     * Creates a {@link UInt8} with a value of 255.
     */
    static MAXINT(): UInt8;
    /**
     * Creates a new {@link UInt8}.
     */
    static from(x: UInt8 | UInt64 | UInt32 | Field | number | bigint): UInt8;
    private static checkConstant;
}
