import { Pickles, Gate } from '../../snarky.js';
import { Field } from '../provable/wrapped.js';
import { FlexibleProvablePure, InferProvable, ProvablePureExtended } from '../provable/types/struct.js';
import { InferProvableType } from '../provable/types/provable-derivers.js';
import { Provable } from '../provable/provable.js';
import { FieldConst } from '../provable/core/fieldvar.js';
import { Cache } from './cache.js';
import { ProvablePure, ProvableType, ProvableTypePure, ToProvable } from '../provable/types/provable-intf.js';
import { Subclass, Tuple } from '../util/types.js';
import { Proof, ProofBase, ProofValue } from './proof.js';
import { InferValue } from '../../bindings/lib/provable-generic.js';
export { SelfProof, JsonProof, ZkProgram, verify, Empty, Undefined, Void, VerificationKey, };
export { CompiledTag, sortMethodArguments, getPreviousProofsForProver, MethodInterface, picklesRuleFromFunction, compileProgram, analyzeMethod, Prover, dummyBase64Proof, };
type Undefined = undefined;
declare const Undefined: ProvablePureExtended<undefined, undefined, null>;
type Empty = Undefined;
declare const Empty: ProvablePureExtended<undefined, undefined, null>;
type Void = undefined;
declare const Void: ProvablePureExtended<void, void, null>;
declare function createProgramState(): {
    setAuxiliaryOutput(value: unknown, methodName: string): void;
    getAuxiliaryOutput(methodName: string): unknown;
    reset(methodName: string): void;
};
declare function verify(proof: ProofBase<any, any> | JsonProof, verificationKey: string | VerificationKey): Promise<boolean>;
type JsonProof = {
    publicInput: string[];
    publicOutput: string[];
    maxProofsVerified: 0 | 1 | 2;
    proof: string;
};
type CompiledTag = unknown;
declare let CompiledTag: {
    get(tag: any): CompiledTag | undefined;
    store(tag: any, compiledTag: CompiledTag): void;
};
declare function ZkProgram<Config extends {
    publicInput?: ProvableTypePure;
    publicOutput?: ProvableTypePure;
    methods: {
        [I in string]: {
            privateInputs: Tuple<PrivateInput>;
            auxiliaryOutput?: ProvableType;
        };
    };
}, Methods extends {
    [I in keyof Config['methods']]: Method<InferProvableOrUndefined<Get<Config, 'publicInput'>>, InferProvableOrVoid<Get<Config, 'publicOutput'>>, Config['methods'][I]>;
}, MethodSignatures extends Config['methods'] = Config['methods'], PrivateInputs extends {
    [I in keyof MethodSignatures]: MethodSignatures[I]['privateInputs'];
} = {
    [I in keyof MethodSignatures]: MethodSignatures[I]['privateInputs'];
}, AuxiliaryOutputs extends {
    [I in keyof MethodSignatures]: Get<MethodSignatures[I], 'auxiliaryOutput'>;
} = {
    [I in keyof MethodSignatures]: Get<MethodSignatures[I], 'auxiliaryOutput'>;
}>(config: Config & {
    name: string;
    methods: {
        [I in keyof Config['methods']]: Methods[I];
    };
    overrideWrapDomain?: 0 | 1 | 2;
}): {
    name: string;
    compile: (options?: {
        cache?: Cache;
        forceRecompile?: boolean;
        proofsEnabled?: boolean;
    }) => Promise<{
        verificationKey: {
            data: string;
            hash: Field;
        };
    }>;
    verify: (proof: Proof<InferProvableOrUndefined<Get<Config, 'publicInput'>>, InferProvableOrVoid<Get<Config, 'publicOutput'>>>) => Promise<boolean>;
    digest: () => Promise<string>;
    analyzeMethods: () => Promise<{
        [I in keyof Config['methods']]: UnwrapPromise<ReturnType<typeof analyzeMethod>>;
    }>;
    publicInputType: ProvableOrUndefined<Get<Config, 'publicInput'>>;
    publicOutputType: ProvableOrVoid<Get<Config, 'publicOutput'>>;
    privateInputTypes: PrivateInputs;
    auxiliaryOutputTypes: AuxiliaryOutputs;
    rawMethods: {
        [I in keyof Config['methods']]: Methods[I]['method'];
    };
    proofsEnabled: boolean;
    setProofsEnabled(proofsEnabled: boolean): void;
} & {
    [I in keyof Config['methods']]: Prover<InferProvableOrUndefined<Get<Config, 'publicInput'>>, InferProvableOrVoid<Get<Config, 'publicOutput'>>, PrivateInputs[I], InferProvableOrUndefined<AuxiliaryOutputs[I]>>;
};
declare namespace ZkProgram {
    var Proof: <PublicInputType extends FlexibleProvablePure<any>, PublicOutputType extends FlexibleProvablePure<any>>(program: {
        name: string;
        publicInputType: PublicInputType;
        publicOutputType: PublicOutputType;
    }) => {
        new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
            proof: unknown;
            publicInput: InferProvable<PublicInputType>;
            publicOutput: InferProvable<PublicOutputType>;
            maxProofsVerified: 0 | 2 | 1;
        }): Proof<InferProvable<PublicInputType>, InferProvable<PublicOutputType>>;
        fromJSON<S extends Subclass<typeof import("./proof.js").Proof>>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: JsonProof): Promise<Proof<InferProvable<S["publicInputType"]>, InferProvable<S["publicOutputType"]>>>;
        dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 2 | 1, domainLog2?: number): Promise<Proof<Input, OutPut>>;
        readonly provable: {
            toFields: (value: Proof<any, any>) => import("../provable/field.js").Field[];
            toAuxiliary: (value?: Proof<any, any> | undefined) => any[];
            fromFields: (fields: import("../provable/field.js").Field[], aux: any[]) => Proof<any, any>;
            sizeInFields(): number;
            check: (value: Proof<any, any>) => void;
            toValue: (x: Proof<any, any>) => ProofValue<any, any>;
            fromValue: (x: Proof<any, any> | ProofValue<any, any>) => Proof<any, any>;
            toCanonical?: ((x: Proof<any, any>) => Proof<any, any>) | undefined;
        };
        publicInputType: FlexibleProvablePure<any>;
        publicOutputType: FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
        publicFields(value: ProofBase<any, any>): {
            input: import("../provable/field.js").Field[];
            output: import("../provable/field.js").Field[];
        };
    } & {
        provable: Provable<Proof<InferProvable<PublicInputType>, InferProvable<PublicOutputType>>, ProofValue<InferValue<PublicInputType>, InferValue<PublicOutputType>>>;
    };
}
type ZkProgram<Config extends {
    publicInput?: ProvableTypePure;
    publicOutput?: ProvableTypePure;
    methods: {
        [I in string]: {
            privateInputs: Tuple<PrivateInput>;
            auxiliaryOutput?: ProvableType;
        };
    };
}, Methods extends {
    [I in keyof Config['methods']]: Method<InferProvableOrUndefined<Get<Config, 'publicInput'>>, InferProvableOrVoid<Get<Config, 'publicOutput'>>, Config['methods'][I]>;
}> = ReturnType<typeof ZkProgram<Config, Methods>>;
declare class SelfProof<PublicInput, PublicOutput> extends Proof<PublicInput, PublicOutput> {
}
declare const VerificationKey_base: (new (value: {
    data: string;
    hash: import("../provable/field.js").Field;
}) => {
    data: string;
    hash: import("../provable/field.js").Field;
}) & {
    _isStruct: true;
} & Provable<{
    data: string;
    hash: import("../provable/field.js").Field;
}, {
    data: string;
    hash: bigint;
}> & {
    fromValue: (value: {
        data: string;
        hash: import("../provable/field.js").Field;
    } | {
        data: string;
        hash: bigint;
    }) => {
        data: string;
        hash: import("../provable/field.js").Field;
    };
    toInput: (x: {
        data: string;
        hash: import("../provable/field.js").Field;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: string;
        hash: import("../provable/field.js").Field;
    }) => string;
    fromJSON: (x: string) => {
        data: string;
        hash: import("../provable/field.js").Field;
    };
    empty: () => {
        data: string;
        hash: import("../provable/field.js").Field;
    };
};
declare class VerificationKey extends VerificationKey_base {
    static dummy(): Promise<VerificationKey>;
}
declare function sortMethodArguments(programName: string, methodName: string, privateInputs: unknown[], auxiliaryType: Provable<any> | undefined, selfProof: Subclass<typeof Proof>): MethodInterface;
declare function getPreviousProofsForProver(methodArgs: any[]): unknown[];
type MethodInterface = {
    methodName: string;
    args: ProvableType<unknown>[];
    numberOfProofs: number;
    returnType?: Provable<any>;
    auxiliaryType?: Provable<any>;
};
declare function compileProgram({ publicInputType, publicOutputType, methodIntfs, methods, gates, proofSystemTag, cache, forceRecompile, overrideWrapDomain, state, }: {
    publicInputType: ProvablePure<any>;
    publicOutputType: ProvablePure<any>;
    methodIntfs: MethodInterface[];
    methods: ((...args: any) => unknown)[];
    gates: Gate[][];
    proofSystemTag: {
        name: string;
    };
    cache: Cache;
    forceRecompile: boolean;
    overrideWrapDomain?: 0 | 1 | 2;
    state?: ReturnType<typeof createProgramState>;
}): Promise<{
    verificationKey: {
        data: string;
        hash: import("../provable/field.js").Field;
    };
    provers: Pickles.Prover[];
    verify: (statement: Pickles.Statement<FieldConst>, proof: Pickles.Proof) => Promise<boolean>;
    tag: unknown;
}>;
declare function analyzeMethod(publicInputType: ProvablePure<any>, methodIntf: MethodInterface, method: (...args: any) => unknown): Promise<{
    rows: number;
    digest: string;
    gates: Gate[];
    publicInputSize: number;
    print(): void;
    summary(): Partial<Record<import("../../snarky.js").GateType | "Total rows", number>>;
}>;
declare function picklesRuleFromFunction(publicInputType: ProvablePure<unknown>, publicOutputType: ProvablePure<unknown>, func: (...args: unknown[]) => unknown, proofSystemTag: {
    name: string;
}, { methodName, args, auxiliaryType }: MethodInterface, gates: Gate[], state?: ReturnType<typeof createProgramState>): Pickles.Rule;
declare function dummyBase64Proof(): Promise<string>;
declare function Prover<ProverData>(): {
    run<Result>(witnesses: unknown[], proverData: ProverData, callback: () => Promise<Result>): Promise<Result>;
    getData(): ProverData;
};
type Infer<T> = T extends Subclass<typeof ProofBase> ? InstanceType<T> : T extends ProvableType ? InferProvableType<T> : never;
type TupleToInstances<T> = {
    [I in keyof T]: Infer<T[I]>;
} & any[];
type PrivateInput = ProvableType | Subclass<typeof ProofBase>;
type MethodReturnType<PublicOutput, AuxiliaryOutput> = PublicOutput extends void ? AuxiliaryOutput extends undefined ? void : {
    auxiliaryOutput: AuxiliaryOutput;
} : AuxiliaryOutput extends undefined ? {
    publicOutput: PublicOutput;
} : {
    publicOutput: PublicOutput;
    auxiliaryOutput: AuxiliaryOutput;
};
type Method<PublicInput, PublicOutput, MethodSignature extends {
    privateInputs: Tuple<PrivateInput>;
    auxiliaryOutput?: ProvableType;
}> = PublicInput extends undefined ? {
    method(...args: TupleToInstances<MethodSignature['privateInputs']>): Promise<MethodReturnType<PublicOutput, InferProvableOrUndefined<Get<MethodSignature, 'auxiliaryOutput'>>>>;
} : {
    method(publicInput: PublicInput, ...args: TupleToInstances<MethodSignature['privateInputs']>): Promise<MethodReturnType<PublicOutput, InferProvableOrUndefined<Get<MethodSignature, 'auxiliaryOutput'>>>>;
};
type Prover<PublicInput, PublicOutput, Args extends Tuple<PrivateInput>, AuxiliaryOutput> = PublicInput extends undefined ? (...args: TupleToInstances<Args>) => Promise<{
    proof: Proof<PublicInput, PublicOutput>;
    auxiliaryOutput: AuxiliaryOutput;
}> : (publicInput: PublicInput, ...args: TupleToInstances<Args>) => Promise<{
    proof: Proof<PublicInput, PublicOutput>;
    auxiliaryOutput: AuxiliaryOutput;
}>;
type ProvableOrUndefined<A> = A extends undefined ? typeof Undefined : ToProvable<A>;
type ProvableOrVoid<A> = A extends undefined ? typeof Void : ToProvable<A>;
type InferProvableOrUndefined<A> = A extends undefined ? undefined : A extends ProvableType ? InferProvable<A> : InferProvable<A> | undefined;
type InferProvableOrVoid<A> = A extends undefined ? void : InferProvable<A>;
type UnwrapPromise<P> = P extends Promise<infer T> ? T : never;
/**
 * helper to get property type from an object, in place of `T[Key]`
 *
 * assume `T extends { Key?: Something }`.
 * if we use `Get<T, Key>` instead of `T[Key]`, we allow `T` to be inferred _without_ the `Key` key,
 * and thus retain the precise type of `T` during inference
 */
type Get<T, Key extends string> = T extends {
    [K in Key]: infer Value;
} ? Value : undefined;
