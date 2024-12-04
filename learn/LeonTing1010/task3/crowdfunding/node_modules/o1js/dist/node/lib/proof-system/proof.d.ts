import { Pickles } from '../../snarky.js';
import { Bool } from '../provable/wrapped.js';
import type { FlexibleProvablePure, InferProvable } from '../provable/types/struct.js';
import { FeatureFlags } from './feature-flags.js';
import type { VerificationKey, JsonProof } from './zkprogram.js';
import { Subclass } from '../util/types.js';
import type { Provable } from '../provable/provable.js';
import { ProvableType } from '../provable/types/provable-intf.js';
export { ProofBase, Proof, DynamicProof };
export { dummyProof, extractProofs, extractProofTypes, type ProofValue };
declare class ProofBase<Input = any, Output = any> {
    static publicInputType: FlexibleProvablePure<any>;
    static publicOutputType: FlexibleProvablePure<any>;
    static tag: () => {
        name: string;
    };
    publicInput: Input;
    publicOutput: Output;
    proof: Pickles.Proof;
    maxProofsVerified: 0 | 1 | 2;
    shouldVerify: import("../provable/bool.js").Bool;
    toJSON(): JsonProof;
    constructor({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: Pickles.Proof;
        publicInput: Input;
        publicOutput: Output;
        maxProofsVerified: 0 | 1 | 2;
    });
    static get provable(): Provable<any>;
    static publicFields(value: ProofBase): {
        input: import("../provable/field.js").Field[];
        output: import("../provable/field.js").Field[];
    };
    publicFields(): {
        input: import("../provable/field.js").Field[];
        output: import("../provable/field.js").Field[];
    };
}
declare class Proof<Input, Output> extends ProofBase<Input, Output> {
    verify(): void;
    verifyIf(condition: Bool): void;
    static fromJSON<S extends Subclass<typeof Proof>>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: JsonProof): Promise<Proof<InferProvable<S['publicInputType']>, InferProvable<S['publicOutputType']>>>;
    /**
     * Dummy proof. This can be useful for ZkPrograms that handle the base case in the same
     * method as the inductive case, using a pattern like this:
     *
     * ```ts
     * method(proof: SelfProof<I, O>, isRecursive: Bool) {
     *   proof.verifyIf(isRecursive);
     *   // ...
     * }
     * ```
     *
     * To use such a method in the base case, you need a dummy proof:
     *
     * ```ts
     * let dummy = await MyProof.dummy(publicInput, publicOutput, 1);
     * await myProgram.myMethod(dummy, Bool(false));
     * ```
     *
     * **Note**: The types of `publicInput` and `publicOutput`, as well as the `maxProofsVerified` parameter,
     * must match your ZkProgram. `maxProofsVerified` is the maximum number of proofs that any of your methods take as arguments.
     */
    static dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 1 | 2, domainLog2?: number): Promise<Proof<Input, OutPut>>;
    static get provable(): ProvableProof<Proof<any, any>>;
}
/**
 * The `DynamicProof` class enables circuits to verify proofs using in-ciruit verfication keys.
 * This is opposed to the baked-in verification keys of the `Proof` class.
 *
 * In order to use this, a subclass of DynamicProof that specifies the public input and output types along with the maxProofsVerified number has to be created.
 *
 * ```ts
 * export class SideloadedProgramProof extends DynamicProof<MyStruct, Field> {
 *   static publicInputType = MyStruct;
 *   static publicOutputType = Field;
 *   static maxProofsVerified = 0 as const;
 * }
 * ```
 *
 * The `maxProofsVerified` constant is a product of the child circuit and indicates the maximum number that that circuit verifies itself.
 * If you are unsure about what that is for you, you should use `2`.
 *
 * Any `DynamicProof` subclass can be used as private input to ZkPrograms or SmartContracts along with a `VerificationKey` input.
 * ```ts
 * proof.verify(verificationKey)
 * ```
 *
 * NOTE: In the case of `DynamicProof`s, the circuit makes no assertions about the verificationKey used on its own.
 * This is the responsibility of the application developer and should always implement appropriate checks.
 * This pattern differs a lot from the usage of normal `Proof`, where the verification key is baked into the compiled circuit.
 * @see {@link src/examples/zkprogram/dynamic-keys-merkletree.ts} for an example of how this can be done using merkle trees
 *
 * Assertions generally only happen using the vk hash that is part of the `VerificationKey` struct along with the raw vk data as auxiliary data.
 * When using verify() on a `DynamicProof`, Pickles makes sure that the verification key data matches the hash.
 * Therefore all manual assertions have to be made on the vk's hash and it can be assumed that the vk's data is checked to match the hash if it is used with verify().
 */
declare class DynamicProof<Input, Output> extends ProofBase<Input, Output> {
    static maxProofsVerified: 0 | 1 | 2;
    private static memoizedCounter;
    /**
     * As the name indicates, feature flags are features of the proof system.
     *
     * If we want to side load proofs and verification keys, we first have to tell Pickles what _shape_ of proofs it should expect.
     *
     * For example, if we want to side load proofs that use foreign field arithmetic custom gates, we have to make Pickles aware of that by defining
     * these custom gates.
     *
     * _Note:_ Only proofs that use the exact same composition of custom gates which were expected by Pickles can be verified using side loading.
     * If you want to verify _any_ proof, no matter what custom gates it uses, you can use {@link FeatureFlags.allMaybe}. Please note that this might incur a significant overhead.
     *
     * You can also toggle specific feature flags manually by specifying them here.
     * Alternatively, you can use {@link FeatureFlags.fromZkProgram} to compute the set of feature flags that are compatible with a given program.
     */
    static featureFlags: FeatureFlags;
    static tag(): {
        name: string;
    };
    usedVerificationKey?: VerificationKey;
    /**
     * Verifies this DynamicProof using a given verification key
     * @param vk The verification key this proof will be verified against
     */
    verify(vk: VerificationKey): void;
    verifyIf(vk: VerificationKey, condition: Bool): void;
    static fromJSON<S extends Subclass<typeof DynamicProof>>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: JsonProof): Promise<DynamicProof<InferProvable<S['publicInputType']>, InferProvable<S['publicOutputType']>>>;
    static dummy<S extends Subclass<typeof DynamicProof>>(this: S, publicInput: InferProvable<S['publicInputType']>, publicOutput: InferProvable<S['publicOutputType']>, maxProofsVerified: 0 | 1 | 2, domainLog2?: number): Promise<InstanceType<S>>;
    /**
     * Converts a Proof into a DynamicProof carrying over all relevant data.
     * This method can be used to convert a Proof computed by a ZkProgram
     * into a DynamicProof that is accepted in a circuit that accepts DynamicProofs
     */
    static fromProof<S extends Subclass<typeof DynamicProof>>(this: S, proof: Proof<InferProvable<S['publicInputType']>, InferProvable<S['publicOutputType']>>): InstanceType<S>;
    static get provable(): ProvableProof<DynamicProof<any, any>>;
}
declare function dummyProof(maxProofsVerified: 0 | 1 | 2, domainLog2: number): Promise<unknown>;
type ProofValue<Input, Output> = {
    publicInput: Input;
    publicOutput: Output;
    proof: Pickles.Proof;
    maxProofsVerified: 0 | 1 | 2;
};
type ProvableProof<Proof extends ProofBase, InputV = any, OutputV = any> = Provable<Proof, ProofValue<InputV, OutputV>>;
declare function extractProofs(value: unknown): ProofBase[];
declare function extractProofTypes(type: ProvableType): (typeof ProofBase)[];
