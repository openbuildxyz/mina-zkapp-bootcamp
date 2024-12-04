import { ZkappCommand, ZkappPublicInput } from './account-update.js';
import { Field } from '../provable/wrapped.js';
import { PrivateKey, PublicKey } from '../provable/crypto/signature.js';
import { Empty } from '../proof-system/zkprogram.js';
import { Proof } from '../proof-system/proof.js';
import { Account } from './account.js';
import { type FeePayerSpec } from './mina-instance.js';
import { type SendZkAppResponse } from './graphql.js';
import { type FetchMode } from './transaction-context.js';
import { Types } from '../../bindings/mina-transaction/types.js';
export { Transaction, type TransactionPromise, type PendingTransaction, type IncludedTransaction, type RejectedTransaction, type PendingTransactionPromise, type PendingTransactionStatus, createTransaction, toTransactionPromise, toPendingTransactionPromise, sendTransaction, newTransaction, getAccount, transaction, createRejectedTransaction, createIncludedTransaction, };
type TransactionCommon = {
    /**
     * Transaction structure used to describe a state transition on the Mina blockchain.
     */
    transaction: ZkappCommand;
    /**
     * Serializes the transaction to a JSON string.
     * @returns A string representation of the {@link Transaction}.
     */
    toJSON(): string;
    /**
     * Produces a pretty-printed JSON representation of the {@link Transaction}.
     * @returns A formatted string representing the transaction in JSON.
     */
    toPretty(): any;
    /**
     * Constructs the GraphQL query string used for submitting the transaction to a Mina daemon.
     * @returns The GraphQL query string for the {@link Transaction}.
     */
    toGraphqlQuery(): string;
};
declare namespace Transaction {
    function fromJSON(json: Types.Json.ZkappCommand): Transaction<false, false>;
}
/**
 * Defines the structure and operations associated with a transaction.
 * This type encompasses methods for serializing the transaction, signing it, generating proofs,
 * and submitting it to the network.
 */
type Transaction<Proven extends boolean, Signed extends boolean> = TransactionCommon & {
    send(): PendingTransactionPromise;
    /**
     * Sends the {@link Transaction} to the network. Unlike the standard {@link Transaction.send}, this function does not throw an error if internal errors are detected. Instead, it returns a {@link PendingTransaction} if the transaction is successfully sent for processing or a {@link RejectedTransaction} if it encounters errors during processing or is outright rejected by the Mina daemon.
     * @returns {Promise<PendingTransaction | RejectedTransaction>} A promise that resolves to a {@link PendingTransaction} if the transaction is accepted for processing, or a {@link RejectedTransaction} if the transaction fails or is rejected.
     * @example
     * ```ts
     * const result = await transaction.safeSend();
     * if (result.status === 'pending') {
     *   console.log('Transaction sent successfully to the Mina daemon.');
     * } else if (result.status === 'rejected') {
     *   console.error('Transaction failed with errors:', result.errors);
     * }
     * ```
     */
    safeSend(): Promise<PendingTransaction | RejectedTransaction>;
} & (Proven extends false ? {
    /**
     * Initiates the proof generation process for the {@link Transaction}. This asynchronous operation is
     * crucial for zero-knowledge-based transactions, where proofs are required to validate state transitions.
     * This can take some time.
     * @example
     * ```ts
     * await transaction.prove();
     * ```
     */
    prove(): Promise<Transaction<true, Signed>>;
} : {
    /** The proofs generated as the result of calling `prove`. */
    proofs: (Proof<ZkappPublicInput, Empty> | undefined)[];
}) & (Signed extends false ? {
    /**
     * Signs all {@link AccountUpdate}s included in the {@link Transaction} that require a signature.
     * {@link AccountUpdate}s that require a signature can be specified with `{AccountUpdate|SmartContract}.requireSignature()`.
     * @param privateKeys The list of keys that should be used to sign the {@link Transaction}
     * @returns The {@link Transaction} instance with all required signatures applied.
     * @example
     * ```ts
     * const signedTx = transaction.sign([userPrivateKey]);
     * console.log('Transaction signed successfully.');
     * ```
     */
    sign(privateKeys: PrivateKey[]): Transaction<Proven, true>;
} : {});
type PendingTransactionStatus = 'pending' | 'rejected';
/**
 * Represents a transaction that has been submitted to the blockchain but has not yet reached a final state.
 * The {@link PendingTransaction} type extends certain functionalities from the base {@link Transaction} type,
 * adding methods to monitor the transaction's progress towards being finalized (either included in a block or rejected).
 */
