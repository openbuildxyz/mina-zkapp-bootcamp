import { Random } from './random.js';
export { test };
export { Random, sample, withHardCoded } from './random.js';
declare const test: (<T extends readonly Random<any>[]>(...args: [...gens: T, run: (...args: [...values: { [i in keyof Nexts<T>]: Nexts<T>[i] extends () => infer U ? U : never; }, assert: (b: boolean, message?: string) => void]) => void]) => number) & {
    negative: <T extends readonly Random<any>[]>(...args: [...gens: T, run: (...args: [...values: { [i in keyof Nexts<T>]: Nexts<T>[i] extends () => infer U ? U : never; }, assert: (b: boolean, message?: string) => void]) => void]) => number;
    custom: typeof testCustom;
};
/**
 * Create a customized test runner.
 *
 * The runner takes any number of generators (Random<T>) and a function which gets samples as inputs, and performs the test.
 * The test can be either performed by using the `assert` function which is passed as argument, or simply throw an error when an assertion fails:
 *
 * ```ts
 * let test = testCustom();
 *
 * test(Random.nat(5), (x, assert) => {
 *   // x is one sample of the `Random.nat(5)` distribution
 *   // we can make assertions about it by using `assert`
 *   assert(x < 6, "should not exceed max value of 5");
 *   // or by using any other assertion library which throws errors on failing assertions:
 *   expect(x).toBeLessThan(6);
 * })
 * ```
 *
 * Parameters `minRuns`, `maxRuns` and `timeBudget` determine how often a test is run:
 * - We definitely run the test `minRuns` times
 * - Then we determine how many more test fit into the `timeBudget` (time the test should take, in milliseconds)
 * - And we run the test as often as we can within that budget, but at most `maxRuns` times.
 *
 * If one run fails, the entire test stops immediately and the failing sample is printed to the console.
 *
 * The parameter `negative` inverts this behaviour: If `negative: true`, _every_ sample is expected to fail and the test
 * stops if one sample succeeds.
 *
 * The default behaviour of printing out failing samples can be turned off by setting `logFailures: false`.
 */
declare function testCustom({ minRuns, maxRuns, timeBudget, negative, logFailures, }?: {
    minRuns?: number | undefined;
    maxRuns?: number | undefined;
    timeBudget?: number | undefined;
    negative?: boolean | undefined;
    logFailures?: boolean | undefined;
}): <T extends readonly Random<any>[]>(...args: [...gens: T, run: (...args: [...values: { [i in keyof Nexts<T>]: Nexts<T>[i] extends () => infer U ? U : never; }, assert: (b: boolean, message?: string | undefined) => void]) => void]) => number;
type Nexts<T extends readonly Random<any>[]> = {
    [i in keyof T]: T[i]['create'] extends () => () => infer U ? () => U : never;
};
