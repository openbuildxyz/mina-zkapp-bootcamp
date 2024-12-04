import { VarFieldVar } from './fieldvar.js';
import type { VarField } from '../field.js';
import { TupleN } from '../../util/types.js';
export { createVarField, exists, existsAsync, existsOne };
/**
 * Witness `size` field element variables by passing a callback that returns `size` bigints.
 *
 * Note: this is called "exists" because in a proof, you use it like this:
 * > "I prove that there exists x, such that (some statement)"
 */
declare function exists<N extends number, C extends () => TupleN<bigint, N>>(size: N, compute: C): TupleN<VarField, N>;
/**
 * Variant of {@link exists} that witnesses 1 field element.
 */
declare function existsOne(compute: () => bigint): VarField;
/**
 * Async variant of {@link exists}, which allows an async callback.
 */
declare function existsAsync<N extends number, C extends () => Promise<TupleN<bigint, N>>>(size: N, compute: C): Promise<TupleN<VarField, N>>;
declare function createVarField(x: VarFieldVar): VarField;
