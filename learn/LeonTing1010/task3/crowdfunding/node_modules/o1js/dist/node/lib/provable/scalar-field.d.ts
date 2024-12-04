import { ForeignField } from './foreign-field.js';
import { Scalar } from './scalar.js';
export { ScalarField };
declare const ScalarField_base: typeof import("./foreign-field.js").UnreducedForeignField;
/**
 * ForeignField representing the scalar field of Pallas and the base field of Vesta
 */
declare class ScalarField extends ScalarField_base {
    /**
     * Provable method to convert a {@link ScalarField} into a {@link Scalar}
     */
    toScalar(): Scalar;
    static toScalar(field: ForeignField): Scalar;
    /**
     * Converts this {@link Scalar} into a {@link ScalarField}
     */
    static fromScalar(s: Scalar): ScalarField;
}
