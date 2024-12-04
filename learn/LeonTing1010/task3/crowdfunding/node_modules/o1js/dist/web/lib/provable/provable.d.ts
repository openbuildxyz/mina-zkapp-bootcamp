/**
 * {@link Provable} is
 * - a namespace with tools for writing provable code
 * - the main interface for types that can be used in provable code
 */
import { Bool } from './bool.js';
import { Field } from './field.js';
import { Provable as Provable_, ProvableType } from './types/provable-intf.js';
import type { FlexibleProvable, FlexibleProvableType } from './types/struct.js';
import { Context } from '../util/global-context.js';
import { InferProvableType, InferredProvable } from './types/provable-derivers.js';
import { inCheckedComputation, inProver, asProver, constraintSystem } from './core/provable-context.js';
import { witness, witnessAsync, witnessFields } from './types/witness.js';
import { ToProvable } from '../../lib/provable/types/provable-intf.js';
export { Provable };
export { memoizationContext, MemoizationContext, memoizeWitness, getBlindingValue, };
/**
 * `Provable<T>` is the general interface for provable types in o1js.
 *
 * `Provable<T>` describes how a type `T` is made up of {@link Field} elements and "auxiliary" (non-provable) data.
 *
 * `Provable<T>` is the required input type in several methods in o1js.
 * One convenient way to create a `Provable<T>` is using `Struct`.
 *
 * All built-in provable types in o1js ({@link Field}, {@link Bool}, etc.) are instances of `Provable<T>` as well.
 *
 * Note: These methods are meant to be used by the library internally and are not directly when writing provable code.
 */
