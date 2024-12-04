import { ProvablePureExtended } from './struct.js';
import type { Field } from '../field.js';
export { modifiedField, fields };
declare function modifiedField(methods: Partial<ProvablePureExtended<Field, string>>): ProvablePureExtended<Field, string>;
declare function fields(length: number): ProvablePureExtended<Field[], bigint[], string[]>;
