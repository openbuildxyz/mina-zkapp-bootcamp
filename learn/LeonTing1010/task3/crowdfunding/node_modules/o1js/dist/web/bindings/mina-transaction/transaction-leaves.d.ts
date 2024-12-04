import { Field, Bool } from '../../lib/provable/wrapped.js';
import { UInt32, UInt64, Sign, Int64 } from '../../lib/provable/int.js';
import { PublicKey } from '../../lib/provable/crypto/signature.js';
export { PublicKey, Field, Bool, AuthRequired, UInt64, UInt32, Sign, BalanceChange, TokenId, };
export { Events, Actions, ZkappUri, TokenSymbol, ActionState, VerificationKeyHash, ReceiptChainHash, StateHash, TransactionVersion, MayUseToken, };
type AuthRequired = {
    constant: Bool;
    signatureNecessary: Bool;
    signatureSufficient: Bool;
};
type TokenId = Field;
type StateHash = Field;
type TokenSymbol = {
    symbol: string;
    field: Field;
};
type ZkappUri = {
    data: string;
    hash: Field;
};
declare const TokenId: Omit<import("../lib/generic.js").GenericProvableExtended<import("../../lib/provable/field.js").Field, bigint, string, import("../../lib/provable/field.js").Field>, "toJSON" | "fromJSON"> & {
    empty: () => import("../../lib/provable/field.js").Field;
    toJSON(x: import("../../lib/provable/field.js").Field): string;
    fromJSON(x: string): import("../../lib/provable/field.js").Field;
}, StateHash: Omit<import("../lib/generic.js").GenericProvableExtended<import("../../lib/provable/field.js").Field, bigint, string, import("../../lib/provable/field.js").Field>, "toJSON" | "fromJSON"> & {
    empty: () => import("../../lib/provable/field.js").Field;
    toJSON(x: import("../../lib/provable/field.js").Field): string;
    fromJSON(x: string): import("../../lib/provable/field.js").Field;
}, TokenSymbol: Omit<import("../lib/generic.js").GenericProvableExtended<{
    field: import("../../lib/provable/field.js").Field;
    symbol: string;
}, {
    field: bigint;
    symbol: string;
}, {
    field: string;
    symbol: string;
}, import("../../lib/provable/field.js").Field>, "toJSON" | "fromJSON"> & {
    toInput({ field }: {
        symbol: string;
        field: import("../../lib/provable/field.js").Field;
    }): import("../lib/generic.js").GenericHashInput<import("../../lib/provable/field.js").Field>;
    toJSON({ symbol }: {
        symbol: string;
        field: import("../../lib/provable/field.js").Field;
    }): string;
    fromJSON(symbol: string): {
        symbol: string;
        field: import("../../lib/provable/field.js").Field;
    };
}, AuthRequired: Omit<import("../lib/generic.js").GenericProvableExtended<{
    constant: import("../../lib/provable/bool.js").Bool;
    signatureNecessary: import("../../lib/provable/bool.js").Bool;
    signatureSufficient: import("../../lib/provable/bool.js").Bool;
}, {
    constant: boolean;
    signatureNecessary: boolean;
    signatureSufficient: boolean;
}, {
    constant: boolean;
    signatureNecessary: boolean;
    signatureSufficient: boolean;
}, import("../../lib/provable/field.js").Field>, "toJSON" | "fromJSON"> & {
    empty(): {
        constant: import("../../lib/provable/bool.js").Bool;
        signatureNecessary: import("../../lib/provable/bool.js").Bool;
        signatureSufficient: import("../../lib/provable/bool.js").Bool;
    };
    toJSON(x: {
        constant: import("../../lib/provable/bool.js").Bool;
        signatureNecessary: import("../../lib/provable/bool.js").Bool;
        signatureSufficient: import("../../lib/provable/bool.js").Bool;
    }): import("./transaction-leaves-json.js").AuthRequired;
    fromJSON(json: import("./transaction-leaves-json.js").AuthRequired): {
        constant: import("../../lib/provable/bool.js").Bool;
        signatureNecessary: import("../../lib/provable/bool.js").Bool;
        signatureSufficient: import("../../lib/provable/bool.js").Bool;
    };
}, ZkappUri: import("../lib/generic.js").GenericProvableExtended<{
    data: string;
    hash: import("../../lib/provable/field.js").Field;
}, {
    data: string;
    hash: bigint;
}, string, import("../../lib/provable/field.js").Field>;
type Event = Field[];
type Events = {
    hash: Field;
    data: Event[];
};
type Actions = Events;
declare const Events: {
    toFields: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    } | undefined) => any[];
    fromFields: (x: import("../../lib/provable/field.js").Field[], aux: any[]) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    sizeInFields(): number;
    check: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => void;
    toValue: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    toCanonical?: ((x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) | undefined;
    toInput: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    empty: () => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    pushEvent(events: {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    }, event: import("../../lib/provable/field.js").Field[]): {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    };
    fromList(events: import("../../lib/provable/field.js").Field[][]): {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    };
    hash(events: import("../../lib/provable/field.js").Field[][]): import("../../lib/provable/field.js").Field;
}, Actions: {
    toFields: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    } | undefined) => any[];
    fromFields: (x: import("../../lib/provable/field.js").Field[], aux: any[]) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    sizeInFields(): number;
    check: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => void;
    toValue: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    toCanonical?: ((x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) | undefined;
    toInput: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    empty: () => {
        data: import("../../lib/provable/field.js").Field[][];
        hash: import("../../lib/provable/field.js").Field;
    };
    pushEvent(actions: {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    }, event: import("../../lib/provable/field.js").Field[]): {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    };
    fromList(events: import("../../lib/provable/field.js").Field[][]): {
        hash: import("../../lib/provable/field.js").Field;
        data: import("../../lib/provable/field.js").Field[][];
    };
    hash(events: import("../../lib/provable/field.js").Field[][]): import("../../lib/provable/field.js").Field;
    emptyActionState(): import("../../lib/provable/field.js").Field;
    updateSequenceState(state: import("../../lib/provable/field.js").Field, sequenceEventsHash: import("../../lib/provable/field.js").Field): import("../../lib/provable/field.js").Field;
};
type ActionState = Field;
declare const ActionState: {
    empty: () => import("../../lib/provable/field.js").Field;
    toFields: (x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: import("../../lib/provable/field.js").Field | undefined) => any[];
    sizeInFields: () => number;
    check: (x: import("../../lib/provable/field.js").Field) => void;
    toValue: (x: import("../../lib/provable/field.js").Field) => bigint;
    fromValue: (x: bigint | import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field;
    toCanonical?: ((x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field) | undefined;
    fromFields: (x: import("../../lib/provable/field.js").Field[]) => import("../../lib/provable/field.js").Field;
    toInput: (x: import("../../lib/provable/field.js").Field) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: import("../../lib/provable/field.js").Field) => string;
    fromJSON: (x: string) => import("../../lib/provable/field.js").Field;
};
type VerificationKeyHash = Field;
declare const VerificationKeyHash: {
    empty: () => import("../../lib/provable/field.js").Field;
    toFields: (x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: import("../../lib/provable/field.js").Field | undefined) => any[];
    sizeInFields: () => number;
    check: (x: import("../../lib/provable/field.js").Field) => void;
    toValue: (x: import("../../lib/provable/field.js").Field) => bigint;
    fromValue: (x: bigint | import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field;
    toCanonical?: ((x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field) | undefined;
    fromFields: (x: import("../../lib/provable/field.js").Field[]) => import("../../lib/provable/field.js").Field;
    toInput: (x: import("../../lib/provable/field.js").Field) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: import("../../lib/provable/field.js").Field) => string;
    fromJSON: (x: string) => import("../../lib/provable/field.js").Field;
};
type ReceiptChainHash = Field;
declare const ReceiptChainHash: {
    empty: () => import("../../lib/provable/field.js").Field;
    toFields: (x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: import("../../lib/provable/field.js").Field | undefined) => any[];
    sizeInFields: () => number;
    check: (x: import("../../lib/provable/field.js").Field) => void;
    toValue: (x: import("../../lib/provable/field.js").Field) => bigint;
    fromValue: (x: bigint | import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field;
    toCanonical?: ((x: import("../../lib/provable/field.js").Field) => import("../../lib/provable/field.js").Field) | undefined;
    fromFields: (x: import("../../lib/provable/field.js").Field[]) => import("../../lib/provable/field.js").Field;
    toInput: (x: import("../../lib/provable/field.js").Field) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: import("../../lib/provable/field.js").Field) => string;
    fromJSON: (x: string) => import("../../lib/provable/field.js").Field;
};
type TransactionVersion = Field;
declare const TransactionVersion: {
    empty: () => UInt32;
    toFields: (x: UInt32) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: UInt32 | undefined) => any[];
    sizeInFields: () => number;
    check: (x: UInt32) => void;
    toValue: (x: UInt32) => bigint;
    fromValue: (x: bigint | UInt32) => UInt32;
    toCanonical?: ((x: UInt32) => UInt32) | undefined;
    fromFields: (x: import("../../lib/provable/field.js").Field[]) => UInt32;
    toInput: (x: UInt32) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: UInt32) => string;
    fromJSON: (x: string) => UInt32;
};
type BalanceChange = Int64;
declare const BalanceChange: typeof Int64;
type MayUseToken = {
    parentsOwnToken: Bool;
    inheritFromParent: Bool;
};
declare const MayUseToken: {
    check: ({ parentsOwnToken, inheritFromParent }: MayUseToken) => void;
    toFields: (x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) => import("../../lib/provable/field.js").Field[];
    toAuxiliary: (x?: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    } | undefined) => any[];
    sizeInFields: () => number;
    toValue: (x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) => {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
    fromValue: (x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    } | {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    }) => {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    };
    toCanonical?: ((x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) => {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) | undefined;
    fromFields: (x: import("../../lib/provable/field.js").Field[]) => {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    };
    toInput: (x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) => {
        fields?: import("../../lib/provable/field.js").Field[] | undefined;
        packed?: [import("../../lib/provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    }) => {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
    fromJSON: (x: {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    }) => {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    };
    empty: () => {
        parentsOwnToken: import("../../lib/provable/bool.js").Bool;
        inheritFromParent: import("../../lib/provable/bool.js").Bool;
    };
};
