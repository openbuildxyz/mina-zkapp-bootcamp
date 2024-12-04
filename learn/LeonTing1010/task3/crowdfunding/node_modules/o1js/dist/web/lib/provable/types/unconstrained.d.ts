import type { Field } from '../field.js';
import type { Provable } from '../provable.js';
export { Unconstrained };
/**
 * Container which holds an unconstrained value. This can be used to pass values
 * between the out-of-circuit blocks in provable code.
 *
 * Invariants:
 * - An `Unconstrained`'s value can only be accessed in auxiliary contexts.
 * - An `Unconstrained` can be empty when compiling, but never empty when running as the prover.
 *   (there is no way to create an empty `Unconstrained` in the prover)
 *
 * @example
 * ```ts
 * let x = Unconstrained.from(0n);
 *
 * class MyContract extends SmartContract {
 *   `@method` myMethod(x: Unconstrained<bigint>) {
 *
 *     Provable.witness(Field, () => {
 *       // we can access and modify `x` here
 *       let newValue = x.get() + otherField.toBigInt();
 *       x.set(newValue);
 *
 *       // ...
 *     });
 *
 *     // throws an error!
 *     x.get();
 *   }
 * ```
 */
declare class Unconstrained<T> {
    private option;
    private constructor();
    /**
     * Read an unconstrained value.
     *
     * Note: Can only be called outside provable code.
     */
    get(): T;
    /**
     * Modify the unconstrained value.
     */
    set(value: T): void;
    /**
     * Set the unconstrained value to the same as another `Unconstrained`.
     */
    setTo(value: Unconstrained<T>): void;
    /**
     * Create an `Unconstrained` with the given `value`.
     *
     * Note: If `T` contains provable types, `Unconstrained.from` is an anti-pattern,
     * because it stores witnesses in a space that's intended to be used outside the proof.
     * Something like the following should be used instead:
     *
     * ```ts
     * let xWrapped = Unconstrained.witness(() => Provable.toConstant(type, x));
     * ```
     */
    static from<T>(value: T | Unconstrained<T>): Unconstrained<T>;
    /**
     * Create an `Unconstrained` from a witness computation.
     */
    static witness<T>(compute: () => T): Unconstrained<T>;
    /**
     * Update an `Unconstrained` by a witness computation.
     */
    updateAsProver(compute: (value: T) => T): void;
    static provable: UnconstrainedProvable<any> & {
        toInput: (x: Unconstrained<any>) => {
            fields?: Field[];
            packed?: [Field, number][];
        };
        empty: () => Unconstrained<any>;
    };
    static withEmpty<T>(empty: T): Provable<Unconstrained<T>, T> & {
        toInput: (x: Unconstrained<T>) => {
            fields?: Field[];
            packed?: [Field, number][];
        };
        empty: () => Unconstrained<T>;
    };
}
type UnconstrainedProvable<T> = Provable<Unconstrained<T>, T>;