type Provable<T, TValue = any> = Provable_<T, TValue>;
declare const Provable: {
    /**
     * Create a new witness. A witness, or variable, is a value that is provided as input
     * by the prover. This provides a flexible way to introduce values from outside into the circuit.
     * However, note that nothing about how the value was created is part of the proof - `Provable.witness`
     * behaves exactly like user input. So, make sure that after receiving the witness you make any assertions
     * that you want to associate with it.
     * @example
     * Example for re-implementing `Field.inv` with the help of `witness`:
     * ```ts
     * let invX = Provable.witness(Field, () => {
     *   // compute the inverse of `x` outside the circuit, however you like!
     *   return Field.inv(x);
     * }
     * // prove that `invX` is really the inverse of `x`:
     * invX.mul(x).assertEquals(1);
     * ```
     */
    witness: typeof witness;
    /**
     * Witness a tuple of field elements. This works just like {@link Provable.witness},
     * but optimized for witnessing plain field elements, which is especially common
     * in low-level provable code.
     */
    witnessFields: typeof witnessFields;
    /**
     * Create a new witness from an async callback.
     *
     * See {@link Provable.witness} for more information.
     */
    witnessAsync: typeof witnessAsync;
    /**
     * Proof-compatible if-statement.
     * This behaves like a ternary conditional statement in JS.
     *
     * **Warning**: Since `Provable.if()` is a normal JS function call, both the if and the else branch
     * are evaluated before calling it. Therefore, you can't use this function
     * to guard against execution of one of the branches. It only allows you to pick one of two values.
     *
     * @example
     * ```ts
     * const condition = Bool(true);
     * const result = Provable.if(condition, Field(1), Field(2)); // returns Field(1)
     * ```
     */
    if: typeof if_;
    /**
     * Generalization of {@link Provable.if} for choosing between more than two different cases.
     * It takes a "mask", which is an array of `Bool`s that contains only one `true` element, a type/constructor, and an array of values of that type.
     * The result is that value which corresponds to the true element of the mask.
     * @example
     * ```ts
     * let x = Provable.switch([Bool(false), Bool(true)], Field, [Field(1), Field(2)]);
     * x.assertEquals(2);
     * ```
     */
    switch: typeof switch_;
    /**
     * Asserts that two values are equal.
     * @example
     * ```ts
     * class MyStruct extends Struct({ a: Field, b: Bool }) {};
     * const a: MyStruct = { a: Field(0), b: Bool(false) };
     * const b: MyStruct = { a: Field(1), b: Bool(true) };
     * Provable.assertEqual(MyStruct, a, b);
     * ```
     */
    assertEqual: typeof assertEqual;
    /**
     * Asserts that two values are equal, if an enabling condition is true.
     *
     * If the condition is false, the assertion is skipped.
     */
    assertEqualIf: typeof assertEqualIf;
    /**
     * Checks if two elements are equal.
     * @example
     * ```ts
     * class MyStruct extends Struct({ a: Field, b: Bool }) {};
     * const a: MyStruct = { a: Field(0), b: Bool(false) };
     * const b: MyStruct = { a: Field(1), b: Bool(true) };
     * const isEqual = Provable.equal(MyStruct, a, b);
     * ```
     */
    equal: typeof equal;
    /**
     * Creates a {@link Provable} for a generic array.
     * @example
     * ```ts
     * const ProvableArray = Provable.Array(Field, 5);
     * ```
     */
    Array: typeof provableArray;
    /**
     * Check whether a value is constant.
     * See {@link FieldVar} for more information about constants and variables.
     *
     * @example
     * ```ts
     * let x = Field(42);
     * Provable.isConstant(Field, x); // true
     * ```
     */
    isConstant: typeof isConstant;
    /**
     * Interface to log elements within a circuit. Similar to `console.log()`.
     * @example
     * ```ts
     * const element = Field(42);
     * Provable.log(element);
     * ```
     */
    log: typeof log;
    /**
     * Runs code as a prover.
     * @example
     * ```ts
     * Provable.asProver(() => {
     *   // Your prover code here
     * });
     * ```
     */
    asProver: typeof asProver;
    /**
     * Runs provable code quickly, without creating a proof, but still checking whether constraints are satisfied.
     * @example
     * ```ts
     * await Provable.runAndCheck(() => {
     *   // Your code to check here
     * });
     * ```
     */
    runAndCheck(f: (() => Promise<void>) | (() => void)): Promise<void>;
    /**
     * Runs provable code quickly, without creating a proof, and not checking whether constraints are satisfied.
     * @example
     * ```ts
     * await Provable.runUnchecked(() => {
     *   // Your code to run here
     * });
     * ```
     */
    runUnchecked(f: (() => Promise<void>) | (() => void)): Promise<void>;
    /**
     * Returns information about the constraints created by the callback function.
     * @example
     * ```ts
     * const result = await Provable.constraintSystem(circuit);
     * console.log(result);
     * ```
     */
    constraintSystem: typeof constraintSystem;
    /**
     * Checks if the code is run in prover mode.
     * @example
     * ```ts
     * if (Provable.inProver()) {
     *   // Prover-specific code
     * }
     * ```
     */
    inProver: typeof inProver;
    /**
     * Checks if the code is run in checked computation mode.
     * @example
     * ```ts
     * if (Provable.inCheckedComputation()) {
     *   // Checked computation-specific code
     * }
     * ```
     */
    inCheckedComputation: typeof inCheckedComputation;
    /**
     * Returns a constant version of a provable type.
     */
    toConstant<T>(type: ProvableType<T>, value: T): T;
    /**
     * Return a canonical version of a value, where
     * canonical is defined by the `type`.
     */
    toCanonical<T_1>(type: Provable<T_1, any>, value: T_1): T_1;
};
type ToFieldable = {
    toFields(): Field[];
};
declare function assertEqual<T>(type: FlexibleProvableType<T>, x: T, y: T): void;
declare function assertEqual<T extends ToFieldable>(x: T, y: T): void;
declare function equal<T>(type: FlexibleProvableType<T>, x: T, y: T): Bool;
declare function if_<T>(condition: Bool, type: FlexibleProvableType<T>, x: T, y: T): T;
declare function if_<T extends ToFieldable>(condition: Bool, x: T, y: T): T;
declare function switch_<T, A extends FlexibleProvableType<T>>(mask: Bool[], type: A, values: T[], { allowNonExclusive }?: {
    allowNonExclusive?: boolean | undefined;
}): T;
declare function assertEqualIf<A extends ProvableType<any>, T extends InferProvableType<A> = InferProvableType<A>>(enabled: Bool, type: A, x: T, y: T): void;
declare function isConstant<T>(type: ProvableType<T>, x: T): boolean;
declare function log(...args: any): void;
type MemoizationContext = {
    memoized: {
        fields: Field[];
        aux: any[];
    }[];
    currentIndex: number;
    blindingValue: Field;
};
declare let memoizationContext: Context.t<MemoizationContext>;
/**
 * Like Provable.witness, but memoizes the witness during transaction construction
 * for reuse by the prover. This is needed to witness non-deterministic values.
 */
declare function memoizeWitness<T>(type: FlexibleProvable<T>, compute: () => T): T;
declare function getBlindingValue(): Field;
declare function provableArray<A extends FlexibleProvableType<any>>(elementType: A, length: number): InferredProvable<ToProvable<A>[]>;
