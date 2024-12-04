import { Field } from '../field.js';
import { Field3 } from './foreign-field.js';
import { CurveAffine } from '../../../bindings/crypto/elliptic-curve.js';
import { Bool } from '../bool.js';
export { EllipticCurve, Point, Ecdsa };
export { verifyEcdsaConstant, initialAggregator, simpleMapToCurve };
declare const EllipticCurve: {
    add: typeof add;
    double: typeof double;
    negate: typeof negate;
    assertOnCurve: typeof assertOnCurve;
    scale: typeof scale;
    assertInSubgroup: typeof assertInSubgroup;
    multiScalarMul: typeof multiScalarMul;
};
/**
 * Non-zero elliptic curve point in affine coordinates.
 */
type Point = {
    x: Field3;
    y: Field3;
};
type point = {
    x: bigint;
    y: bigint;
};
declare namespace Ecdsa {
    /**
     * ECDSA signature consisting of two curve scalars.
     */
    type Signature = {
        r: Field3;
        s: Field3;
    };
    type signature = {
        r: bigint;
        s: bigint;
    };
}
declare function add(p1: Point, p2: Point, Curve: {
    modulus: bigint;
    a: bigint;
}): Point;
declare function double(p1: Point, Curve: {
    modulus: bigint;
    a: bigint;
}): Point;
declare function negate({ x, y }: Point, Curve: {
    modulus: bigint;
}): {
    x: Field3;
    y: Field3;
};
declare function assertOnCurve(p: Point, { modulus: f, a, b }: {
    modulus: bigint;
    b: bigint;
    a: bigint;
}): void;
/**
 * EC scalar multiplication, `scalar*point`
 *
 * The result is constrained to be not zero.
 */
declare function scale(scalar: Field3, point: Point, Curve: CurveAffine, config?: {
    mode?: 'assert-nonzero' | 'assert-zero';
    windowSize?: number;
    multiples?: Point[];
}): Point;
declare function assertInSubgroup(p: Point, Curve: CurveAffine): void;
/**
 * Verify an ECDSA signature.
 *
 * Details about the `config` parameter:
 * - For both the generator point `G` and public key `P`, `config` allows you to specify:
 *   - the `windowSize` which is used in scalar multiplication for this point.
 *     this flexibility is good because the optimal window size is different for constant and non-constant points.
 *     empirically, `windowSize=4` for constants and 3 for variables leads to the fewest constraints.
 *     our defaults reflect that the generator is always constant and the public key is variable in typical applications.
 *   - a table of multiples of those points, of length `2^windowSize`, which is used in the scalar multiplication gadget to speed up the computation.
 *     if these are not provided, they are computed on the fly.
 *     for the constant G, computing multiples costs no constraints, so passing them in makes no real difference.
 *     for variable public key, there is a possible use case: if the public key is a public input, then its multiples could also be.
 *     in that case, passing them in would avoid computing them in-circuit and save a few constraints.
 * - The initial aggregator `ia`, see {@link initialAggregator}. By default, `ia` is computed deterministically on the fly.
 *
 *
 * _Note_: If `signature.s` is a non-canonical element, an error will be thrown.
 * If `signature.r` is non-canonical, however, `false` will be returned.
 */
declare function verifyEcdsa(Curve: CurveAffine, signature: Ecdsa.Signature, msgHash: Field3, publicKey: Point, config?: {
    G?: {
        windowSize: number;
        multiples?: Point[];
    };
    P?: {
        windowSize: number;
        multiples?: Point[];
    };
    ia?: point;
}): Bool;
/**
 * Bigint implementation of ECDSA verify
 */
declare function verifyEcdsaConstant(Curve: CurveAffine, { r, s }: Ecdsa.signature, msgHash: bigint, publicKey: point): boolean;
/**
 * Multi-scalar multiplication:
 *
 * s_0 * P_0 + ... + s_(n-1) * P_(n-1)
 *
 * where P_i are any points.
 *
 * By default, we prove that the result is not zero.
 *
 * If you set the `mode` parameter to `'assert-zero'`, on the other hand,
 * we assert that the result is zero and just return the constant zero point.
 *
 * Implementation: We double all points together and leverage a precomputed table of size 2^c to avoid all but every cth addition.
 *
 * Note: this algorithm targets a small number of points, like 2 needed for ECDSA verification.
 *
 * TODO: could use lookups for picking precomputed multiples, instead of O(2^c) provable switch
 * TODO: custom bit representation for the scalar that avoids 0, to get rid of the degenerate addition case
 */
declare function multiScalarMul(scalars: Field3[], points: Point[], Curve: CurveAffine, tableConfigs?: ({
    windowSize?: number;
    multiples?: Point[];
} | undefined)[], mode?: 'assert-nonzero' | 'assert-zero', ia?: point): Point;
/**
 * Sign a message hash using ECDSA.
 */
declare function signEcdsa(Curve: CurveAffine, msgHash: bigint, privateKey: bigint): {
    r: bigint;
    s: bigint;
};
/**
 * For EC scalar multiplication we use an initial point which is subtracted
 * at the end, to avoid encountering the point at infinity.
 *
 * This is a simple hash-to-group algorithm which finds that initial point.
 * It's important that this point has no known discrete logarithm so that nobody
 * can create an invalid proof of EC scaling.
 */
declare function initialAggregator(Curve: CurveAffine): {
    x: bigint;
    y: bigint;
    infinity: boolean;
};
/**
 * Given an x coordinate (base field element), increment it until we find one with
 * a y coordinate that satisfies the curve equation, and return the point.
 *
 * If the curve has a cofactor, multiply by it to get a point in the correct subgroup.
 */
declare function simpleMapToCurve(x: bigint, Curve: CurveAffine): {
    x: bigint;
    y: bigint;
    infinity: boolean;
};
declare const Point: {
    from({ x, y }: point): Point;
    toBigint({ x, y }: Point): {
        x: bigint;
        y: bigint;
        infinity: boolean;
    };
    isConstant: (P: Point) => boolean;
    /**
     * Random point on the curve.
     */
    random(Curve: CurveAffine): Point;
    provable: import("../../../bindings/lib/generic.js").GenericProvableExtendedPure<{
        x: [Field, Field, Field];
        y: [Field, Field, Field];
    }, {
        x: bigint;
        y: bigint;
    }, {
        x: [any, any, any];
        y: [any, any, any];
    }, Field>;
};
declare const Ecdsa: {
    sign: typeof signEcdsa;
    verify: typeof verifyEcdsa;
    Signature: {
        from({ r, s }: Ecdsa.signature): Ecdsa.Signature;
        toBigint({ r, s }: Ecdsa.Signature): Ecdsa.signature;
        isConstant: (S: Ecdsa.Signature) => boolean;
        /**
         * Create an {@link EcdsaSignature} from a raw 130-char hex string as used in
         * [Ethereum transactions](https://ethereum.org/en/developers/docs/transactions/#typed-transaction-envelope).
         */
        fromHex(rawSignature: string): Ecdsa.Signature;
        provable: import("../../../bindings/lib/generic.js").GenericProvableExtendedPure<{
            r: [Field, Field, Field];
            s: [Field, Field, Field];
        }, {
            r: bigint;
            s: bigint;
        }, {
            r: [any, any, any];
            s: [any, any, any];
        }, Field>;
    };
};
