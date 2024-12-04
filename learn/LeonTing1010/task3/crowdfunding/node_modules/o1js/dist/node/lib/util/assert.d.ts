export { assert, assertPromise, assertDefined };
declare function assert(stmt: boolean, message?: string): asserts stmt;
declare function assertPromise<T>(value: Promise<T>, message?: string): Promise<T>;
/**
 * Assert that the value is not undefined, return the value.
 */
declare function assertDefined<T>(value: T | undefined, message?: string): T;
