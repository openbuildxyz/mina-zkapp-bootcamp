import { Bool, Field } from './wrapped.js';
import { HashInput } from './crypto/poseidon.js';
export { Character, CircuitString };
declare const Character_base: (new (value: {
    value: import("./field.js").Field;
}) => {
    value: import("./field.js").Field;
}) & {
    _isStruct: true;
} & Omit<import("./types/provable-intf.js").Provable<{
    value: import("./field.js").Field;
}, {
    value: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("./field.js").Field[]) => {
        value: import("./field.js").Field;
    };
} & {
    fromValue: (value: {
        value: string | number | bigint | import("./field.js").Field;
    }) => {
        value: import("./field.js").Field;
    };
    toInput: (x: {
        value: import("./field.js").Field;
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        value: import("./field.js").Field;
    }) => {
        value: string;
    };
    fromJSON: (x: {
        value: string;
    }) => {
        value: import("./field.js").Field;
    };
    empty: () => {
        value: import("./field.js").Field;
    };
};
declare class Character extends Character_base {
    constructor(value: Field | number);
    isNull(): Bool;
    toField(): Field;
    toString(): string;
    static fromString(str: string): Character;
    static check(c: {
        value: Field;
    }): void;
    static toInput(c: {
        value: Field;
    }): HashInput;
}
declare const CircuitString_base: (new (value: {
    values: Character[];
}) => {
    values: Character[];
}) & {
    _isStruct: true;
} & Omit<import("./types/provable-intf.js").Provable<{
    values: Character[];
}, string>, "fromFields"> & {
    fromFields: (fields: import("./field.js").Field[]) => {
        values: Character[];
    };
} & {
    fromValue: (value: string | {
        values: Character[];
    }) => {
        values: Character[];
    };
    toInput: (x: {
        values: Character[];
    }) => {
        fields?: import("./field.js").Field[] | undefined;
        packed?: [import("./field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        values: Character[];
    }) => {
        values: {
            value: string;
        }[];
    };
    fromJSON: (x: {
        values: {
            value: string;
        }[];
    }) => {
        values: Character[];
    };
    empty: () => {
        values: Character[];
    };
};
declare class CircuitString extends CircuitString_base {
    static maxLength: number;
    static fromCharacters(chars: Character[]): CircuitString;
    maxLength(): number;
    computeLengthAndMask(): {
        mask: import("./bool.js").Bool[];
        length: import("./field.js").Field;
    };
    lengthMask(): Bool[];
    length(): Field;
    /**
     * returns true if `this` has the same value as `other`
     */
    equals(other: CircuitString): import("./bool.js").Bool;
    /**
     * appends another string to this one, returns the result and proves that it fits
     * within the `maxLength` of this string (the other string can have a different maxLength)
     */
    append(str: CircuitString): CircuitString;
    hash(): Field;
    substring(start: number, end: number): CircuitString;
    toString(): string;
    static fromString(str: string): CircuitString;
}
