import { EmptyUndefined, EmptyVoid } from '../../bindings/lib/generic.js';
import { Snarky, initializeBindings, withThreadPool } from '../../snarky.js';
import { Pickles } from '../../snarky.js';
import { Field } from '../provable/wrapped.js';
import { Struct, } from '../provable/types/struct.js';
import { provable, } from '../provable/types/provable-derivers.js';
import { Provable } from '../provable/provable.js';
import { assert, prettifyStacktracePromise } from '../util/errors.js';
import { snarkContext } from '../provable/core/provable-context.js';
import { hashConstant } from '../provable/crypto/poseidon.js';
import { MlArray, MlBool, MlResult, MlPair } from '../ml/base.js';
import { MlFieldArray, MlFieldConstArray } from '../ml/fields.js';
import { Cache, readCache, writeCache } from './cache.js';
import { decodeProverKey, encodeProverKey, parseHeader, } from './prover-keys.js';
import { setSrsCache, unsetSrsCache, } from '../../bindings/crypto/bindings/srs.js';
import { ProvableType, } from '../provable/types/provable-intf.js';
import { prefixToField } from '../../bindings/lib/binable.js';
import { prefixes } from '../../bindings/crypto/constants.js';
import { dummyProof, DynamicProof, extractProofs, extractProofTypes, Proof, ProofBase, } from './proof.js';
import { featureFlagsFromGates, featureFlagsToMlOption, } from './feature-flags.js';
import { emptyWitness } from '../provable/types/util.js';
// public API
export { SelfProof, ZkProgram, verify, Empty, Undefined, Void, VerificationKey, };
// internal API
export { CompiledTag, sortMethodArguments, getPreviousProofsForProver, picklesRuleFromFunction, compileProgram, analyzeMethod, Prover, dummyBase64Proof, };
const Undefined = EmptyUndefined();
const Empty = Undefined;
const Void = EmptyVoid();
function createProgramState() {
    let methodCache = new Map();
    return {
        setAuxiliaryOutput(value, methodName) {
            methodCache.set(methodName, value);
        },
        getAuxiliaryOutput(methodName) {
            let entry = methodCache.get(methodName);
            if (entry === undefined)
                throw Error(`Auxiliary value for method ${methodName} not defined`);
            return entry;
        },
        reset(methodName) {
            methodCache.delete(methodName);
        },
    };
}
async function verify(proof, verificationKey) {
    await initializeBindings();
    let picklesProof;
    let statement;
    if (typeof proof.proof === 'string') {
        // json proof
        [, picklesProof] = Pickles.proofOfBase64(proof.proof, proof.maxProofsVerified);
        let input = MlFieldConstArray.to(proof.publicInput.map(Field));
        let output = MlFieldConstArray.to(proof.publicOutput.map(Field));
        statement = MlPair(input, output);
    }
    else {
        // proof class
        picklesProof = proof.proof;
        let fields = proof.publicFields();
        let input = MlFieldConstArray.to(fields.input);
        let output = MlFieldConstArray.to(fields.output);
        statement = MlPair(input, output);
    }
    let vk = typeof verificationKey === 'string'
        ? verificationKey
        : verificationKey.data;
    return prettifyStacktracePromise(withThreadPool(() => Pickles.verify(statement, picklesProof, vk)));
}
let compiledTags = new WeakMap();
let CompiledTag = {
    get(tag) {
        return compiledTags.get(tag);
    },
    store(tag, compiledTag) {
        compiledTags.set(tag, compiledTag);
    },
};
let sideloadedKeysMap = {};
let SideloadedTag = {
    get(tag) {
        return sideloadedKeysMap[tag];
    },
    store(tag, compiledTag) {
        sideloadedKeysMap[tag] = compiledTag;
    },
};
function ZkProgram(config) {
    let doProving = true;
    let methods = config.methods;
    let publicInputType = ProvableType.get(config.publicInput ?? Undefined);
    let publicOutputType = ProvableType.get(config.publicOutput ?? Void);
    let selfTag = { name: config.name };
    class SelfProof extends Proof {
    }
    SelfProof.publicInputType = publicInputType;
    SelfProof.publicOutputType = publicOutputType;
    SelfProof.tag = () => selfTag;
    // TODO remove sort()! Object.keys() has a deterministic order
    let methodKeys = Object.keys(methods).sort(); // need to have methods in (any) fixed order
    let methodIntfs = methodKeys.map((key) => sortMethodArguments('program', key, methods[key].privateInputs, ProvableType.get(methods[key].auxiliaryOutput) ?? Undefined, SelfProof));
    let methodFunctions = methodKeys.map((key) => methods[key].method);
    let maxProofsVerified = getMaxProofsVerified(methodIntfs);
    async function analyzeMethods() {
        let methodsMeta = {};
        for (let i = 0; i < methodIntfs.length; i++) {
            let methodEntry = methodIntfs[i];
            methodsMeta[methodEntry.methodName] = await analyzeMethod(publicInputType, methodEntry, methodFunctions[i]);
        }
        return methodsMeta;
    }
    let compileOutput;
    const programState = createProgramState();
    async function compile({ cache = Cache.FileSystemDefault, forceRecompile = false, proofsEnabled = undefined, } = {}) {
        doProving = proofsEnabled ?? doProving;
        if (doProving) {
            let methodsMeta = await analyzeMethods();
            let gates = methodKeys.map((k) => methodsMeta[k].gates);
            let { provers, verify, verificationKey } = await compileProgram({
                publicInputType,
                publicOutputType,
                methodIntfs,
                methods: methodFunctions,
                gates,
                proofSystemTag: selfTag,
                cache,
                forceRecompile,
                overrideWrapDomain: config.overrideWrapDomain,
                state: programState,
            });
            compileOutput = { provers, verify };
            return { verificationKey };
        }
        else {
            return {
                verificationKey: VerificationKey.empty(),
            };
        }
    }
    function toProver(key, i) {
        async function prove_(publicInput, ...args) {
            class ProgramProof extends Proof {
            }
            ProgramProof.publicInputType = publicInputType;
            ProgramProof.publicOutputType = publicOutputType;
            ProgramProof.tag = () => selfTag;
            if (!doProving) {
                let previousProofs = MlArray.to(getPreviousProofsForProver(args));
                let { publicOutput, auxiliaryOutput } = (await methods[key].method(publicInput, previousProofs)) ??
                    {};
                let proof = await ProgramProof.dummy(publicInput, publicOutput, maxProofsVerified);
                return { proof, auxiliaryOutput };
            }
            let picklesProver = compileOutput?.provers?.[i];
            if (picklesProver === undefined) {
                throw Error(`Cannot prove execution of program.${key}(), no prover found. ` +
                    `Try calling \`await program.compile()\` first, this will cache provers in the background.\nIf you compiled your zkProgram with proofs disabled (\`proofsEnabled = false\`), you have to compile it with proofs enabled first.`);
            }
            let publicInputFields = toFieldConsts(publicInputType, publicInput);
            let previousProofs = MlArray.to(getPreviousProofsForProver(args));
            let id = snarkContext.enter({ witnesses: args, inProver: true });
            let result;
            try {
                result = await picklesProver(publicInputFields, previousProofs);
            }
            finally {
                snarkContext.leave(id);
            }
            let auxiliaryType = methodIntfs[i].auxiliaryType;
            let auxiliaryOutputExists = auxiliaryType && auxiliaryType.sizeInFields() !== 0;
            let auxiliaryOutput;
            if (auxiliaryOutputExists) {
                auxiliaryOutput = programState.getAuxiliaryOutput(methodIntfs[i].methodName);
                programState.reset(methodIntfs[i].methodName);
            }
            let [publicOutputFields, proof] = MlPair.from(result);
            let publicOutput = fromFieldConsts(publicOutputType, publicOutputFields);
            return {
                proof: new ProgramProof({
                    publicInput,
                    publicOutput,
                    proof,
                    maxProofsVerified,
                }),
                auxiliaryOutput,
            };
        }
        let prove;
        if (publicInputType === Undefined ||
            publicInputType === Void) {
            prove = ((...args) => prove_(undefined, ...args));
        }
        else {
            prove = prove_;
        }
        return [key, prove];
    }
    let provers = Object.fromEntries(methodKeys.map(toProver));
    function verify(proof) {
        if (!doProving) {
            return Promise.resolve(true);
        }
        if (compileOutput?.verify === undefined) {
            throw Error(`Cannot verify proof, verification key not found. Try calling \`await program.compile()\` first.`);
        }
        let statement = MlPair(toFieldConsts(publicInputType, proof.publicInput), toFieldConsts(publicOutputType, proof.publicOutput));
        return compileOutput.verify(statement, proof.proof);
    }
    async function digest() {
        let methodsMeta = await analyzeMethods();
        let digests = methodKeys.map((k) => Field(BigInt('0x' + methodsMeta[k].digest)));
        return hashConstant(digests).toBigInt().toString(16);
    }
    const program = Object.assign(selfTag, {
        compile,
        verify,
        digest,
        analyzeMethods,
        publicInputType: publicInputType,
        publicOutputType: publicOutputType,
        privateInputTypes: Object.fromEntries(methodKeys.map((key) => [key, methods[key].privateInputs])),
        auxiliaryOutputTypes: Object.fromEntries(methodKeys.map((key) => [key, methods[key].auxiliaryOutput])),
        rawMethods: Object.fromEntries(methodKeys.map((key) => [key, methods[key].method])),
        setProofsEnabled(proofsEnabled) {
            doProving = proofsEnabled;
        },
    }, provers);
    // Object.assign only shallow-copies, hence we cant use this getter and have to define it explicitly
    Object.defineProperty(program, 'proofsEnabled', {
        get: () => doProving,
    });
    return program;
}
class SelfProof extends Proof {
}
class VerificationKey extends Struct({
    ...provable({ data: String, hash: Field }),
    toJSON({ data }) {
        return data;
    },
}) {
    static async dummy() {
        await initializeBindings();
        const [, data, hash] = Pickles.dummyVerificationKey();
        return new VerificationKey({
            data,
            hash: Field(hash),
        });
    }
}
function sortMethodArguments(programName, methodName, privateInputs, auxiliaryType, selfProof) {
    // replace SelfProof with the actual selfProof
    // TODO this does not handle SelfProof nested in inputs
    privateInputs = privateInputs.map((input) => input === SelfProof ? selfProof : input);
    // check if all arguments are provable
    let args = privateInputs.map((input, i) => {
        if (isProvable(input))
            return input;
        throw Error(`Argument ${i + 1} of method ${methodName} is not a provable type: ${input}`);
    });
    // extract proofs to count them and for sanity checks
    let proofs = args.flatMap(extractProofTypes);
    let numberOfProofs = proofs.length;
    // don't allow base classes for proofs
    proofs.forEach((proof) => {
        if (proof === ProofBase || proof === Proof || proof === DynamicProof) {
            throw Error(`You cannot use the \`${proof.name}\` class directly. Instead, define a subclass:\n` +
                `class MyProof extends ${proof.name}<PublicInput, PublicOutput> { ... }`);
        }
    });
    // don't allow more than 2 proofs
    if (numberOfProofs > 2) {
        throw Error(`${programName}.${methodName}() has more than two proof arguments, which is not supported.\n` +
            `Suggestion: You can merge more than two proofs by merging two at a time in a binary tree.`);
    }
    return { methodName, args, numberOfProofs, auxiliaryType };
}
function isProvable(type) {
    let type_ = ProvableType.get(type);
    return ((typeof type_ === 'function' || typeof type_ === 'object') &&
        type_ !== null &&
        ['toFields', 'fromFields', 'sizeInFields', 'toAuxiliary'].every((s) => s in type_));
}
function isDynamicProof(type) {
    return typeof type === 'function' && type.prototype instanceof DynamicProof;
}
function getPreviousProofsForProver(methodArgs) {
    return methodArgs.flatMap(extractProofs).map((proof) => proof.proof);
}
// reasonable default choice for `overrideWrapDomain`
const maxProofsToWrapDomain = { 0: 0, 1: 1, 2: 1 };
async function compileProgram({ publicInputType, publicOutputType, methodIntfs, methods, gates, proofSystemTag, cache, forceRecompile, overrideWrapDomain, state, }) {
    await initializeBindings();
    if (methodIntfs.length === 0)
        throw Error(`The Program you are trying to compile has no methods.
Try adding a method to your ZkProgram or SmartContract.
If you are using a SmartContract, make sure you are using the @method decorator.`);
    let rules = methodIntfs.map((methodEntry, i) => picklesRuleFromFunction(publicInputType, publicOutputType, methods[i], proofSystemTag, methodEntry, gates[i], state));
    let maxProofs = getMaxProofsVerified(methodIntfs);
    overrideWrapDomain ??= maxProofsToWrapDomain[maxProofs];
    let picklesCache = [
        0,
        function read_(mlHeader) {
            if (forceRecompile)
                return MlResult.unitError();
            let header = parseHeader(proofSystemTag.name, methodIntfs, mlHeader);
            let result = readCache(cache, header, (bytes) => decodeProverKey(mlHeader, bytes));
            if (result === undefined)
                return MlResult.unitError();
            return MlResult.ok(result);
        },
        function write_(mlHeader, value) {
            if (!cache.canWrite)
                return MlResult.unitError();
            let header = parseHeader(proofSystemTag.name, methodIntfs, mlHeader);
            let didWrite = writeCache(cache, header, encodeProverKey(value));
            if (!didWrite)
                return MlResult.unitError();
            return MlResult.ok(undefined);
        },
        MlBool(cache.canWrite),
    ];
    let { verificationKey, provers, verify, tag } = await prettifyStacktracePromise(withThreadPool(async () => {
        let result;
        let id = snarkContext.enter({ inCompile: true });
        setSrsCache(cache);
        try {
            result = Pickles.compile(MlArray.to(rules), {
                publicInputSize: publicInputType.sizeInFields(),
                publicOutputSize: publicOutputType.sizeInFields(),
                storable: picklesCache,
                overrideWrapDomain,
            });
            let { getVerificationKey, provers, verify, tag } = result;
            CompiledTag.store(proofSystemTag, tag);
            let [, data, hash] = await getVerificationKey();
            let verificationKey = { data, hash: Field(hash) };
            return {
                verificationKey,
                provers: MlArray.from(provers),
                verify,
                tag,
            };
        }
        finally {
            snarkContext.leave(id);
            unsetSrsCache();
        }
    }));
    // wrap provers
    let wrappedProvers = provers.map((prover) => async function picklesProver(publicInput, previousProofs) {
        return prettifyStacktracePromise(withThreadPool(() => prover(publicInput, previousProofs)));
    });
    // wrap verify
    let wrappedVerify = async function picklesVerify(statement, proof) {
        return prettifyStacktracePromise(withThreadPool(() => verify(statement, proof)));
    };
    return {
        verificationKey,
        provers: wrappedProvers,
        verify: wrappedVerify,
        tag,
    };
}
function analyzeMethod(publicInputType, methodIntf, method) {
    return Provable.constraintSystem(() => {
        let args = methodIntf.args.map(emptyWitness);
        let publicInput = emptyWitness(publicInputType);
        // note: returning the method result here makes this handle async methods
        if (publicInputType === Undefined || publicInputType === Void)
            return method(...args);
        return method(publicInput, ...args);
    });
}
function inCircuitVkHash(inCircuitVk) {
    const digest = Pickles.sideLoaded.vkDigest(inCircuitVk);
    const salt = Snarky.poseidon.update(MlFieldArray.to([Field(0), Field(0), Field(0)]), MlFieldArray.to([prefixToField(Field, prefixes.sideLoadedVK)]));
    const newState = Snarky.poseidon.update(salt, digest);
    const stateFields = MlFieldArray.from(newState);
    return stateFields[0];
}
function picklesRuleFromFunction(publicInputType, publicOutputType, func, proofSystemTag, { methodName, args, auxiliaryType }, gates, state) {
    async function main(publicInput) {
        let { witnesses: argsWithoutPublicInput, inProver } = snarkContext.get();
        assert(!(inProver && argsWithoutPublicInput === undefined));
        let finalArgs = [];
        let proofs = [];
        let previousStatements = [];
        for (let i = 0; i < args.length; i++) {
            let type = args[i];
            try {
                let value = Provable.witness(type, () => {
                    return argsWithoutPublicInput?.[i] ?? ProvableType.synthesize(type);
                });
                finalArgs[i] = value;
                for (let proof of extractProofs(value)) {
                    let Proof = proof.constructor;
                    proofs.push({ Proof, proof });
                    let fields = proof.publicFields();
                    let input = MlFieldArray.to(fields.input);
                    let output = MlFieldArray.to(fields.output);
                    previousStatements.push(MlPair(input, output));
                }
            }
            catch (e) {
                e.message = `Error when witnessing in ${methodName}, argument ${i}: ${e.message}`;
                throw e;
            }
        }
        let result;
        if (publicInputType === Undefined || publicInputType === Void) {
            result = (await func(...finalArgs));
        }
        else {
            let input = fromFieldVars(publicInputType, publicInput);
            result = (await func(input, ...finalArgs));
        }
        proofs.forEach(({ Proof, proof }) => {
            if (!(proof instanceof DynamicProof))
                return;
            // Initialize side-loaded verification key
            const tag = Proof.tag();
            const computedTag = SideloadedTag.get(tag.name);
            const vk = proof.usedVerificationKey;
            if (vk === undefined) {
                throw new Error('proof.verify() not called, call it at least once in your circuit');
            }
            if (Provable.inProver()) {
                Pickles.sideLoaded.inProver(computedTag, vk.data);
            }
            const circuitVk = Pickles.sideLoaded.vkToCircuit(() => vk.data);
            // Assert the validity of the auxiliary vk-data by comparing the witnessed and computed hash
            const hash = inCircuitVkHash(circuitVk);
            Field(hash).assertEquals(vk.hash, 'Provided VerificationKey hash not correct');
            Pickles.sideLoaded.inCircuit(computedTag, circuitVk);
        });
        // if the public output is empty, we don't evaluate `toFields(result)` to allow the function to return something else in that case
        let hasPublicOutput = publicOutputType.sizeInFields() !== 0;
        let publicOutput = hasPublicOutput
            ? publicOutputType.toFields(result.publicOutput)
            : [];
        if (state !== undefined &&
            auxiliaryType !== undefined &&
            auxiliaryType.sizeInFields() !== 0) {
            Provable.asProver(() => {
                let { auxiliaryOutput } = result;
                assert(auxiliaryOutput !== undefined, `${proofSystemTag.name}.${methodName}(): Auxiliary output is undefined even though the method declares it.`);
                state.setAuxiliaryOutput(Provable.toConstant(auxiliaryType, auxiliaryOutput), methodName);
            });
        }
        return {
            publicOutput: MlFieldArray.to(publicOutput),
            previousStatements: MlArray.to(previousStatements),
            shouldVerify: MlArray.to(proofs.map((proof) => proof.proof.shouldVerify.toField().value)),
        };
    }
    let proofs = args.flatMap(extractProofTypes);
    if (proofs.length > 2) {
        throw Error(`${proofSystemTag.name}.${methodName}() has more than two proof arguments, which is not supported.\n` +
            `Suggestion: You can merge more than two proofs by merging two at a time in a binary tree.`);
    }
    let proofsToVerify = proofs.map((Proof) => {
        let tag = Proof.tag();
        if (tag === proofSystemTag)
            return { isSelf: true };
        else if (isDynamicProof(Proof)) {
            let computedTag;
            // Only create the tag if it hasn't already been created for this specific Proof class
            if (SideloadedTag.get(tag.name) === undefined) {
                computedTag = Pickles.sideLoaded.create(tag.name, Proof.maxProofsVerified, Proof.publicInputType?.sizeInFields() ?? 0, Proof.publicOutputType?.sizeInFields() ?? 0, featureFlagsToMlOption(Proof.featureFlags));
                SideloadedTag.store(tag.name, computedTag);
            }
            else {
                computedTag = SideloadedTag.get(tag.name);
            }
            return { isSelf: false, tag: computedTag };
        }
        else {
            let compiledTag = CompiledTag.get(tag);
            if (compiledTag === undefined) {
                throw Error(`${proofSystemTag.name}.compile() depends on ${tag.name}, but we cannot find compilation output for ${tag.name}.\n` +
                    `Try to run ${tag.name}.compile() first.`);
            }
            return { isSelf: false, tag: compiledTag };
        }
    });
    let featureFlags = featureFlagsToMlOption(featureFlagsFromGates(gates));
    return {
        identifier: methodName,
        main,
        featureFlags,
        proofsToVerify: MlArray.to(proofsToVerify),
    };
}
function getMaxProofsVerified(methodIntfs) {
    return methodIntfs.reduce((acc, { numberOfProofs }) => Math.max(acc, numberOfProofs), 0);
}
function fromFieldVars(type, fields) {
    return type.fromFields(MlFieldArray.from(fields));
}
function fromFieldConsts(type, fields) {
    return type.fromFields(MlFieldConstArray.from(fields));
}
function toFieldConsts(type, value) {
    return MlFieldConstArray.to(type.toFields(value));
}
ZkProgram.Proof = function (program) {
    var _a;
    return _a = class ZkProgramProof extends Proof {
        },
        _a.publicInputType = program.publicInputType,
        _a.publicOutputType = program.publicOutputType,
        _a.tag = () => program,
        _a;
};
let dummyProofCache;
async function dummyBase64Proof() {
    if (dummyProofCache)
        return dummyProofCache;
    let proof = await dummyProof(2, 15);
    let base64Proof = Pickles.proofToBase64([2, proof]);
    dummyProofCache = base64Proof;
    return base64Proof;
}
// helpers for circuit context
function Prover() {
    return {
        async run(witnesses, proverData, callback) {
            let id = snarkContext.enter({ witnesses, proverData, inProver: true });
            try {
                return await callback();
            }
            finally {
                snarkContext.leave(id);
            }
        },
        getData() {
            return snarkContext.get().proverData;
        },
    };
}
//# sourceMappingURL=zkprogram.js.map