import { CurveParams, CurveAffine } from '../../../bindings/crypto/elliptic-curve.js';
import { ProvablePureExtended } from '../types/struct.js';
import { AlmostForeignField } from '../foreign-field.js';
import { Point } from '../gadgets/elliptic-curve.js';
import { Field3 } from '../gadgets/foreign-field.js';
export { createForeignCurve, ForeignCurve };
export { toPoint, FlexiblePoint };
type FlexiblePoint = {
    x: AlmostForeignField | Field3 | bigint | number;
    y: AlmostForeignField | Field3 | bigint | number;
};
declare function toPoint({ x, y }: ForeignCurve): Point;
declare class ForeignCurve {
    x: AlmostForeignField;
    y: AlmostForeignField;
    /**
     * Create a new {@link ForeignCurve} from an object representing the (affine) x and y coordinates.
     *
     * Note: Inputs must be range checked if they originate from a different field with a different modulus or if they are not constants. Please refer to the {@link ForeignField} constructor comments for more details.
     *
     * @example
     * ```ts
     * let x = new ForeignCurve({ x: 1n, y: 1n });
     * ```
     *
     * **Important**: By design, there is no way for a `ForeignCurve` to represent the zero point.
     *
     * **Warning**: This fails for a constant input which does not represent an actual point on the curve.
     */
    constructor(g: {
        x: AlmostForeignField | Field3 | bigint | number;
        y: AlmostForeignField | Field3 | bigint | number;
    });
    /**
     * Coerce the input to a {@link ForeignCurve}.
     */
    static from(g: ForeignCurve | FlexiblePoint): ForeignCurve;
    /**
     * Parses a hexadecimal string representing an uncompressed elliptic curve point and coerces it into a {@link ForeignCurve} point.
     *
     * The method extracts the x and y coordinates from the provided hex string and verifies that the resulting point lies on the curve.
     *
     * **Note:** This method only supports uncompressed elliptic curve points, which are 65 bytes in total (1-byte prefix + 32 bytes for x + 32 bytes for y).
     *
     * @param hex - The hexadecimal string representing the uncompressed elliptic curve point.
     * @returns - A point on the foreign curve, parsed from the given hexadecimal string.
     *
     * @throws - Throws an error if the input is not a valid public key.
     *
     * @example
     * ```ts
     * class Secp256k1 extends createForeignCurve(Crypto.CurveParams.Secp256k1) {}
     *
     * const publicKeyHex = '04f8b8db25c619d0c66b2dc9e97ecbafafae...'; // Example hex string for uncompressed point
     * const point = Secp256k1.fromHex(publicKeyHex);
     * ```
     *
     * **Important:** This method is only designed to handle uncompressed elliptic curve points in hex format.
     */
    static fromHex(hex: string): ForeignCurve;
    /**
     * Create a new {@link ForeignCurve} instance from an Ethereum public key in hex format, which may be either compressed or uncompressed.
     * This method is designed to handle the parsing of public keys as used by the ethers.js library.
     *
     * The input should represent the affine x and y coordinates of the point, in hexadecimal format.
     * Compressed keys are 33 bytes long and begin with 0x02 or 0x03, while uncompressed keys are 65 bytes long and begin with 0x04.
     *
     * **Warning:** This method is specifically designed for use with the Secp256k1 curve. Using it with other curves may result in incorrect behavior or errors.
     * Ensure that the curve setup matches Secp256k1, as shown in the example, to avoid unintended issues.
     *
     * @example
     * ```ts
     * import { Wallet, Signature, getBytes } from 'ethers';
     *
     * class Secp256k1 extends createForeignCurve(Crypto.CurveParams.Secp256k1) {}
     *
     * const wallet = Wallet.createRandom();
     *
     * const publicKey = Secp256k1.fromEthers(wallet.publicKey.slice(2));
     * ```
     *
     * @param hex - The public key as a hexadecimal string (without the "0x" prefix).
     * @returns A new instance of the curve representing the given public key.
     */
    static fromEthers(hex: string): ForeignCurve;
    /**
     * The constant generator point.
     */
    static get generator(): ForeignCurve;
    /**
     * The size of the curve's base field.
     */
    static get modulus(): bigint;
    /**
     * The size of the curve's base field.
     */
    get modulus(): bigint;
    /**
     * Checks whether this curve point is constant.
     *
     * See {@link FieldVar} to understand constants vs variables.
     */
    isConstant(): boolean;
    /**
     * Convert this curve point to a point with bigint coordinates.
     */
    toBigint(): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
    /**
     * Elliptic curve addition.
     *
     * ```ts
     * let r = p.add(q); // r = p + q
     * ```
     *
     * **Important**: this is _incomplete addition_ and does not handle the degenerate cases:
     * - Inputs are equal, `g = h` (where you would use {@link double}).
     *   In this case, the result of this method is garbage and can be manipulated arbitrarily by a malicious prover.
     * - Inputs are inverses of each other, `g = -h`, so that the result would be the zero point.
     *   In this case, the proof fails.
     *
     * If you want guaranteed soundness regardless of the input, use {@link addSafe} instead.
     *
     * @throws if the inputs are inverses of each other.
     */
    add(h: ForeignCurve | FlexiblePoint): ForeignCurve;
    /**
     * Safe elliptic curve addition.
     *
     * This is the same as {@link add}, but additionally proves that the inputs are not equal.
     * Therefore, the method is guaranteed to either fail or return a valid addition result.
     *
     * **Beware**: this is more expensive than {@link add}, and is still incomplete in that
     * it does not succeed on equal or inverse inputs.
     *
     * @throws if the inputs are equal or inverses of each other.
     */
    addSafe(h: ForeignCurve | FlexiblePoint): ForeignCurve;
    /**
     * Elliptic curve doubling.
     *
     * @example
     * ```ts
     * let r = p.double(); // r = 2 * p
     * ```
     */
    double(): ForeignCurve;
    /**
     * Elliptic curve negation.
     *
     * @example
     * ```ts
     * let r = p.negate(); // r = -p
     * ```
     */
    negate(): ForeignCurve;
    /**
     * Elliptic curve scalar multiplication, where the scalar is represented as a {@link ForeignField} element.
     *
     * **Important**: this proves that the result of the scalar multiplication is not the zero point.
     *
     * @throws if the scalar multiplication results in the zero point; for example, if the scalar is zero.
     *
     * @example
     * ```ts
     * let r = p.scale(s); // r = s * p
     * ```
     */
    scale(scalar: AlmostForeignField | bigint | number): ForeignCurve;
    static assertOnCurve(g: ForeignCurve): void;
    /**
     * Assert that this point lies on the elliptic curve, which means it satisfies the equation
     * `y^2 = x^3 + ax + b`
     */
    assertOnCurve(): void;
    static assertInSubgroup(g: ForeignCurve): void;
    /**
     * Assert that this point lies in the subgroup defined by `order*P = 0`.
     *
     * Note: this is a no-op if the curve has cofactor equal to 1. Otherwise
     * it performs the full scalar multiplication `order*P` and is expensive.
     */
    assertInSubgroup(): void;
    /**
     * Check that this is a valid element of the target subgroup of the curve:
     * - Check that the coordinates are valid field elements
     * - Use {@link assertOnCurve()} to check that the point lies on the curve
     * - If the curve has cofactor unequal to 1, use {@link assertInSubgroup()}.
     */
    static check(g: ForeignCurveNotNeeded): void;
    get Constructor(): typeof ForeignCurve;
    static _Bigint?: CurveAffine;
    static _Field?: typeof AlmostForeignField;
    static _Scalar?: typeof AlmostForeignField;
    static _provable?: ProvablePureExtended<ForeignCurve, {
        x: bigint;
        y: bigint;
    }, {
        x: string;
        y: string;
    }>;
    /**
     * Curve arithmetic on JS bigints.
     */
    static get Bigint(): {
        name: string;
        Field: {
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
        Scalar: {
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
        modulus: bigint;
        order: bigint;
        a: bigint;
        b: bigint;
        cofactor: bigint | undefined;
        hasCofactor: boolean;
        zero: {
            x: bigint;
            y: bigint;
            infinity: true;
        };
        one: {
            infinity: boolean;
            x: bigint;
            y: bigint;
        };
        hasEndomorphism: boolean;
        readonly Endo: {
            scalar: bigint;
            base: bigint;
            decomposeMaxBits: number;
            decompose(s: bigint): readonly [{
                readonly value: bigint;
                readonly isNegative: boolean;
                readonly abs: bigint;
            }, {
                readonly value: bigint;
                readonly isNegative: boolean;
                readonly abs: bigint;
            }];
            endomorphism(P: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): {
                x: bigint;
                y: bigint;
            };
            scaleProjective(g: import("../../../bindings/crypto/elliptic-curve.js").GroupProjective, s: bigint): {
                x: bigint;
                y: bigint;
                z: bigint;
            };
            scale(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine, s: bigint): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        };
        from(g: {
            x: bigint;
            y: bigint;
        }): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        fromNonzero(g: {
            x: bigint;
            y: bigint;
        }): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        equal(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine, h: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): boolean;
        isOnCurve(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): boolean;
        isInSubgroup(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): boolean;
        add(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine, h: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        double(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        negate(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        sub(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine, h: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
        scale(g: import("../../../bindings/crypto/elliptic-curve.js").GroupAffine, s: bigint | boolean[]): import("../../../bindings/crypto/elliptic-curve.js").GroupAffine;
    };
    /**
     * The base field of this curve as a {@link ForeignField}.
     */
    static get Field(): typeof AlmostForeignField;
    /**
     * The scalar field of this curve as a {@link ForeignField}.
     */
    static get Scalar(): typeof AlmostForeignField;
    /**
     * `Provable<ForeignCurve>`
     */
    static get provable(): ProvablePureExtended<ForeignCurve, {
        x: bigint;
        y: bigint;
    }, {
        x: string;
        y: string;
    }>;
}
declare class ForeignCurveNotNeeded extends ForeignCurve {
    constructor(g: {
        x: AlmostForeignField | Field3 | bigint | number;
        y: AlmostForeignField | Field3 | bigint | number;
    });
    static check(g: ForeignCurveNotNeeded): void;
}
/**
 * Create a class representing an elliptic curve group, which is different from the native {@link Group}.
 *
 * ```ts
 * const Curve = createForeignCurve(Crypto.CurveParams.Secp256k1);
 * ```
 *
 * `createForeignCurve(params)` takes curve parameters {@link CurveParams} as input.
 * We support `modulus` and `order` to be prime numbers up to 259 bits.
 *
 * The returned {@link ForeignCurveNotNeeded} class represents a _non-zero curve point_ and supports standard
 * elliptic curve operations like point addition and scalar multiplication.
 *
 * {@link ForeignCurveNotNeeded} also includes to associated foreign fields: `ForeignCurve.Field` and `ForeignCurve.Scalar`, see {@link createForeignField}.
 */
declare function createForeignCurve(params: CurveParams): typeof ForeignCurve;
