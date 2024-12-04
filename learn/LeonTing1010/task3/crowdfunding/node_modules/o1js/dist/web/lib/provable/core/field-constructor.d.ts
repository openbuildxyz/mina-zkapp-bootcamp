/**
 * Stub module to break dependency cycle between Field and Bool classes and
 * core gadgets which they depend on but which need to create Fields and Bools,
 * or check if a value is a Field or a Bool.
 */
import type { Field } from '../field.js';
import type { Bool } from '../bool.js';
import type { FieldVar, FieldConst } from './fieldvar.js';
export { createField, createBool, createBoolUnsafe, isField, isBool, getField, getBool, setFieldConstructor, setBoolConstructor, };
declare function setFieldConstructor(constructor: typeof Field): void;
declare function setBoolConstructor(constructor: typeof Bool): void;
declare function createField(value: string | number | bigint | Field | FieldVar | FieldConst): Field;
declare function createBool(value: boolean | Bool): Bool;
declare function createBoolUnsafe(value: Field): Bool;
declare function isField(x: unknown): x is Field;
declare function isBool(x: unknown): x is Bool;
declare function getField(): typeof Field;
declare function getBool(): typeof Bool;
