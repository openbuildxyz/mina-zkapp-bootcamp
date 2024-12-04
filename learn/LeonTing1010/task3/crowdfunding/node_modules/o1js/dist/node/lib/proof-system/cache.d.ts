export { Cache, CacheHeader };
export { readCache, writeCache, withVersion, cacheHeaderVersion, LAGRANGE_BASIS_PREFIX, };
/**
 * Interface for storing and retrieving values, for caching.
 * `read()` and `write()` can just throw errors on failure.
 *
 * The data that will be passed to the cache for writing is exhaustively described by the {@link CacheHeader} type.
 * It represents one of the following:
 * - The SRS. This is a deterministic lists of curve points (one per curve) that needs to be generated just once,
 *   to be used for polynomial commitments.
 * - Lagrange basis commitments. Similar to the SRS, this will be created once for every power-of-2 circuit size.
 * - Prover and verifier keys for every compiled circuit.
 *
 * Per smart contract or ZkProgram, several different keys are created:
 * - a step prover key (`step-pk`) and verification key (`step-vk`) _for every method_.
 * - a wrap prover key (`wrap-pk`) and verification key (`wrap-vk`) for the entire contract.
 */
type Cache = {
    /**
     * Read a value from the cache.
     *
     * @param header A small header to identify what is read from the cache.
     */
    read(header: CacheHeader): Uint8Array | undefined;
    /**
     * Write a value to the cache.
     *
     * @param header A small header to identify what is written to the cache. This will be used by `read()` to retrieve the data.
     * @param value The value to write to the cache, as a byte array.
     */
    write(header: CacheHeader, value: Uint8Array): void;
    /**
     * Indicates whether the cache is writable.
     */
    canWrite: boolean;
    /**
     * If `debug` is toggled, `read()` and `write()` errors are logged to the console.
     *
     * By default, cache errors are silent, because they don't necessarily represent an error condition,
     * but could just be a cache miss, or file system permissions incompatible with writing data.
     */
    debug?: boolean;
};
declare const cacheHeaderVersion = 1;
type CommonHeader = {
    /**
     * Header version to avoid parsing incompatible headers.
     */
    version: number;
    /**
     * An identifier that is persistent even as versions of the data change. Safe to use as a file path.
     */
    persistentId: string;
    /**
     * A unique identifier for the data to be read. Safe to use as a file path.
     */
    uniqueId: string;
    /**
     * Specifies whether the data to be read is a utf8-encoded string or raw binary data. This was added
     * because node's `fs.readFileSync` returns garbage when reading string files without specifying the encoding.
     */
    dataType: 'string' | 'bytes';
};
type StepKeyHeader<Kind> = {
    kind: Kind;
    programName: string;
    methodName: string;
    methodIndex: number;
    hash: string;
};
type WrapKeyHeader<Kind> = {
    kind: Kind;
    programName: string;
    hash: string;
};
type PlainHeader<Kind> = {
    kind: Kind;
};
declare const LAGRANGE_BASIS_PREFIX: "lagrange-basis";
/**
 * A header that is passed to the caching layer, to support rich caching strategies.
 *
 * Both `uniqueId` and `programId` can safely be used as a file path.
 */
type CacheHeader = (StepKeyHeader<'step-pk'> | StepKeyHeader<'step-vk'> | WrapKeyHeader<'wrap-pk'> | WrapKeyHeader<'wrap-vk'> | PlainHeader<'srs'> | PlainHeader<typeof LAGRANGE_BASIS_PREFIX>) & CommonHeader;
declare function withVersion(header: Omit<CacheHeader, 'version'>, version?: number): CacheHeader;
declare function readCache(cache: Cache, header: CacheHeader): Uint8Array | undefined;
declare function readCache<T>(cache: Cache, header: CacheHeader, transform: (x: Uint8Array) => T): T | undefined;
declare function writeCache(cache: Cache, header: CacheHeader, value: Uint8Array): boolean;
declare const Cache: {
    /**
     * Store data on the file system, in a directory of your choice.
     *
     * Data will be stored in two files per cache entry: a data file and a `.header` file.
     * The header file just contains a unique string which is used to determine whether we can use the cached data.
     *
     * Note: this {@link Cache} only caches data in Node.js.
     */
    FileSystem: (cacheDirectory: string, debug?: boolean) => Cache;
    /**
     * Store data on the file system, in a standard cache directory depending on the OS.
     *
     * Data will be stored in two files per cache entry: a data file and a `.header` file.
     * The header file just contains a unique string which is used to determine whether we can use the cached data.
     *
     * Note: this {@link Cache} only caches data in Node.js.
     */
    FileSystemDefault: Cache;
    /**
     * Don't store anything.
     */
    None: Cache;
};
