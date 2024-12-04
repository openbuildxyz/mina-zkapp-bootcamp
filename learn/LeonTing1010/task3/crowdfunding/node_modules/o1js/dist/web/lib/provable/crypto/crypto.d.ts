import { CurveParams as CurveParams_ } from '../../../bindings/crypto/elliptic-curve-examples.js';
import { CurveAffine } from '../../../bindings/crypto/elliptic-curve.js';
declare const Crypto: {
    /**
     * Create elliptic curve arithmetic methods.
     */
    createCurve(params: Crypto.CurveParams): Crypto.Curve;
    /**
     * Parameters defining an elliptic curve in short Weierstraß form
     * y^2 = x^3 + ax + b
     */
    CurveParams: {
        Secp256k1: import("../../../bindings/crypto/elliptic-curve.js").CurveParams;
        Secp256r1: import("../../../bindings/crypto/elliptic-curve.js").CurveParams;
        Pallas: import("../../../bindings/crypto/elliptic-curve.js").CurveParams;
        Vesta: import("../../../bindings/crypto/elliptic-curve.js").CurveParams;
    };
};
declare namespace Crypto {
    /**
     * Parameters defining an elliptic curve in short Weierstraß form
     * y^2 = x^3 + ax + b
     */
    type CurveParams = CurveParams_;
    type Curve = CurveAffine;
}
export { Crypto };
