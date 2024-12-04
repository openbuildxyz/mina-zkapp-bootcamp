import 'reflect-metadata';
import { Snarky } from '../../snarky.js';
import { ProvablePure } from '../provable/types/provable-intf.js';
export { public_, circuitMain, Circuit, Keypair, Proof, VerificationKey };
declare class Circuit {
    static _main: CircuitData<any, any>;
    /**
     * Generates a proving key and a verification key for this circuit.
     * @example
     * ```ts
     * const keypair = await MyCircuit.generateKeypair();
     * ```
     */
    static generateKeypair(): Promise<Keypair>;
    /**
     * Proves a statement using the private input, public input, and the {@link Keypair} of the circuit.
     * @example
     * ```ts
     * const keypair = await MyCircuit.generateKeypair();
     * const proof = await MyCircuit.prove(privateInput, publicInput, keypair);
     * ```
     */
    static prove(privateInput: any[], publicInput: any[], keypair: Keypair): Promise<Proof>;
    /**
     * Verifies a proof using the public input, the proof, and the initial {@link Keypair} of the circuit.
     * @example
     * ```ts
     * const keypair = await MyCircuit.generateKeypair();
     * const proof = await MyCircuit.prove(privateInput, publicInput, keypair);
     * const isValid = await MyCircuit.verify(publicInput, keypair.vk, proof);
     * ```
     */
    static verify(publicInput: any[], verificationKey: VerificationKey, proof: Proof): Promise<boolean>;
}
declare class Keypair {
    value: Snarky.Keypair;
    constructor(value: Snarky.Keypair);
    verificationKey(): VerificationKey;
    /**
     * Returns a low-level JSON representation of the {@link Circuit} from its {@link Keypair}:
     * a list of gates, each of which represents a row in a table, with certain coefficients and wires to other (row, column) pairs
     * @example
     * ```ts
     * const keypair = await MyCircuit.generateKeypair();
     * const json = MyProvable.witnessFromKeypair(keypair);
     * ```
     */
    constraintSystem(): import("../../snarky.js").Gate[];
}
/**
 * Proofs can be verified using a {@link VerificationKey} and the public input.
 */
declare class Proof {
    value: Snarky.Proof;
    constructor(value: Snarky.Proof);
}
/**
 * Part of the circuit {@link Keypair}. A verification key can be used to verify a {@link Proof} when you provide the correct public input.
 */
declare class VerificationKey {
    value: Snarky.VerificationKey;
    constructor(value: Snarky.VerificationKey);
}
declare function public_(target: any, _key: string | symbol, index: number): void;
type CircuitData<P, W> = {
    main(publicInput: P, privateInput: W): void;
    publicInputType: ProvablePure<P>;
    privateInputType: ProvablePure<W>;
};
declare function circuitMain(target: typeof Circuit, propertyName: string, _descriptor?: PropertyDescriptor): any;