type PendingTransaction = Pick<TransactionCommon, 'transaction' | 'toJSON' | 'toPretty'> & {
    /**
     * @property {PendingTransactionStatus} status The status of the transaction after being sent to the Mina daemon.
     * This property indicates the transaction's initial processing status but does not guarantee its eventual inclusion in a block.
     * A status of `pending` suggests the transaction was accepted by the Mina daemon for processing,
     * whereas a status of `rejected` indicates that the transaction was not accepted.
     * Use the {@link PendingTransaction.wait()} or {@link PendingTransaction.safeWait()} methods to track the transaction's progress towards finalization and to determine whether it's included in a block.
     * @example
     * ```ts
     * if (pendingTransaction.status === 'pending') {
     *   console.log('Transaction accepted for processing by the Mina daemon.');
     *   try {
     *     await pendingTransaction.wait();
     *     console.log('Transaction successfully included in a block.');
     *   } catch (error) {
     *     console.error('Transaction was rejected or failed to be included in a block:', error);
     *   }
     * } else {
     *   console.error('Transaction was not accepted for processing by the Mina daemon.');
     * }
     * ```
     */
    status: PendingTransactionStatus;
    /**
     * Waits for the transaction to be included in a block. This method polls the Mina daemon to check the transaction's status, and throws an error if the transaction is rejected.
     * @param {Object} [options] Configuration options for polling behavior.
     * @param {number} [options.maxAttempts] The maximum number of attempts to check the transaction status.
     * @param {number} [options.interval] The interval, in milliseconds, between status checks.
     * @returns {Promise<IncludedTransaction>} A promise that resolves to the transaction's final state or throws an error.
     * @throws {Error} If the transaction is rejected or fails to finalize within the given attempts.
     * @example
     * ```ts
     * try {
     *   const transaction = await pendingTransaction.wait({ maxAttempts: 10, interval: 2000 });
     *   console.log('Transaction included in a block.');
     * } catch (error) {
     *   console.error('Transaction rejected or failed to finalize:', error);
     * }
     * ```
     */
    wait(options?: {
        maxAttempts?: number;
        interval?: number;
    }): Promise<IncludedTransaction>;
    /**
     * Waits for the transaction to be included in a block. This method polls the Mina daemon to check the transaction's status
     * @param {Object} [options] Configuration options for polling behavior.
     * @param {number} [options.maxAttempts] The maximum number of polling attempts.
     * @param {number} [options.interval] The time interval, in milliseconds, between each polling attempt.
     * @returns {Promise<IncludedTransaction | RejectedTransaction>} A promise that resolves to the transaction's final state.
     * @example
     * ```ts
     * const transaction = await pendingTransaction.wait({ maxAttempts: 5, interval: 1000 });
     * console.log(transaction.status); // 'included' or 'rejected'
     * ```
     */
    safeWait(options?: {
        maxAttempts?: number;
        interval?: number;
    }): Promise<IncludedTransaction | RejectedTransaction>;
    /**
     * Returns the transaction hash as a string identifier.
     * @property {string} The hash of the transaction.
     * @example
     * ```ts
     * const txHash = pendingTransaction.hash;
     * console.log(`Transaction hash: ${txHash}`);
     * ```
     */
    hash: string;
    /**
     * Optional. Contains response data from a ZkApp transaction submission.
     *
     * @property {SendZkAppResponse} [data] The response data from the transaction submission.
     */
    data?: SendZkAppResponse;
    /**
     * An array of error messages related to the transaction processing.
     *
     * @property {string[]} errors Descriptive error messages if the transaction encountered issues during processing.
     * @example
     * ```ts
     * if (!pendingTransaction.status === 'rejected') {
     *   console.error(`Transaction errors: ${pendingTransaction.errors.join(', ')}`);
     * }
     * ```
     */
    errors: string[];
};
/**
 * Represents a transaction that has been successfully included in a block.
 */
type IncludedTransaction = Pick<PendingTransaction, 'transaction' | 'toJSON' | 'toPretty' | 'hash' | 'data'> & {
    /**
     * @property {string} status The final status of the transaction, indicating successful inclusion in a block.
     * @example
     * ```ts
     * try {
     *   const includedTx: IncludedTransaction = await pendingTransaction.wait();
     *   // If wait() resolves, it means the transaction was successfully included.
     *   console.log(`Transaction ${includedTx.hash} included in a block.`);
     * } catch (error) {
     *   // If wait() throws, the transaction was not included in a block.
     *   console.error('Transaction failed to be included in a block:', error);
     * }
     * ```
     */
    status: 'included';
};
/**
 * Represents a transaction that has been rejected and not included in a blockchain block.
 */
