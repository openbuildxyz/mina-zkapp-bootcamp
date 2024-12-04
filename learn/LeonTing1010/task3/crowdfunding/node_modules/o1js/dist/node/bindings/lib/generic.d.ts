import { Binable } from './binable.js';
export { GenericProvable, GenericProvablePure, GenericProvableExtended, GenericProvableExtendedPure, GenericField, GenericBool, GenericHashInput, GenericSignable, GenericSignableField, GenericSignableBool, primitiveTypes, PrimitiveTypeMap, primitiveTypeMap, EmptyNull, EmptyUndefined, EmptyVoid, };
type GenericProvable<T, TValue, Field> = {
    toFields: (x: T) => Field[];
    toAuxiliary: (x?: T) => any[];
    fromFields: (x: Field[], aux: any[]) => T;
    sizeInFields(): number;
    check: (x: T) => void;
    toValue: (x: T) => TValue;
    fromValue: (x: T | TValue) => T;
    toCanonical?: (x: T) => T;
};
type GenericProvablePure<T, TValue, Field> = Omit<GenericProvable<T, TValue, Field>, 'fromFields'> & {
    fromFields: (x: Field[]) => T;
};
type GenericSignable<T, TJson, Field> = {
    toInput: (x: T) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: T) => TJson;
    fromJSON: (x: TJson) => T;
    empty: () => T;
};
type GenericProvableExtended<T, TValue, TJson, Field> = GenericProvable<T, TValue, Field> & GenericSignable<T, TJson, Field>;
type GenericProvableExtendedPure<T, TValue, TJson, Field> = GenericProvablePure<T, TValue, Field> & GenericSignable<T, TJson, Field>;
type GenericSignableField<Field> = ((value: number | string | bigint | Field) => Field) & GenericSignable<Field, string, Field> & Binable<Field> & {
    sizeInBytes: number;
    toBigint: (x: Field) => bigint;
};
type GenericField<Field> = GenericSignableField<Field> & GenericProvable<Field, bigint, Field>;
type GenericSignableBool<Field, Bool = unknown> = ((value: boolean) => Bool) & GenericSignable<Bool, boolean, Field> & Binable<Bool> & {
    sizeInBytes: number;
};
type GenericBool<Field, Bool = unknown> = GenericSignableBool<Field, Bool> & GenericProvable<Bool, boolean, Field>;
type GenericHashInput<Field> = {
    fields?: Field[];
    packed?: [Field, number][];
};
declare let primitiveTypes: Set<string>;
declare function EmptyNull<Field>(): GenericProvableExtendedPure<null, null, null, Field>;
declare function EmptyUndefined<Field>(): GenericProvableExtendedPure<undefined, undefined, null, Field>;
declare function EmptyVoid<Field>(): GenericProvableExtendedPure<void, void, null, Field>;
type PrimitiveTypeMap<Field> = {
    number: GenericProvableExtended<number, number, number, Field>;
    string: GenericProvableExtended<string, string, string, Field>;
    null: GenericProvableExtended<null, null, null, Field>;
};
declare const primitiveTypeMap: PrimitiveTypeMap<any>;
