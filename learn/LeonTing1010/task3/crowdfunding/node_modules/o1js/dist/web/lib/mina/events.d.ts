import { GenericProvableExtended, GenericSignableField } from '../../bindings/lib/generic.js';
export { createEvents, dataAsHash };
type Poseidon<Field> = {
    update(state: Field[], input: Field[]): Field[];
};
declare function createEvents<Field>({ Field, Poseidon, }: {
    Field: GenericSignableField<Field>;
    Poseidon: Poseidon<Field>;
}): {
    Events: {
        toFields: (x: {
            data: Field[][];
            hash: Field;
        }) => Field[];
        toAuxiliary: (x?: {
            data: Field[][];
            hash: Field;
        } | undefined) => any[];
        fromFields: (x: Field[], aux: any[]) => {
            data: Field[][];
            hash: Field;
        };
        sizeInFields(): number;
        check: (x: {
            data: Field[][];
            hash: Field;
        }) => void;
        toValue: (x: {
            data: Field[][];
            hash: Field;
        }) => {
            data: bigint[][];
            hash: bigint;
        };
        fromValue: (x: {
            data: Field[][];
            hash: Field;
        } | {
            data: bigint[][];
            hash: bigint;
        }) => {
            data: Field[][];
            hash: Field;
        };
        toCanonical?: ((x: {
            data: Field[][];
            hash: Field;
        }) => {
            data: Field[][];
            hash: Field;
        }) | undefined;
        toInput: (x: {
            data: Field[][];
            hash: Field;
        }) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: {
            data: Field[][];
            hash: Field;
        }) => string[][];
        fromJSON: (x: string[][]) => {
            data: Field[][];
            hash: Field;
        };
        empty: () => {
            data: Field[][];
            hash: Field;
        };
        pushEvent(events: {
            hash: Field;
            data: Field[][];
        }, event: Field[]): {
            hash: Field;
            data: Field[][];
        };
        fromList(events: Field[][]): {
            hash: Field;
            data: Field[][];
        };
        hash(events: Field[][]): Field;
    };
    Actions: {
        toFields: (x: {
            data: Field[][];
            hash: Field;
        }) => Field[];
        toAuxiliary: (x?: {
            data: Field[][];
            hash: Field;
        } | undefined) => any[];
        fromFields: (x: Field[], aux: any[]) => {
            data: Field[][];
            hash: Field;
        };
        sizeInFields(): number;
        check: (x: {
            data: Field[][];
            hash: Field;
        }) => void;
        toValue: (x: {
            data: Field[][];
            hash: Field;
        }) => {
            data: bigint[][];
            hash: bigint;
        };
        fromValue: (x: {
            data: Field[][];
            hash: Field;
        } | {
            data: bigint[][];
            hash: bigint;
        }) => {
            data: Field[][];
            hash: Field;
        };
        toCanonical?: ((x: {
            data: Field[][];
            hash: Field;
        }) => {
            data: Field[][];
            hash: Field;
        }) | undefined;
        toInput: (x: {
            data: Field[][];
            hash: Field;
        }) => {
            fields?: Field[] | undefined;
            packed?: [Field, number][] | undefined;
        };
        toJSON: (x: {
            data: Field[][];
            hash: Field;
        }) => string[][];
        fromJSON: (x: string[][]) => {
            data: Field[][];
            hash: Field;
        };
        empty: () => {
            data: Field[][];
            hash: Field;
        };
        pushEvent(actions: {
            hash: Field;
            data: Field[][];
        }, event: Field[]): {
            hash: Field;
            data: Field[][];
        };
        fromList(events: Field[][]): {
            hash: Field;
            data: Field[][];
        };
        hash(events: Field[][]): Field;
        emptyActionState(): Field;
        updateSequenceState(state: Field, sequenceEventsHash: Field): Field;
    };
};
declare function dataAsHash<T, V, J, Field>({ empty, toValue, fromValue, toJSON, fromJSON, Field, }: {
    empty: () => {
        data: T;
        hash: Field;
    };
    toValue: (value: T) => V;
    fromValue: (value: V | T) => T;
    toJSON: (value: T) => J;
    fromJSON: (json: J) => {
        data: T;
        hash: Field;
    };
    Field: GenericSignableField<Field>;
}): GenericProvableExtended<{
    data: T;
    hash: Field;
}, {
    data: V;
    hash: bigint;
}, J, Field>;
