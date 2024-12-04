import { Field, Bool, UInt32, UInt64, Sign } from '../../mina-signer/src/field-bigint.js';
import { PublicKey } from '../../mina-signer/src/curve-bigint.js';
export { PublicKey, Field, Bool, AuthRequired, UInt64, UInt32, Sign, BalanceChange, TokenId, MayUseToken, };
export { Events, Actions, ZkappUri, TokenSymbol, ActionState, VerificationKeyHash, ReceiptChainHash, StateHash, TransactionVersion, };
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
type MayUseToken = {
    parentsOwnToken: Bool;
    inheritFromParent: Bool;
};
declare const TokenId: Omit<{
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
}, "toJSON" | "fromJSON"> & {
    empty: () => bigint;
    toJSON(x: bigint): string;
    fromJSON(x: string): bigint;
}, StateHash: Omit<{
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
    empty: () => bigint;
}, "toJSON" | "fromJSON"> & {
    empty: () => bigint;
    toJSON(x: bigint): string;
    fromJSON(x: string): bigint;
}, TokenSymbol: Omit<{
    toInput: (x: {
        field: bigint;
        symbol: string;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        field: bigint;
        symbol: string;
    }) => {
        field: string;
        symbol: string;
    };
    fromJSON: (x: {
        field: string;
        symbol: string;
    }) => {
        field: bigint;
        symbol: string;
    };
    empty: () => {
        field: bigint;
        symbol: string;
    };
}, "toJSON" | "fromJSON"> & {
    toInput({ field }: {
        symbol: string;
        field: bigint;
    }): import("../lib/generic.js").GenericHashInput<bigint>;
    toJSON({ symbol }: {
        symbol: string;
        field: bigint;
    }): string;
    fromJSON(symbol: string): {
        symbol: string;
        field: bigint;
    };
}, AuthRequired: Omit<{
    toInput: (x: {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
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
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    };
    empty: () => {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    };
}, "toJSON" | "fromJSON"> & {
    empty(): {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    };
    toJSON(x: {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    }): import("./transaction-leaves-json.js").AuthRequired;
    fromJSON(json: import("./transaction-leaves-json.js").AuthRequired): {
        constant: boolean;
        signatureNecessary: boolean;
        signatureSufficient: boolean;
    };
}, ZkappUri: import("../lib/generic.js").GenericProvableExtended<{
    data: string;
    hash: bigint;
}, {
    data: string;
    hash: bigint;
}, string, bigint>, MayUseToken: {
    toInput: (x: {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    }) => {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
    fromJSON: (x: {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    }) => {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
    empty: () => {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
};
type Event = Field[];
type Events = {
    hash: Field;
    data: Event[];
};
type Actions = Events;
declare const Events: {
    toFields: (x: {
        data: bigint[][];
        hash: bigint;
    }) => bigint[];
    toAuxiliary: (x?: {
        data: bigint[][];
        hash: bigint;
    } | undefined) => any[];
    fromFields: (x: bigint[], aux: any[]) => {
        data: bigint[][];
        hash: bigint;
    };
    sizeInFields(): number;
    check: (x: {
        data: bigint[][];
        hash: bigint;
    }) => void;
    toValue: (x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: bigint[][];
        hash: bigint;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    toCanonical?: ((x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    }) | undefined;
    toInput: (x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        data: bigint[][];
        hash: bigint;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: bigint[][];
        hash: bigint;
    };
    empty: () => {
        data: bigint[][];
        hash: bigint;
    };
    pushEvent(events: {
        hash: bigint;
        data: bigint[][];
    }, event: bigint[]): {
        hash: bigint;
        data: bigint[][];
    };
    fromList(events: bigint[][]): {
        hash: bigint;
        data: bigint[][];
    };
    hash(events: bigint[][]): bigint;
}, Actions: {
    toFields: (x: {
        data: bigint[][];
        hash: bigint;
    }) => bigint[];
    toAuxiliary: (x?: {
        data: bigint[][];
        hash: bigint;
    } | undefined) => any[];
    fromFields: (x: bigint[], aux: any[]) => {
        data: bigint[][];
        hash: bigint;
    };
    sizeInFields(): number;
    check: (x: {
        data: bigint[][];
        hash: bigint;
    }) => void;
    toValue: (x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: bigint[][];
        hash: bigint;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    toCanonical?: ((x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: bigint[][];
        hash: bigint;
    }) | undefined;
    toInput: (x: {
        data: bigint[][];
        hash: bigint;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        data: bigint[][];
        hash: bigint;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: bigint[][];
        hash: bigint;
    };
    empty: () => {
        data: bigint[][];
        hash: bigint;
    };
    pushEvent(actions: {
        hash: bigint;
        data: bigint[][];
    }, event: bigint[]): {
        hash: bigint;
        data: bigint[][];
    };
    fromList(events: bigint[][]): {
        hash: bigint;
        data: bigint[][];
    };
    hash(events: bigint[][]): bigint;
    emptyActionState(): bigint;
    updateSequenceState(state: bigint, sequenceEventsHash: bigint): bigint;
};
type ActionState = Field;
declare const ActionState: {
    empty: () => bigint;
    toBigint: (x: bigint) => bigint;
    modulus: bigint;
    sizeInBits: number;
    t: bigint;
    M: bigint;
    twoadicRoot: bigint;
    mod(x: bigint): bigint;
    add(x: bigint, y: bigint): bigint;
    not(x: bigint, bits: number): bigint;
    negate(x: bigint): bigint;
    sub(x: bigint, y: bigint): bigint;
    mul(x: bigint, y: bigint): bigint;
    inverse: (x: bigint) => bigint | undefined;
    div(x: bigint, y: bigint): bigint | undefined;
    square(x: bigint): bigint;
    isSquare(x: bigint): boolean;
    sqrt(x: bigint): bigint | undefined;
    power(x: bigint, n: bigint): bigint;
    dot(x: bigint[], y: bigint[]): bigint;
    equal(x: bigint, y: bigint): boolean;
    isEven(x: bigint): boolean;
    random(): bigint;
    fromNumber(x: number): bigint;
    fromBigint(x: bigint): bigint;
    rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
    leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
    rightShift(x: bigint, bits: number): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("../crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
};
type VerificationKeyHash = Field;
declare const VerificationKeyHash: {
    empty: () => bigint;
    toBigint: (x: bigint) => bigint;
    modulus: bigint;
    sizeInBits: number;
    t: bigint;
    M: bigint;
    twoadicRoot: bigint;
    mod(x: bigint): bigint;
    add(x: bigint, y: bigint): bigint;
    not(x: bigint, bits: number): bigint;
    negate(x: bigint): bigint;
    sub(x: bigint, y: bigint): bigint;
    mul(x: bigint, y: bigint): bigint;
    inverse: (x: bigint) => bigint | undefined;
    div(x: bigint, y: bigint): bigint | undefined;
    square(x: bigint): bigint;
    isSquare(x: bigint): boolean;
    sqrt(x: bigint): bigint | undefined;
    power(x: bigint, n: bigint): bigint;
    dot(x: bigint[], y: bigint[]): bigint;
    equal(x: bigint, y: bigint): boolean;
    isEven(x: bigint): boolean;
    random(): bigint;
    fromNumber(x: number): bigint;
    fromBigint(x: bigint): bigint;
    rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
    leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
    rightShift(x: bigint, bits: number): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("../crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
};
type ReceiptChainHash = Field;
declare const ReceiptChainHash: {
    empty: () => bigint;
    toBigint: (x: bigint) => bigint;
    modulus: bigint;
    sizeInBits: number;
    t: bigint;
    M: bigint;
    twoadicRoot: bigint;
    mod(x: bigint): bigint;
    add(x: bigint, y: bigint): bigint;
    not(x: bigint, bits: number): bigint;
    negate(x: bigint): bigint;
    sub(x: bigint, y: bigint): bigint;
    mul(x: bigint, y: bigint): bigint;
    inverse: (x: bigint) => bigint | undefined;
    div(x: bigint, y: bigint): bigint | undefined;
    square(x: bigint): bigint;
    isSquare(x: bigint): boolean;
    sqrt(x: bigint): bigint | undefined;
    power(x: bigint, n: bigint): bigint;
    dot(x: bigint[], y: bigint[]): bigint;
    equal(x: bigint, y: bigint): boolean;
    isEven(x: bigint): boolean;
    random(): bigint;
    fromNumber(x: number): bigint;
    fromBigint(x: bigint): bigint;
    rot(x: bigint, bits: bigint, direction?: "left" | "right", maxBits?: bigint): bigint;
    leftShift(x: bigint, bits: number, maxBitSize?: number): bigint;
    rightShift(x: bigint, bits: number): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("../crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    toInput: (x: bigint) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
};
type TransactionVersion = Field;
declare const TransactionVersion: {
    empty: () => bigint;
    toInput(x: bigint): import("../../mina-signer/src/derivers-bigint.js").HashInput;
    maxValue: bigint;
    random(): bigint;
    toBytes(t: bigint): number[];
    readBytes<N extends number>(bytes: number[], offset: import("../crypto/non-negative.js").NonNegativeInteger<N>): [value: bigint, offset: number];
    fromBytes(bytes: number[]): bigint;
    toBits(t: bigint): boolean[];
    fromBits(bits: boolean[]): bigint;
    sizeInBytes: number;
    sizeInBits: number;
    toJSON: (x: bigint) => string;
    fromJSON: (x: string) => bigint;
};
type BalanceChange = {
    magnitude: UInt64;
    sgn: Sign;
};
declare const BalanceChange: {
    toInput: (x: {
        magnitude: bigint;
        sgn: Sign;
    }) => {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    toJSON: (x: {
        magnitude: bigint;
        sgn: Sign;
    }) => {
        magnitude: string;
        sgn: "Positive" | "Negative";
    };
    fromJSON: (x: {
        magnitude: string;
        sgn: "Positive" | "Negative";
    }) => {
        magnitude: bigint;
        sgn: Sign;
    };
    empty: () => {
        magnitude: bigint;
        sgn: Sign;
    };
};
