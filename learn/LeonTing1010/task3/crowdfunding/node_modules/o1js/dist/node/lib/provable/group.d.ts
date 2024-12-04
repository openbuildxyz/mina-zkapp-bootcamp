import { Field } from './field.js';
import { FieldVar } from './core/fieldvar.js';
import { Scalar } from './scalar.js';
import { Bool } from './bool.js';
export { Group };
/**
 * An element of a Group.
 */
declare class Group {
    x: Field;
    y: Field;
    /**
     * The generator `g` of the Group.
     */
    static get generator(): Group;
    /**
     * Unique representation of the `zero` element of the Group (the identity element of addition in this Group).
     *
     * **Note**: The `zero` element is represented as `(0, 0)`.
     *
     * ```typescript
     * // g + -g = 0
     * g.add(g.neg()).assertEquals(zero);
     * // g + 0 = g
     * g.add(zero).assertEquals(g);
     * ```
     */
    static get zero(): Group;
    /**
     * Coerces anything group-like to a {@link Group}.
     */
    constructor({ x, y, }: {
        x: FieldVar | Field | number | string | bigint;
        y: FieldVar | Field | number | string | bigint;
    });
    /**
     * Checks if this element is the `zero` element `{x: 0, y: 0}`.
     */
    isZero(): Bool;
    /**
     * Adds this {@link Group} element to another {@link Group} element.
     *
     * ```ts
     * let g1 = Group({ x: -1, y: 2})
     * let g2 = g1.add(g1)
     * ```
     */
    add(g: Group): Group;
    /**
     * Lower-level variant of {@link add} which doesn't handle the case where one of the operands is zero, and
     * asserts that the output is non-zero.
     *
     * Optionally, zero outputs can be allowed by setting `allowZeroOutput` to `true`.
     *
     * **Warning**: If one of the inputs is zero, the result will be garbage and the proof useless.
     * This case has to be prevented or handled separately by the caller of this method.
     */
    addNonZero(g2: Group, allowZeroOutput?: boolean): Group;
    /**
     * Subtracts another {@link Group} element from this one.
     */
    sub(g: Group): Group;
    /**
     * Negates this {@link Group}. Under the hood, it simply negates the `y` coordinate and leaves the `x` coordinate as is.
     */
    neg(): Group;
    /**
     * Elliptic curve scalar multiplication. Scales the {@link Group} element `n`-times by itself, where `n` is the {@link Scalar}.
     *
     * ```typescript
     * let s = Scalar(5);
     * let 5g = g.scale(s);
     * ```
     */
    scale(s: Scalar | Field | number | bigint): Group;
    /**
     * Assert that this {@link Group} element equals another {@link Group} element.
     * Throws an error if the assertion fails.
     *
     * ```ts
     * g1.assertEquals(g2);
     * ```
     */
    assertEquals(g: Group, message?: string): void;
    /**
     * Check if this {@link Group} element equals another {@link Group} element.
     * Returns a {@link Bool}.
     *
     * ```ts
     * g1.equals(g1); // Bool(true)
     * ```
     */
    equals(g: Group): Bool;
    static toValue({ x, y }: Group): {
        x: bigint;
        y: bigint;
    };
    static fromValue(g: {
        x: bigint | number | Field;
        y: bigint | number | Field;
    } | Group): Group;
    /**
     * Serializes this {@link Group} element to a JSON object.
     *
     * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
     */
    toJSON(): {
        x: string;
        y: string;
    };
    /**
     * Part of the {@link Provable} interface.
     *
     * Returns an array containing this {@link Group} element as an array of {@link Field} elements.
     */
    toFields(): Field[];
    /**
     * Coerces two x and y coordinates into a {@link Group} element.
     */
    static from(x: FieldVar | Field | number | string | bigint, y: FieldVar | Field | number | string | bigint): Group;
    /**
     * Part of the {@link Provable} interface.
     *
     * Returns an array containing a {@link Group} element as an array of {@link Field} elements.
     */
    static toFields(g: Group): Field[];
    /**
     * Part of the {@link Provable} interface.
     *
     * Returns an empty array.
     */
    static toAuxiliary(g?: Group): never[];
    /**
     * Part of the {@link Provable} interface.
     *
     * Deserializes a {@link Group} element from a list of field elements.
     */
    static fromFields([x, y]: Field[]): Group;
    /**
     * Part of the {@link Provable} interface.
     *
     * Returns 2.
     */
    static sizeInFields(): number;
    /**
     * Serializes a {@link Group} element to a JSON object.
     *
     * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
     */
    static toJSON(g: Group): {
        x: string;
        y: string;
    };
    /**
     * Deserializes a JSON-like structure to a {@link Group} element.
     *
     * This operation does NOT affect the circuit and can't be used to prove anything about the representation of the element.
     */
    static fromJSON({ x, y, }: {
        x: string | number | bigint | Field | FieldVar;
        y: string | number | bigint | Field | FieldVar;
    }): Group;
    /**
     * Checks that a {@link Group} element is constraint properly by checking that the element is on the curve.
     */
    static check(g: Group): unknown;
    static toInput(x: Group): {
        fields: Field[];
    };
    static empty(): Group;
}
