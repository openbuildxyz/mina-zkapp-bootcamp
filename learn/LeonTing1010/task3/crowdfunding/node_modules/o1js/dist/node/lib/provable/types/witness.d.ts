import type { Field } from '../field.js';
import type { InferProvable } from './struct.js';
import { ProvableType, ToProvable } from './provable-intf.js';
import { From } from '../../../bindings/lib/provable-generic.js';
import { TupleN } from '../../util/types.js';
export { witness, witnessAsync, witnessFields };
declare function witness<A extends ProvableType<any, any>, T extends From<ToProvable<A>> = From<ToProvable<A>>>(type: A, compute: () => T): InferProvable<ToProvable<A>>;
declare function witnessAsync<A extends ProvableType<any, any>, T extends From<ToProvable<A>> = From<ToProvable<A>>>(type: A, compute: () => Promise<T>): Promise<T>;
declare function witnessFields<N extends number, C extends () => TupleN<bigint | Field, N>>(size: N, compute: C): TupleN<Field, N>;
