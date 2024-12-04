import { Field } from '../wrapped.js';
import { provableTuple, HashInput, NonMethods } from './provable-derivers.js';
import type { InferJson, InferProvable, InferredProvable, IsPure } from './provable-derivers.js';
import { Provable } from '../provable.js';
import { ProvablePure, ProvableType } from './provable-intf.js';
import { From, InferValue } from '../../../bindings/lib/provable-generic.js';
export { ProvableExtended, ProvablePureExtended, Struct, FlexibleProvable, FlexibleProvablePure, FlexibleProvableType, };
export { provableTuple, AnyConstructor, cloneCircuitValue, circuitValueEquals, InferProvable, HashInput, InferJson, InferredProvable, StructNoJson, };
type ProvableExtension<T, TJson = any> = {
    toInput: (x: T) => {
        fields?: Field[];
        packed?: [Field, number][];
    };
    toJSON: (x: T) => TJson;
    fromJSON: (x: TJson) => T;
    empty: () => T;
};
type ProvableExtended<T, TValue = any, TJson = any> = Provable<T, TValue> & ProvableExtension<T, TJson>;
type ProvablePureExtended<T, TValue = any, TJson = any> = ProvablePure<T, TValue> & ProvableExtension<T, TJson>;
type Struct<T> = ProvableExtended<NonMethods<T>> & Constructor<T> & {
    _isStruct: true;
};
type StructPure<T> = ProvablePureExtended<NonMethods<T>> & Constructor<T> & {
    _isStruct: true;
};
type FlexibleProvable<T> = Provable<T> | Struct<T>;
type FlexibleProvablePure<T> = ProvablePure<T> | StructPure<T>;
type FlexibleProvableType<T> = ProvableType<T> | Struct<T>;
type Constructor<T> = new (...args: any) => T;
type AnyConstructor = Constructor<any>;
/**
 * `Struct` lets you declare composite types for use in o1js circuits.
 *
 * These composite types can be passed in as arguments to smart contract methods, used for on-chain state variables
 * or as event / action types.
 *
 * Here's an example of creating a "Voter" struct, which holds a public key and a collection of votes on 3 different proposals:
 * ```ts
 * let Vote = { hasVoted: Bool, inFavor: Bool };
 *
 * class Voter extends Struct({
 *   publicKey: PublicKey,
 *   votes: [Vote, Vote, Vote]
 * }) {}
 *
 * // use Voter as SmartContract input:
 * class VoterContract extends SmartContract {
 *   \@method register(voter: Voter) {
 *     // ...
 *   }
 * }
 * ```
 * In this example, there are no instance methods on the class. This makes `Voter` type-compatible with an anonymous object of the form
 * `{ publicKey: PublicKey, votes: Vote[] }`.
 * This mean you don't have to create instances by using `new Voter(...)`, you can operate with plain objects:
 * ```ts
 * voterContract.register({ publicKey, votes });
 * ```
 *
 * On the other hand, you can also add your own methods:
 * ```ts
 * class Voter extends Struct({
 *   publicKey: PublicKey,
 *   votes: [Vote, Vote, Vote]
 * }) {
 *   vote(index: number, inFavor: Bool) {
 *     let vote = this.votes[i];
 *     vote.hasVoted = Bool(true);
 *     vote.inFavor = inFavor;
 *   }
 * }
 * ```
 *
 * In this case, you'll need the constructor to create instances of `Voter`. It always takes as input the plain object:
 * ```ts
 * let emptyVote = { hasVoted: Bool(false), inFavor: Bool(false) };
 * let voter = new Voter({ publicKey, votes: Array(3).fill(emptyVote) });
 * voter.vote(1, Bool(true));
 * ```
 *
 * In addition to creating types composed of Field elements, you can also include auxiliary data which does not become part of the proof.
 * This, for example, allows you to re-use the same type outside o1js methods, where you might want to store additional metadata.
 *
 * To declare non-proof values of type `string`, `number`, etc, you can use the built-in objects `String`, `Number`, etc.
 * Here's how we could add the voter's name (a string) as auxiliary data:
 * ```ts
 * class Voter extends Struct({
 *   publicKey: PublicKey,
 *   votes: [Vote, Vote, Vote],
 *   fullName: String
 * }) {}
 * ```
 *
 * Again, it's important to note that this doesn't enable you to prove anything about the `fullName` string.
 * From the circuit point of view, it simply doesn't exist!
 *
 * @note Ensure you do not use or extend `Struct` as a type directly. Instead, always call it as a function to construct a type. `Struct` is not a valid provable type itself, types created with `Struct(...)` are.
 *
 * @param type Object specifying the layout of the `Struct`
 * @param options Advanced option which allows you to force a certain order of object keys
 * @returns Class which you can extend
 */
declare function Struct<A, T extends InferProvable<A> = InferProvable<A>, V extends InferValue<A> = InferValue<A>, J extends InferJson<A> = InferJson<A>, Pure extends boolean = IsPure<A>>(type: A): (new (value: T) => T) & {
    _isStruct: true;
} & (Pure extends true ? ProvablePure<T, V> : Provable<T, V>) & {
    fromValue: (value: From<A>) => T;
    toInput: (x: T) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    toJSON: (x: T) => J;
    fromJSON: (x: J) => T;
    empty: () => T;
};
declare function StructNoJson<A, T extends InferProvable<A> = InferProvable<A>, Pure extends boolean = IsPure<A>>(type: A): (new (value: T) => T) & {
    _isStruct: true;
} & (Pure extends true ? ProvablePure<T> : Provable<T>) & {
    toInput: (x: T) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    empty: () => T;
};
declare function cloneCircuitValue<T>(obj: T): T;
declare function circuitValueEquals<T>(a: T, b: T): boolean;
