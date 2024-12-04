import { Field } from '../wrapped.js';
export { divMod32, addMod32, divMod64, addMod64 };
declare function divMod32(n: Field, nBits?: number): {
    remainder: import("../field.js").Field;
    quotient: import("../field.js").Field;
};
declare function addMod32(x: Field, y: Field): import("../field.js").Field;
declare function divMod64(n: Field, nBits?: number): {
    remainder: import("../field.js").Field;
    quotient: import("../field.js").Field;
};
declare function addMod64(x: Field, y: Field): import("../field.js").Field;
