import { MlFeatureFlags, Gate } from '../../snarky.js';
import { MlArrayOptionalElements } from '../ml/base.js';
import type { analyzeMethod } from './zkprogram.js';
export { FeatureFlags };
export { featureFlagsToMlOption, featureFlagsFromGates };
type AnalysableProgram = {
    analyzeMethods: () => Promise<{
        [I in keyof any]: Awaited<ReturnType<typeof analyzeMethod>>;
    }>;
};
type FeatureFlags = {
    rangeCheck0: boolean | undefined;
    rangeCheck1: boolean | undefined;
    foreignFieldAdd: boolean | undefined;
    foreignFieldMul: boolean | undefined;
    xor: boolean | undefined;
    rot: boolean | undefined;
    lookup: boolean | undefined;
    runtimeTables: boolean | undefined;
};
/**
 * Feature flags indicate what custom gates are used in a proof of circuit.
 * Side loading, for example, requires a set of feature flags in advance (at compile time) in order to verify and side load proofs.
 * If the side loaded proofs and verification keys do not match the specified feature flag configurations, the verification will fail.
 * Flags specified as `undefined` are considered as `maybe` by Pickles. This means, proofs can be sided loaded that can, but don't have to, use a specific custom gate.
 * _Note:_ `Maybe` feature flags incur a proving overhead.
 */
declare const FeatureFlags: {
    /**
     * Returns a feature flag configuration where all flags are set to false.
     */
    allNone: {
        rangeCheck0: boolean;
        rangeCheck1: boolean;
        foreignFieldAdd: boolean;
        foreignFieldMul: boolean;
        xor: boolean;
        rot: boolean;
        lookup: boolean;
        runtimeTables: boolean;
    };
    /**
     * Returns a feature flag configuration where all flags are optional.
     */
    allMaybe: {
        rangeCheck0: undefined;
        rangeCheck1: undefined;
        foreignFieldAdd: undefined;
        foreignFieldMul: undefined;
        xor: undefined;
        rot: undefined;
        lookup: undefined;
        runtimeTables: undefined;
    };
    /**
     * Given a list of gates, returns the feature flag configuration that the gates use.
     */
    fromGates: typeof featureFlagsFromGates;
    /**
     * Given a ZkProgram, return the feature flag configuration that fits the given program.
     * This function considers all methods of the specified ZkProgram and finds a configuration that fits all.
     */
    fromZkProgram: (program: AnalysableProgram) => Promise<FeatureFlags>;
    /**
     * Given a list of ZkPrograms, return the feature flag configuration that fits the given set of programs.
     * This function considers all methods of all specified ZkPrograms and finds a configuration that fits all.
     */
    fromZkProgramList: typeof fromZkProgramList;
};
declare function fromZkProgramList(programs: Array<AnalysableProgram>): Promise<FeatureFlags>;
declare function featureFlagsFromGates(gates: Gate[]): FeatureFlags;
declare function featureFlagsToMlOption(flags: FeatureFlags): MlArrayOptionalElements<MlFeatureFlags>;
