export { CatchAndPrettifyStacktraceForAllMethods, CatchAndPrettifyStacktrace, prettifyStacktrace, prettifyStacktracePromise, assert, assert as assertInternal, };
/**
 * A class decorator that applies the CatchAndPrettifyStacktrace decorator function
 * to all methods of the target class.
 *
 * @param constructor - The target class constructor.
 */
declare function CatchAndPrettifyStacktraceForAllMethods<T extends {
    new (...args: any[]): {};
}>(constructor: T): void;
/**
 * A decorator function that wraps the target method with error handling logic.
 * It catches errors thrown by the method, prettifies the stack trace, and then
 * rethrows the error with the updated stack trace.
 *
 * @param _target - The target object.
 * @param _propertyName - The name of the property being decorated.
 * @param descriptor - The property descriptor of the target method.
 */
declare function CatchAndPrettifyStacktrace(_target: any, _propertyName: string, descriptor: PropertyDescriptor): void;
/**
 * Prettifies the stack trace of an error by removing unwanted lines and trimming paths.
 *
 * @param error - The error object with a stack trace to prettify.
 * @returns The same error with the prettified stack trace
 */
declare function prettifyStacktrace(error: unknown): unknown;
declare function prettifyStacktracePromise<T>(result: Promise<T>): Promise<T>;
/**
 * Make an assertion. When failing, this will communicate to users it's not their fault but indicates an internal bug.
 */
declare function assert(condition: boolean, message?: string): asserts condition;
