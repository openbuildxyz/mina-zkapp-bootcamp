import { Provable, ProvableHashable, ProvablePure, ProvableType, ToProvable } from './provable-intf.js';
import type { Field } from '../wrapped.js';
import { NonMethods, InferProvable as GenericInferProvable, InferJson, InferredProvable as GenericInferredProvable, IsPure as GenericIsPure, NestedProvable as GenericNestedProvable, Constructor, InferValue, InferJsonNested, InferValueNested, InferProvableNested } from '../../../bindings/lib/provable-generic.js';
import { Tuple } from '../../util/types.js';
import { GenericHashInput } from '../../../bindings/lib/generic.js';
export { ProvableExtended, ProvableInferPureFrom, provable, provablePure, provableTuple, provableFromClass, provableExtends, };
export { NonMethods, HashInput, InferProvable, InferProvableType, InferJson, InferredProvable, IsPure, NestedProvable, mapValue, };
type ProvableExtension<T, TJson = any> = {
    toInput: (x: T) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: T) => TJson;
    fromJSON: (x: TJson) => T;
    empty: () => T;
};
type ProvableExtended<T, TValue = any, TJson = any> = Provable<T, TValue> & ProvableExtension<T, TJson>;
type ProvablePureExtended<T, TValue = any, TJson = any> = ProvablePure<T, TValue> & ProvableExtension<T, TJson>;
type InferProvable<T> = GenericInferProvable<T, Field>;
type InferProvableType<T extends ProvableType> = InferProvable<ToProvable<T>>;
type InferredProvable<T> = GenericInferredProvable<T, Field>;
type IsPure<T> = GenericIsPure<T, Field>;
type ProvableInferPureFrom<A, T, V> = IsPure<A> extends true ? ProvablePure<T, V> : Provable<T, V>;
type HashInput = GenericHashInput<Field>;
declare const HashInput: {
    readonly empty: {};
    append(input1: GenericHashInput<import("../field.js").Field>, input2: GenericHashInput<import("../field.js").Field>): GenericHashInput<import("../field.js").Field>;
};
type NestedProvable = GenericNestedProvable<Field>;
declare const provable: import("../../../bindings/lib/provable-generic.js").ProvableConstructor<import("../field.js").Field>;
declare function provablePure<A>(typeObj: A): ProvablePureExtended<InferProvable<A>, InferValue<A>, InferJson<A>>;
declare function provableTuple<T extends Tuple<any>>(types: T): InferredProvable<T>;
declare function provableFromClass<A extends NestedProvable, T extends InferProvableNested<Field, A>, V extends InferValueNested<Field, A>, J extends InferJsonNested<Field, A>>(Class: Constructor<T> & {
    check?: (x: T) => void;
    empty?: () => T;
}, typeObj: A): IsPure<A> extends true ? ProvablePureExtended<T, V, J> : ProvableExtended<T, V, J>;
declare function provableExtends<A extends ProvableHashable<any>, T extends InferProvable<A>, S extends T>(S: new (t: T) => S, base: A): {
    sizeInFields(): number;
    toFields(value: S | T): import("../field.js").Field[];
    toAuxiliary(value?: S | T): any[];
    fromFields(fields: import("../field.js").Field[], aux: any[]): S;
    check(value: S | T): void;
    toValue(value: S | T): any;
    fromValue(value: S | InferValue<A>): S;
    empty(): S;
    toInput(value: S | T): {
        fields?: import("../field.js").Field[] | undefined;
        packed?: [import("../field.js").Field, number][] | undefined;
    };
};
declare function mapValue<A extends ProvableHashable<any>, V extends InferValue<A>, W, T extends InferProvable<A>>(provable: A, there: (x: V) => W, back: (x: W | T) => V | T): ProvableHashable<T, W>;
