import { GenericBool, GenericField, GenericHashInput, GenericSignableBool, GenericSignableField } from '../lib/generic.js';
import * as Json from './gen/transaction-json.js';
import { HashHelpers } from '../../lib/provable/crypto/hash-generic.js';
export { derivedLeafTypes, derivedLeafTypesSignable, tokenSymbolLength };
declare const tokenSymbolLength = 6;
declare function derivedLeafTypes<Field, Bool>({ Field, Bool, HashHelpers, packToFields, }: {
    Field: GenericField<Field>;
    Bool: GenericBool<Field, Bool>;
    HashHelpers: HashHelpers<Field>;
    packToFields: (input: GenericHashInput<Field>) => Field[];
}): {
    TokenId: Omit<import("../lib/generic.js").GenericProvableExtended<Field, bigint, string, Field>, "toJSON" | "fromJSON"> & {
        empty: () => Field;
        toJSON(x: Field): string;
        fromJSON(x: string): Field;
    };
    StateHash: Omit<import("../lib/generic.js").GenericProvableExtended<Field, bigint, string, Field>, "toJSON" | "fromJSON"> & {
        empty: () => Field;
        toJSON(x: Field): string;
        fromJSON(x: string): Field;
    };
    TokenSymbol: Omit<import("../lib/generic.js").GenericProvableExtended<{
        field: Field;
        symbol: string;
    }, {
        field: bigint;
        symbol: string;
    }, {
        field: string;
        symbol: string;
    }, Field>, "toJSON" | "fromJSON"> & {
        toInput({ field }: TokenSymbol<Field>): GenericHashInput<Field>;
        toJSON({ symbol }: TokenSymbol<Field>): string;
        fromJSON(symbol: string): TokenSymbol<Field>;
    };
    AuthRequired: Omit<import("../lib/generic.js").GenericProvableExtended<{
        constant: Bool;
        signatureNecessary: Bool;
        signatureSufficient: Bool;
    }, {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    }, {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    }, Field>, "toJSON" | "fromJSON"> & {
        empty(): AuthRequired<Bool>;
        toJSON(x: AuthRequired<Bool>): Json.AuthRequired;
        fromJSON(json: Json.AuthRequired): AuthRequired<Bool>;
    };
    ZkappUri: import("../lib/generic.js").GenericProvableExtended<{
        data: string;
        hash: Field;
    }, {
        data: string;
        hash: bigint;
    }, string, Field>;
};
declare function derivedLeafTypesSignable<Field, Bool>({ Field, Bool, HashHelpers, packToFields, }: {
    Field: GenericSignableField<Field>;
    Bool: GenericSignableBool<Field, Bool>;
    HashHelpers: HashHelpers<Field>;
    packToFields: (input: GenericHashInput<Field>) => Field[];
}): {
    TokenId: Omit<{
        toInput: (x: Field) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: Field) => string;
        fromJSON: (x: string) => Field;
        empty: () => Field;
    }, "toJSON" | "fromJSON"> & {
        empty: () => Field;
        toJSON(x: Field): string;
        fromJSON(x: string): Field;
    };
    StateHash: Omit<{
        toInput: (x: Field) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: Field) => string;
        fromJSON: (x: string) => Field;
        empty: () => Field;
    }, "toJSON" | "fromJSON"> & {
        empty: () => Field;
        toJSON(x: Field): string;
        fromJSON(x: string): Field;
    };
    TokenSymbol: Omit<{
        toInput: (x: {
            field: Field;
            symbol: string;
        }) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: {
            field: Field;
            symbol: string;
        }) => {
            field: string;
            symbol: string;
        };
        fromJSON: (x: {
            field: string;
            symbol: string;
        }) => {
            field: Field;
            symbol: string;
        };
        empty: () => {
            field: Field;
            symbol: string;
        };
    }, "toJSON" | "fromJSON"> & {
        toInput({ field }: TokenSymbol<Field>): GenericHashInput<Field>;
        toJSON({ symbol }: TokenSymbol<Field>): string;
        fromJSON(symbol: string): TokenSymbol<Field>;
    };
    AuthRequired: Omit<{
        toInput: (x: {
            constant: Bool;
            signatureNecessary: Bool;
            signatureSufficient: Bool;
        }) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: {
            constant: Bool;
            signatureNecessary: Bool;
            signatureSufficient: Bool;
        }) => {
            constant: boolean;
            signatureNecessary: boolean;
            signatureSufficient: boolean;
        };
        fromJSON: (x: {
            constant: boolean;
            signatureNecessary: boolean;
            signatureSufficient: boolean;
        }) => {
            constant: Bool;
            signatureNecessary: Bool;
            signatureSufficient: Bool;
        };
        empty: () => {
            constant: Bool;
            signatureNecessary: Bool;
            signatureSufficient: Bool;
        };
    }, "toJSON" | "fromJSON"> & {
        empty(): AuthRequired<Bool>;
        toJSON(x: AuthRequired<Bool>): Json.AuthRequired;
        fromJSON(json: Json.AuthRequired): AuthRequired<Bool>;
    };
    MayUseToken: {
        toInput: (x: {
            parentsOwnToken: Bool;
            inheritFromParent: Bool;
        }) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: {
            parentsOwnToken: Bool;
            inheritFromParent: Bool;
        }) => {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
        fromJSON: (x: {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        }) => {
            parentsOwnToken: Bool;
            inheritFromParent: Bool;
        };
        empty: () => {
            parentsOwnToken: Bool;
            inheritFromParent: Bool;
        };
    };
    Bool: GenericSignableBool<Field, Bool>;
    ZkappUri: import("../lib/generic.js").GenericProvableExtended<{
        data: string;
        hash: Field;
    }, {
        data: string;
        hash: bigint;
    }, string, Field>;
};
type TokenSymbol<Field> = {
    symbol: string;
    field: Field;
};
type AuthRequired<Bool> = {
    constant: Bool;
    signatureNecessary: Bool;
    signatureSufficient: Bool;
};
