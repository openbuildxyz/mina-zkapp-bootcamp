/**
 * This module holds the global Mina instance and its interface.
 */
import { Field } from '../provable/wrapped.js';
import { UInt64, UInt32 } from '../provable/int.js';
import { PublicKey } from '../provable/crypto/signature.js';
import type { EventActionFilterOptions } from '././../mina/graphql.js';
import type { NetworkId } from '../../mina-signer/src/types.js';
import type { Account } from './account.js';
import type { NetworkValue } from './precondition.js';
import type * as Fetch from './fetch.js';
import type { TransactionPromise, PendingTransactionPromise, Transaction } from './transaction.js';
export { Mina, FeePayerSpec, ActionStates, NetworkConstants, defaultNetworkConstants, activeInstance, setActiveInstance, ZkappStateLength, currentSlot, getAccount, hasAccount, getBalance, getNetworkId, getNetworkConstants, getNetworkState, fetchEvents, fetchActions, getActions, getProofsEnabled, };
declare const defaultNetworkConstants: NetworkConstants;
declare const ZkappStateLength = 8;
/**
 * Allows you to specify information about the fee payer account and the transaction.
 */
type FeePayerSpec = PublicKey | {
    sender: PublicKey;
    fee?: number | string | UInt64;
    memo?: string;
    nonce?: number;
} | undefined;
type ActionStates = {
    fromActionState?: Field;
    endActionState?: Field;
};
type NetworkConstants = {
    genesisTimestamp: UInt64;
    /**
     * Duration of 1 slot in millisecondw
     */
    slotTime: UInt64;
    accountCreationFee: UInt64;
};
type Mina = {
    transaction(sender: FeePayerSpec, f: () => Promise<void>): TransactionPromise<false, false>;
    currentSlot(): UInt32;
    hasAccount(publicKey: PublicKey, tokenId?: Field): boolean;
    getAccount(publicKey: PublicKey, tokenId?: Field): Account;
    getNetworkState(): NetworkValue;
    getNetworkConstants(): NetworkConstants;
    sendTransaction(transaction: Transaction<boolean, boolean>): PendingTransactionPromise;
    fetchEvents: (publicKey: PublicKey, tokenId?: Field, filterOptions?: EventActionFilterOptions) => ReturnType<typeof Fetch.fetchEvents>;
    fetchActions: (publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field) => ReturnType<typeof Fetch.fetchActions>;
    getActions: (publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field) => {
        hash: string;
        actions: string[][];
    }[];
    proofsEnabled: boolean;
    getNetworkId(): NetworkId;
};
declare let activeInstance: Mina;
/**
 * Set the currently used Mina instance.
 */
declare function setActiveInstance(m: Mina): void;
/**
 * @return The current slot number, according to the active Mina instance.
 */
declare function currentSlot(): UInt32;
/**
 * @return The account data associated to the given public key.
 */
declare function getAccount(publicKey: PublicKey, tokenId?: Field): Account;
/**
 * Checks if an account exists within the ledger.
 */
declare function hasAccount(publicKey: PublicKey, tokenId?: Field): boolean;
/**
 * @return The current Mina network ID.
 */
declare function getNetworkId(): NetworkId;
/**
 * @return Data associated with the current Mina network constants.
 */
declare function getNetworkConstants(): NetworkConstants;
/**
 * @return Data associated with the current state of the Mina network.
 */
declare function getNetworkState(): {
    snarkedLedgerHash: import("../provable/field.js").Field;
    blockchainLength: UInt32;
    minWindowDensity: UInt32;
    totalCurrency: UInt64;
    globalSlotSinceGenesis: UInt32;
    stakingEpochData: {
        ledger: {
            hash: import("../provable/field.js").Field;
            totalCurrency: UInt64;
        };
        seed: import("../provable/field.js").Field;
        startCheckpoint: import("../provable/field.js").Field;
        lockCheckpoint: import("../provable/field.js").Field;
        epochLength: UInt32;
    };
    nextEpochData: {
        ledger: {
            hash: import("../provable/field.js").Field;
            totalCurrency: UInt64;
        };
        seed: import("../provable/field.js").Field;
        startCheckpoint: import("../provable/field.js").Field;
        lockCheckpoint: import("../provable/field.js").Field;
        epochLength: UInt32;
    };
};
/**
 * @return The balance associated to the given public key.
 */
declare function getBalance(publicKey: PublicKey, tokenId?: Field): UInt64;
/**
 * @return A list of emitted events associated to the given public key.
 */
declare function fetchEvents(publicKey: PublicKey, tokenId: Field, filterOptions?: EventActionFilterOptions): Promise<{
    events: {
        data: string[];
        transactionInfo: {
            hash: string;
            memo: string;
            status: string;
        };
    }[];
    blockHeight: UInt32;
    blockHash: string;
    parentBlockHash: string;
    globalSlot: UInt32;
    chainStatus: string;
}[]>;
/**
 * @return A list of emitted sequencing actions associated to the given public key.
 */
declare function fetchActions(publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field): Promise<{
    actions: string[][];
    hash: string;
}[] | {
    error: {
        statusCode: number;
        statusText: string;
    };
}>;
/**
 * @return A list of emitted sequencing actions associated to the given public key.
 */
declare function getActions(publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field): {
    hash: string;
    actions: string[][];
}[];
declare function getProofsEnabled(): boolean;
