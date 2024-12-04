import { PrivateKey } from './curve-bigint.js';
import { Field } from './field-bigint.js';
import { Nullifier } from './types.js';
export { createNullifier };
/**
 * PLUME: An ECDSA Nullifier Scheme for Unique
 * Pseudonymity within Zero Knowledge Proofs
 * https://eprint.iacr.org/2022/1255.pdf chapter 3 page 14
 */
declare function createNullifier(message: Field[], sk: PrivateKey): Nullifier;
