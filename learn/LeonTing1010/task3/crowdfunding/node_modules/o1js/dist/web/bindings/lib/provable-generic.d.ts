import { GenericHashInput, GenericProvable, GenericProvablePure, GenericProvableExtended, GenericProvableExtendedPure, GenericSignable } from './generic.js';
export { createDerivers, createHashInput, ProvableConstructor, SignableConstructor, NonMethods, InferProvable, InferJson, InferValue, InferredProvable, IsPure, From, Constructor, NestedProvable, InferProvableNested, InferJsonNested, InferValueNested, };
type ProvableConstructor<Field> = <A>(typeObj: A, 
/**
 * @deprecated
 */
options?: {
    isPure?: boolean;
}) => InferredProvable<A, Field>;
type SignableConstructor<Field> = <A>(typeObj: A) => InferredSignable<A, Field>;
declare function createDerivers<Field>(): {
    provable: ProvableConstructor<Field>;
    signable: SignableConstructor<Field>;
};
declare function createHashInput<Field>(): {
    readonly empty: {};
    append(input1: GenericHashInput<Field>, input2: GenericHashInput<Field>): GenericHashInput<Field>;
};
type JSONValue = number | string | boolean | null | Array<JSONValue> | {
    [key: string]: JSONValue;
};
type Struct<T, Field> = GenericProvableExtended<NonMethods<T>, any, any, Field> & Constructor<T> & {
    _isStruct: true;
};
type NonMethodKeys<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonMethods<T> = Pick<T, NonMethodKeys<T>>;
type Constructor<T> = new (...args: any) => T;
type Tuple<T> = [T, ...T[]] | [];
type Primitive = typeof String | typeof Number | typeof Boolean | typeof BigInt | null | undefined;
type InferPrimitive<P extends Primitive> = P extends typeof String ? string : P extends typeof Number ? number : P extends typeof Boolean ? boolean : P extends typeof BigInt ? bigint : P extends null ? null : P extends undefined ? undefined : any;
type InferPrimitiveValue<P extends Primitive> = P extends typeof String ? string : P extends typeof Number ? number : P extends typeof Boolean ? boolean : P extends typeof BigInt ? bigint : P extends null ? null : P extends undefined ? undefined : any;
type InferPrimitiveJson<P extends Primitive> = P extends typeof String ? string : P extends typeof Number ? number : P extends typeof Boolean ? boolean : P extends typeof BigInt ? string : P extends null ? null : P extends undefined ? null : any;
type NestedProvable<Field> = Primitive | {
    provable: GenericProvable<any, any, Field>;
} | GenericProvable<any, any, Field> | [NestedProvable<Field>, ...NestedProvable<Field>[]] | NestedProvable<Field>[] | {
    [key: string]: NestedProvable<Field>;
};
type InferProvable<A, Field> = A extends {
    provable: Constructor<infer U>;
} ? A extends {
    provable: GenericProvable<U, any, Field>;
} ? U : A extends {
    provable: Struct<U, Field>;
} ? U : InferProvableBase<A, Field> : A extends Constructor<infer U> ? A extends GenericProvable<U, any, Field> ? U : A extends Struct<U, Field> ? U : InferProvableBase<A, Field> : InferProvableBase<A, Field>;
type InferProvableBase<A, Field> = A extends {
    provable: GenericProvable<infer U, any, Field>;
} ? U : A extends GenericProvable<infer U, any, Field> ? U : A extends Primitive ? InferPrimitive<A> : A extends Tuple<any> ? {
    [I in keyof A]: InferProvable<A[I], Field>;
} : A extends (infer U)[] ? InferProvable<U, Field>[] : A extends Record<any, any> ? {
    [K in keyof A]: InferProvable<A[K], Field>;
} : never;
type InferValue<A> = A extends {
    provable: GenericProvable<any, infer U, any>;
} ? U : A extends GenericProvable<any, infer U, any> ? U : A extends Primitive ? InferPrimitiveValue<A> : A extends Tuple<any> ? {
    [I in keyof A]: InferValue<A[I]>;
} : A extends (infer U)[] ? InferValue<U>[] : A extends Record<any, any> ? {
    [K in keyof A]: InferValue<A[K]>;
} : never;
type WithJson<J> = {
    toJSON: (x: any) => J;
};
type InferJson<A> = A extends {
    provable: WithJson<infer J>;
} ? J : A extends WithJson<infer J> ? J : A extends Primitive ? InferPrimitiveJson<A> : A extends Tuple<any> ? {
    [I in keyof A]: InferJson<A[I]>;
} : A extends (infer U)[] ? InferJson<U>[] : A extends Record<any, any> ? {
    [K in keyof A]: InferJson<A[K]>;
} : JSONValue;
type IsPure<A, Field> = IsPureBase<A, Field> extends true ? true : false;
type IsPureBase<A, Field> = A extends {
    provable: GenericProvablePure<any, any, Field>;
} ? true : A extends GenericProvablePure<any, any, Field> ? true : A extends {
    provable: GenericProvable<any, any, Field>;
} ? false : A extends GenericProvable<any, any, Field> ? false : A extends Primitive ? false : A extends (infer U)[] ? IsPure<U, Field> : A extends Record<any, any> ? {
    [K in keyof A]: IsPure<A[K], Field>;
}[keyof A] : false;
type InferredProvable<A, Field> = IsPure<A, Field> extends true ? GenericProvableExtendedPure<InferProvable<A, Field>, InferValue<A>, InferJson<A>, Field> : GenericProvableExtended<InferProvable<A, Field>, InferValue<A>, InferJson<A>, Field>;
type InferSignable<A, Field> = A extends {
    provable: GenericSignable<infer U, any, Field>;
} ? U : A extends GenericSignable<infer U, any, Field> ? U : A extends Primitive ? InferPrimitive<A> : A extends Tuple<any> ? {
    [I in keyof A]: InferSignable<A[I], Field>;
} : A extends (infer U)[] ? InferSignable<U, Field>[] : A extends Record<any, any> ? {
    [K in keyof A]: InferSignable<A[K], Field>;
} : never;
type InferredSignable<A, Field> = GenericSignable<InferSignable<A, Field>, InferJson<A>, Field>;
type From<A> = A extends {
    provable: {
        fromValue: (x: infer U) => any;
    } & GenericProvable<any, any, any>;
} ? U | InferProvable<A, any> : A extends {
    fromValue: (x: infer U) => any;
} & GenericProvable<any, any, any> ? U | InferProvable<A, any> : A extends GenericProvable<any, any, any> ? InferProvable<A, any> | InferValue<A> : A extends Primitive ? InferPrimitiveValue<A> : A extends Tuple<any> ? {
    [I in keyof A]: From<A[I]>;
} : A extends (infer U)[] ? From<U>[] : A extends Record<any, any> ? {
    [K in keyof A]: From<A[K]>;
} : never;
type InferProvableNested<Field, A extends NestedProvable<Field>> = A extends Primitive ? InferPrimitive<A> : A extends {
    provable: GenericProvable<infer P, any, any>;
} ? P : A extends GenericProvable<infer P, any, any> ? P : A extends [NestedProvable<Field>, ...NestedProvable<Field>[]] ? {
    [I in keyof A & number]: InferProvableNested<Field, A[I]>;
} : A extends (infer U extends NestedProvable<Field>)[] ? InferProvableNested<Field, U>[] : A extends Record<string, NestedProvable<Field>> ? {
    [K in keyof A]: InferProvableNested<Field, A[K]>;
} : never;
type InferValueNested<Field, A extends NestedProvable<Field>> = A extends Primitive ? InferPrimitiveValue<A> : A extends {
    provable: GenericProvable<any, infer U, any>;
} ? U : A extends GenericProvable<any, infer U, any> ? U : A extends [NestedProvable<Field>, ...NestedProvable<Field>[]] ? {
    [I in keyof A & number]: InferValueNested<Field, A[I]>;
} : A extends (infer U extends NestedProvable<Field>)[] ? InferValueNested<Field, U>[] : A extends Record<string, NestedProvable<Field>> ? {
    [K in keyof A]: InferValueNested<Field, A[K]>;
} : never;
type InferJsonNested<Field, A extends NestedProvable<Field>> = A extends Primitive ? InferPrimitiveJson<A> : A extends {
    provable: GenericProvable<any, any, Field>;
} ? A['provable'] extends WithJson<infer J> ? J : never : A extends GenericProvable<any, any, Field> ? A extends WithJson<infer J> ? J : never : A extends [NestedProvable<Field>, ...NestedProvable<Field>[]] ? {
    [I in keyof A & number]: InferJsonNested<Field, A[I]>;
} : A extends (infer U extends NestedProvable<Field>)[] ? InferJsonNested<Field, U>[] : A extends Record<string, NestedProvable<Field>> ? {
    [K in keyof A]: InferJsonNested<Field, A[K]>;
} : never;
