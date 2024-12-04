import { FiniteField } from '../../bindings/crypto/finite-field.js';
import { Field } from './field.js';
import { Bool } from './bool.js';
import { Tuple, TupleMap } from '../util/types.js';
import { Field3 } from './gadgets/foreign-field.js';
import { ProvablePureExtended } from './types/struct.js';
export { createForeignField };
export type { ForeignField, UnreducedForeignField, AlmostForeignField, CanonicalForeignField, };
declare class ForeignField {
    static _Bigint: FiniteField | undefined;
    static _modulus: bigint | undefined;
    static get Bigint(): {
        modulus: bigint;
        sizeInBits: number;
        t: bigint;
        M: bigint;
        twoadicRoot: bigint;
        mod(x: bigint): bigint;
        add(x: bigint, y: bigint): bigint;
        not(x: bigint, bits: number): bigint;
        negate(x: bigint): bigint;
        sub(x: bigint, y: bigint): bigint;
        mul(x: bigint, y: bigint): bigint;
        inverse: (x: bigint) => bigint | undefined;
        div(x: bigint, y: bigint): bigint | undefined;
        square(x: bigint): bigint;
        isSquare(x: bigint): boolean;
        sqrt(x: bigint): bigint | undefined;
        power(x: bigint, n: bigint): bigint;
        dot(x: bigint[], y: bigint[]): bigint;
        equal(x: bigint, y: bigint): boolean;
        isEven(x: bigint): boolean;
        random(): bigint;
        fromNumber(x: number): bigint;
        fromBigint(x: bigint): bigint;
        rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
        leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
        rightShift(x: bigint, bits: number): bigint;
    };
    static get modulus(): bigint;
    get modulus(): bigint;
    static get sizeInBits(): number;
    /**
     * The internal representation of a foreign field element, as a tuple of 3 limbs.
     */
    value: Field3;
    get Constructor(): typeof ForeignField;
    /**
     * Sibling classes that represent different ranges of field elements.
     */
    static _variants: {
        unreduced: typeof UnreducedForeignField;
        almostReduced: typeof AlmostForeignField;
        canonical: typeof CanonicalForeignField;
    } | undefined;
    /**
     * Constructor for unreduced field elements.
     */
    static get Unreduced(): typeof UnreducedForeignField;
    /**
     * Constructor for field elements that are "almost reduced", i.e. lie in the range [0, 2^ceil(log2(p))).
     */
    static get AlmostReduced(): typeof AlmostForeignField;
    /**
     * Constructor for field elements that are fully reduced, i.e. lie in the range [0, p).
     */
    static get Canonical(): typeof CanonicalForeignField;
    /**
     * Create a new {@link ForeignField} from a bigint, number, string or another ForeignField.
     * @example
     * ```ts
     * let x = new ForeignField(5);
     * ```
     *
     * Note: Inputs must be range checked if they originate from a different field with a different modulus or if they are not constants.
     *
     * - When constructing from another {@link ForeignField} instance, ensure the modulus matches. If not, check the modulus using `Gadgets.ForeignField.assertLessThan()` and handle appropriately.
     * - When constructing from a {@link Field3} array, ensure all elements are valid Field elements and range checked.
     * - Ensure constants are correctly reduced to the modulus of the field.
     */
    constructor(x: ForeignField | Field3 | bigint | number | string);
    /**
     * Coerce the input to a {@link ForeignField}.
     */
    static from(x: bigint | number | string): CanonicalForeignField;
    static from(x: ForeignField | bigint | number | string): ForeignField;
    /**
     * Checks whether this field element is a constant.
     *
     * See {@link FieldVar} to understand constants vs variables.
     */
    isConstant(): boolean;
    /**
     * Convert this field element to a constant.
     *
     * See {@link FieldVar} to understand constants vs variables.
     *
     * **Warning**: This function is only useful in {@link Provable.witness} or {@link Provable.asProver} blocks,
     * that is, in situations where the prover computes a value outside provable code.
     */
    toConstant(): ForeignField;
    /**
     * Convert this field element to a bigint.
     */
    toBigInt(): bigint;
    /**
     * Assert that this field element lies in the range [0, 2^k),
     * where k = ceil(log2(p)) and p is the foreign field modulus.
     *
     * Returns the field element as a {@link AlmostForeignField}.
     *
     * For a more efficient version of this for multiple field elements, see {@link assertAlmostReduced}.
     *
     * Note: this does not ensure that the field elements is in the canonical range [0, p).
     * To assert that stronger property, there is {@link assertCanonical}.
     * You should typically use {@link assertAlmostReduced} though, because it is cheaper to prove and sufficient for
     * ensuring validity of all our non-native field arithmetic methods.
     */
    assertAlmostReduced(): AlmostForeignField;
    /**
     * Assert that one or more field elements lie in the range [0, 2^k),
     * where k = ceil(log2(p)) and p is the foreign field modulus.
     *
     * This is most efficient than when checking a multiple of 3 field elements at once.
     */
    static assertAlmostReduced<T extends Tuple<ForeignField>>(...xs: T): TupleMap<T, AlmostForeignField>;
    /**
     * Assert that this field element is fully reduced,
     * i.e. lies in the range [0, p), where p is the foreign field modulus.
     *
     * Returns the field element as a {@link CanonicalForeignField}.
     */
    assertCanonical(): CanonicalForeignField;
    /**
     * Finite field addition
     * @example
     * ```ts
     * x.add(2); // x + 2 mod p
     * ```
     */
    add(y: ForeignField | bigint | number): UnreducedForeignField;
    /**
     * Finite field negation
     * @example
     * ```ts
     * x.neg(); // -x mod p = p - x
     * ```
     */
    neg(): AlmostForeignField;
    /**
     * Finite field subtraction
     * @example
     * ```ts
     * x.sub(1); // x - 1 mod p
     * ```
     */
    sub(y: ForeignField | bigint | number): UnreducedForeignField;
    /**
     * Sum (or difference) of multiple finite field elements.
     *
     * @example
     * ```ts
     * let z = ForeignField.sum([3, 2, 1], [-1, 1]); // 3 - 2 + 1
     * z.assertEquals(2);
     * ```
     *
     * This method expects a list of ForeignField-like values, `x0,...,xn`,
     * and a list of "operations" `op1,...,opn` where every op is 1 or -1 (plus or minus),
     * and returns
     *
     * `x0 + op1*x1 + ... + opn*xn`
     *
     * where the sum is computed in finite field arithmetic.
     *
     * **Important:** For more than two summands, this is significantly more efficient
     * than chaining calls to {@link ForeignField.add} and {@link ForeignField.sub}.
     *
     */
    static sum(xs: (ForeignField | bigint | number)[], operations: (1 | -1)[]): UnreducedForeignField;
    /**
     * Assert equality with a ForeignField-like value
     *
     * @example
     * ```ts
     * x.assertEquals(0, "x is zero");
     * ```
     *
     * Since asserting equality can also serve as a range check,
     * this method returns `x` with the appropriate type:
     *
     * @example
     * ```ts
     * let xChecked = x.assertEquals(1, "x is 1");
     * xChecked satisfies CanonicalForeignField;
     * ```
     */
    assertEquals(y: bigint | number | CanonicalForeignField, message?: string): CanonicalForeignField;
    assertEquals(y: AlmostForeignField, message?: string): AlmostForeignField;
    assertEquals(y: ForeignField, message?: string): ForeignField;
    /**
     * Assert that this field element is less than a constant c: `x < c`.
     *
     * The constant must satisfy `0 <= c < 2^264`, otherwise an error is thrown.
     *
     * @example
     * ```ts
     * x.assertLessThan(10);
     * ```
     */
    assertLessThan(c: bigint | number, message?: string): void;
    /**
     * Unpack a field element to its bits, as a {@link Bool}[] array.
     *
     * This method is provable!
     */
    toBits(length?: number): Bool[];
    /**
     * Create a field element from its bits, as a `Bool[]` array.
     *
     * This method is provable!
     */
    static fromBits(bits: Bool[]): AlmostForeignField;
    static random(): CanonicalForeignField;
    /**
     * Instance version of `Provable<ForeignField>.toFields`, see {@link Provable.toFields}
     */
    toFields(): Field[];
    static check(_: ForeignField): void;
    static _provable: any;
    /**
     * `Provable<ForeignField>`, see {@link Provable}
     */
    static get provable(): any;
}
declare class ForeignFieldWithMul extends ForeignField {
    /**
     * Finite field multiplication
     * @example
     * ```ts
     * x.mul(y); // x*y mod p
     * ```
     */
    mul(y: AlmostForeignField | bigint | number): UnreducedForeignField;
    /**
     * Multiplicative inverse in the finite field
     * @example
     * ```ts
     * let z = x.inv(); // 1/x mod p
     * z.mul(x).assertEquals(1);
     * ```
     */
    inv(): AlmostForeignField;
    /**
     * Division in the finite field, i.e. `x*y^(-1) mod p` where `y^(-1)` is the finite field inverse.
     * @example
     * ```ts
     * let z = x.div(y); // x/y mod p
     * z.mul(y).assertEquals(x);
     * ```
     */
    div(y: AlmostForeignField | bigint | number): AlmostForeignField;
}
declare class UnreducedForeignField extends ForeignField {
    type: 'Unreduced' | 'AlmostReduced' | 'FullyReduced';
    static _provable: ProvablePureExtended<UnreducedForeignField, bigint, string> | undefined;
    static get provable(): ProvablePureExtended<UnreducedForeignField, bigint, string>;
    static check(x: ForeignField): void;
}
declare class AlmostForeignField extends ForeignFieldWithMul {
    type: 'AlmostReduced' | 'FullyReduced';
    constructor(x: AlmostForeignField | Field3 | bigint | number | string);
    static _provable: ProvablePureExtended<AlmostForeignField, bigint, string> | undefined;
    static get provable(): ProvablePureExtended<AlmostForeignField, bigint, string>;
    static check(x: ForeignField): void;
    /**
     * Coerce the input to an {@link AlmostForeignField} without additional assertions.
     *
     * **Warning:** Only use if you know what you're doing.
     */
    static unsafeFrom(x: ForeignField): AlmostForeignField;
    /**
     * Check equality with a constant value.
     *
     * @example
     * ```ts
     * let isXZero = x.equals(0);
     * ```
     */
    equals(y: bigint | number): Bool;
}
declare class CanonicalForeignField extends ForeignFieldWithMul {
    type: "FullyReduced";
    constructor(x: CanonicalForeignField | Field3 | bigint | number | string);
    static _provable: ProvablePureExtended<CanonicalForeignField, bigint, string> | undefined;
    static get provable(): ProvablePureExtended<CanonicalForeignField, bigint, string>;
    static check(x: ForeignField): void;
    /**
     * Coerce the input to a {@link CanonicalForeignField} without additional assertions.
     *
     * **Warning:** Only use if you know what you're doing.
     */
    static unsafeFrom(x: ForeignField): CanonicalForeignField;
    /**
     * Check equality with a ForeignField-like value.
     *
     * @example
     * ```ts
     * let isEqual = x.equals(y);
     * ```
     *
     * Note: This method only exists on canonical fields; on unreduced fields, it would be easy to
     * misuse, because not being exactly equal does not imply being unequal modulo p.
     */
    equals(y: CanonicalForeignField | bigint | number): Bool;
}
/**
 * Create a class representing a prime order finite field, which is different from the native {@link Field}.
 *
 * ```ts
 * const SmallField = createForeignField(17n); // the finite field F_17
 * ```
 *
 * `createForeignField(p)` takes the prime modulus `p` of the finite field as input, as a bigint.
 * We support prime moduli up to a size of 259 bits.
 *
 * The returned {@link ForeignField} class supports arithmetic modulo `p` (addition and multiplication),
 * as well as helper methods like `assertEquals()` and `equals()`.
 *
 * _Advanced details:_
 *
 * Internally, a foreign field element is represented as three native field elements, each of which
 * represents a limb of 88 bits. Therefore, being a valid foreign field element means that all 3 limbs
 * fit in 88 bits, and the foreign field element altogether is smaller than the modulus p.
 *
 * Since the full `x < p` check is expensive, by default we only prove a weaker assertion, `x < 2^ceil(log2(p))`,
 * see {@link ForeignField.assertAlmostReduced} for more details.
 *
 * This weaker assumption is what we call "almost reduced", and it is represented by the {@link AlmostForeignField} class.
 * Note that only {@link AlmostForeignField} supports multiplication and inversion, while {@link UnreducedForeignField}
 * only supports addition and subtraction.
 *
 * This function returns the `Unreduced` class, which will cause the minimum amount of range checks to be created by default.
 * If you want to do multiplication, you have two options:
 * - create your field elements using the {@link ForeignField.AlmostReduced} constructor.
 * ```ts
 * let x = Provable.witness(ForeignField.AlmostReduced, () => 5n);
 * ```
 * - create your field elements normally and convert them using `x.assertAlmostReduced()`.
 * ```ts
 * let xChecked = x.assertAlmostReduced(); // asserts x < 2^ceil(log2(p)); returns `AlmostForeignField`
 * ```
 *
 * Similarly, there is a separate class {@link CanonicalForeignField} which represents fully reduced, "canonical" field elements.
 * To convert to a canonical field element, use `ForeignField.assertCanonical()`:
 *
 * ```ts
 * x.assertCanonical(); // asserts x < p; returns `CanonicalForeignField`
 * ```
 * You will likely not need canonical fields most of the time.
 *
 * Base types for all of these classes are separately exported as {@link UnreducedForeignField}, {@link AlmostForeignField} and {@link CanonicalForeignField}.,
 *
 * @param modulus the modulus of the finite field you are instantiating
 */
declare function createForeignField(modulus: bigint): typeof UnreducedForeignField;
