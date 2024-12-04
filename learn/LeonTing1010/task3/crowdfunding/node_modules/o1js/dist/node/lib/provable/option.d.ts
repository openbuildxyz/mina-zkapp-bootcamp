import { InferValue } from '../../bindings/lib/provable-generic.js';
import { InferProvable } from './types/struct.js';
import { ProvableInferPureFrom } from './types/provable-derivers.js';
import { Bool } from './wrapped.js';
import { ProvableType } from './types/provable-intf.js';
export { Option, OptionOrValue };
type Option<T, V = any> = {
    isSome: Bool;
    value: T;
} & {
    assertSome(message?: string): T;
    orElse(defaultValue: T | V): T;
};
type OptionOrValue<T, V> = {
    isSome: boolean | Bool;
    value: T | V;
} | T | V | undefined;
/**
 * Define an optional version of a provable type.
 *
 * @example
 * ```ts
 * class OptionUInt64 extends Option(UInt64) {}
 *
 * // create an optional UInt64
 * let some = OptionUInt64.from(5n);
 * let none = OptionUInt64.none();
 *
 * // get back a UInt64
 * let five: UInt64 = some.assertSome('must have a value');
 * let zero: UInt64 = none.orElse(0n); // specify a default value
 * ```
 */
declare function Option<A extends ProvableType>(type: A): ProvableInferPureFrom<A, Option<InferProvable<A>, InferValue<A>>, InferValue<A> | undefined> & (new (option: {
    isSome: Bool;
    value: InferProvable<A>;
}) => Option<InferProvable<A>, InferValue<A>>) & {
    fromValue(value: {
        isSome: boolean | Bool;
        value: InferProvable<A> | InferValue<A>;
    } | InferProvable<A> | InferValue<A> | undefined): Option<InferProvable<A>, InferValue<A>>;
    from(value?: InferProvable<A> | InferValue<A>): Option<InferProvable<A>, InferValue<A>>;
    none(): Option<InferProvable<A>, InferValue<A>>;
};
