import { GenericProvableExtended, GenericSignable } from './generic.js';
export { ProvableFromLayout, SignableFromLayout, GenericLayout, genericLayoutFold, };
type GenericTypeMap<Field, Bool, UInt32, UInt64, Sign, BalanceChange, PublicKey, AuthRequired, TokenId> = {
    Field: Field;
    Bool: Bool;
    UInt32: UInt32;
    UInt64: UInt64;
    Sign: Sign;
    BalanceChange: BalanceChange;
    PublicKey: PublicKey;
    AuthRequired: AuthRequired;
    TokenId: TokenId;
};
type AnyTypeMap = GenericTypeMap<any, any, any, any, any, any, any, any, any>;
type TypeMapValues<TypeMap extends AnyTypeMap, JsonMap extends AnyTypeMap, BaseType> = {
    [K in keyof TypeMap & keyof JsonMap]: BaseType;
};
type TypeMapProvable<TypeMap extends AnyTypeMap, ValueMap extends AnyTypeMap, JsonMap extends AnyTypeMap> = {
    [K in keyof TypeMap & keyof JsonMap]: K extends keyof ValueMap ? GenericProvableExtended<TypeMap[K], ValueMap[K], JsonMap[K], TypeMap['Field']> : never;
};
type TypeMapSignable<TypeMap extends AnyTypeMap, JsonMap extends AnyTypeMap> = {
    [K in keyof TypeMap & keyof JsonMap]: GenericSignable<TypeMap[K], JsonMap[K], TypeMap['Field']>;
};
declare function SignableFromLayout<TypeMap extends AnyTypeMap, JsonMap extends AnyTypeMap>(TypeMap: TypeMapSignable<TypeMap, JsonMap>, customTypes: Record<string, GenericSignable<any, any, TypeMap['Field']>>): {
    signableFromLayout: <T, TJson>(typeData: GenericLayout<TypeMap>) => {
        toJSON(value: T): TJson;
        fromJSON(json: TJson): T;
        toInput(value: T): {
            fields?: TypeMap["Field"][] | undefined;
            packed?: [TypeMap["Field"], number][] | undefined;
        };
        empty(): T;
    };
    toInput: (typeData: GenericLayout<TypeMap>, value: any) => {
        fields?: TypeMap["Field"][] | undefined;
        packed?: [TypeMap["Field"], number][] | undefined;
    };
    toJSON: (typeData: GenericLayout<TypeMap>, value: any) => any;
    fromJSON: (typeData: GenericLayout<TypeMap>, json: any) => any;
    empty: (typeData: GenericLayout<TypeMap>) => any;
    toJSONEssential: (typeData: GenericLayout<TypeMap>, value: any) => any;
};
declare function ProvableFromLayout<TypeMap extends AnyTypeMap, ValueMap extends AnyTypeMap, JsonMap extends AnyTypeMap>(TypeMap: TypeMapProvable<TypeMap, ValueMap, JsonMap>, customTypes: Record<string, GenericProvableExtended<any, any, any, TypeMap['Field']>>): {
    provableFromLayout: <T, TValue, TJson>(typeData: GenericLayout<TypeMap>) => GenericProvableExtended<T, TValue, TJson, TypeMap["Field"]>;
    toJSONEssential: (typeData: GenericLayout<TypeMap>, value: any) => any;
    empty: (typeData: GenericLayout<TypeMap>) => any;
};
type GenericFoldSpec<T, R, TypeMap extends AnyTypeMap, BaseType> = {
    map: (type: BaseType, value?: T, name?: string) => R;
    reduceArray: (array: R[], typeData: ArrayLayout<TypeMap>) => R;
    reduceObject: (keys: string[], record: Record<string, R>) => R;
    reduceFlaggedOption: (option: {
        isSome: R;
        value: R;
    }, typeData: FlaggedOptionLayout<TypeMap>) => R;
    reduceOrUndefined: (value: R | undefined, innerTypeData: GenericLayout<TypeMap>) => R;
};
declare function genericLayoutFold<BaseType, T = any, R = any, TypeMap extends AnyTypeMap = AnyTypeMap, JsonMap extends AnyTypeMap = AnyTypeMap>(TypeMap: TypeMapValues<TypeMap, JsonMap, BaseType>, customTypes: Record<string, BaseType>, spec: GenericFoldSpec<T, R, TypeMap, BaseType>, typeData: GenericLayout<TypeMap>, value?: T): R;
type WithChecked<TypeMap extends AnyTypeMap> = {
    checkedType?: GenericLayout<TypeMap>;
    checkedTypeName?: string;
};
type BaseLayout<TypeMap extends AnyTypeMap> = {
    type: keyof TypeMap & string;
} & WithChecked<TypeMap>;
type RangeLayout<TypeMap extends AnyTypeMap, T = BaseLayout<TypeMap>> = {
    type: 'object';
    name: string;
    keys: ['lower', 'upper'];
    entries: {
        lower: T;
        upper: T;
    };
} & WithChecked<TypeMap>;
type OptionLayout<TypeMap extends AnyTypeMap, T = BaseLayout<AnyTypeMap>> = {
    type: 'option';
} & ({
    optionType: 'closedInterval';
    rangeMin: any;
    rangeMax: any;
    inner: RangeLayout<TypeMap, T>;
} | {
    optionType: 'flaggedOption';
    inner: T;
} | {
    optionType: 'orUndefined';
    inner: T;
}) & WithChecked<TypeMap>;
type FlaggedOptionLayout<TypeMap extends AnyTypeMap, T = BaseLayout<AnyTypeMap>> = Exclude<OptionLayout<TypeMap, T>, {
    optionType: 'orUndefined';
}>;
type ArrayLayout<TypeMap extends AnyTypeMap> = {
    type: 'array';
    inner: GenericLayout<TypeMap>;
    staticLength: number | null;
} & WithChecked<TypeMap>;
type ObjectLayout<TypeMap extends AnyTypeMap> = {
    type: 'object';
    name: string;
    keys: string[];
    entries: Record<string, GenericLayout<TypeMap>>;
} & WithChecked<TypeMap>;
type GenericLayout<TypeMap extends AnyTypeMap> = OptionLayout<TypeMap> | BaseLayout<TypeMap> | ObjectLayout<TypeMap> | ArrayLayout<TypeMap>;