type RejectedTransaction = Pick<PendingTransaction, 'transaction' | 'toJSON' | 'toPretty' | 'hash' | 'data'> & {
    /**
     * @property {string} status The final status of the transaction, specifically indicating that it has been rejected.
     * @example
     * ```ts
     * try {
     *   const txResult = await pendingTransaction.wait();
     *   // This line will not execute if the transaction is rejected, as `.wait()` will throw an error instead.
     *   console.log(`Transaction ${txResult.hash} was successfully included in a block.`);
     * } catch (error) {
     *   console.error(`Transaction ${error.transaction.hash} was rejected.`);
     *   error.errors.forEach((error, i) => {
     *    console.error(`Error ${i + 1}: ${error}`);
     *   });
     * }
     * ```
     */
    status: 'rejected';
    /**
     * @property {string[]} errors An array of error messages detailing the reasons for the transaction's rejection.
     */
    errors: string[];
};
/**
 * A `Promise<Transaction>` with some additional methods for making chained method calls
 * into the pending value upon its resolution.
 */
type TransactionPromise<Proven extends boolean, Signed extends boolean> = Promise<Transaction<Proven, Signed>> & {
    /** Equivalent to calling the resolved `Transaction`'s `send` method. */
    send(): PendingTransactionPromise;
} & (Proven extends false ? {
    /**
     * Calls `prove` upon resolution of the `Transaction`. Returns a
     * new `TransactionPromise` with the field `proofPromise` containing
     * a promise which resolves to the proof array.
     */
    prove(): TransactionPromise<true, Signed>;
} : {
    /**
     * If the chain of method calls that produced the current `TransactionPromise`
     * contains a `prove` call, then this field contains a promise resolving to the
     * proof array which was output from the underlying `prove` call.
     */
    proofs(): Promise<Transaction<true, Signed>['proofs']>;
}) & (Signed extends false ? {
    /** Equivalent to calling the resolved `Transaction`'s `sign` method. */
    sign(...args: Parameters<Transaction<Proven, Signed>['sign']>): TransactionPromise<Proven, true>;
} : {});
declare function toTransactionPromise<Proven extends boolean, Signed extends boolean>(getPromise: () => Promise<Transaction<Proven, Signed>>): TransactionPromise<Proven, Signed>;
/**
 * A `Promise<PendingTransaction>` with an additional `wait` method, which calls
 * into the inner `TransactionStatus`'s `wait` method upon its resolution.
 */
type PendingTransactionPromise = Promise<PendingTransaction> & {
    /** Equivalent to calling the resolved `PendingTransaction`'s `wait` method. */
    wait: PendingTransaction['wait'];
};
declare function toPendingTransactionPromise(getPromise: () => Promise<PendingTransaction>): PendingTransactionPromise;
declare function createTransaction(feePayer: FeePayerSpec, f: () => Promise<unknown>, numberOfRuns: 0 | 1 | undefined, { fetchMode, isFinalRunOutsideCircuit, proofsEnabled, }?: {
    fetchMode?: FetchMode | undefined;
    isFinalRunOutsideCircuit?: boolean | undefined;
    proofsEnabled?: boolean | undefined;
}): Promise<Transaction<false, false>>;
declare function newTransaction(transaction: ZkappCommand, proofsEnabled?: boolean): Transaction<false, false>;
/**
 * Construct a smart contract transaction. Within the callback passed to this function,
 * you can call into the methods of smart contracts.
 *
 * ```
 * let tx = await Mina.transaction(sender, async () => {
 *   await myZkapp.update();
 *   await someOtherZkapp.someOtherMethod();
 * });
 * ```
 *
 * @return A transaction that can subsequently be submitted to the chain.
 */
declare function transaction(sender: FeePayerSpec, f: () => Promise<void>): TransactionPromise<false, false>;
declare function transaction(f: () => Promise<void>): TransactionPromise<false, false>;
declare function sendTransaction(txn: Transaction<boolean, boolean>): Promise<PendingTransaction>;
/**
 * @return The account data associated to the given public key.
 */
declare function getAccount(publicKey: PublicKey, tokenId?: Field): Account;
declare function createRejectedTransaction({ transaction, data, toJSON, toPretty, hash, }: Omit<PendingTransaction, 'wait' | 'safeWait'>, errors: string[]): RejectedTransaction;
declare function createIncludedTransaction({ transaction, data, toJSON, toPretty, hash, }: Omit<PendingTransaction, 'wait' | 'safeWait'>): IncludedTransaction;
