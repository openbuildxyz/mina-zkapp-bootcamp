import 'isomorphic-fetch';
import { Field } from '../provable/wrapped.js';
import { UInt32, UInt64 } from '../provable/int.js';
import { PublicKey, PrivateKey } from '../provable/crypto/signature.js';
import { Types } from '../../bindings/mina-transaction/types.js';
import { ActionStates } from './mina.js';
import { Account, parseFetchedAccount, PartialAccount } from './account.js';
import { type FetchedAction, type TransactionStatus, type EventActionFilterOptions, type SendZkAppResponse } from './graphql.js';
export { fetchAccount, fetchLastBlock, fetchGenesisConstants, fetchCurrentSlot, checkZkappTransaction, parseFetchedAccount, markAccountToBeFetched, markNetworkToBeFetched, markActionsToBeFetched, fetchMissingData, fetchTransactionStatus, getCachedAccount, getCachedNetwork, getCachedActions, getCachedGenesisConstants, addCachedAccount, networkConfig, setGraphqlEndpoint, setGraphqlEndpoints, setMinaGraphqlFallbackEndpoints, setArchiveGraphqlEndpoint, setArchiveGraphqlFallbackEndpoints, setLightnetAccountManagerEndpoint, sendZkapp, fetchEvents, fetchActions, makeGraphqlRequest, Lightnet, type GenesisConstants, type ActionStatesStringified, };
type ActionsQueryInputs = {
    publicKey: string;
    actionStates: ActionStatesStringified;
    tokenId?: string;
};
declare let networkConfig: {
    minaEndpoint: string;
    minaFallbackEndpoints: string[];
    archiveEndpoint: string;
    archiveFallbackEndpoints: string[];
    lightnetAccountManagerEndpoint: string;
};
declare function setGraphqlEndpoints([graphqlEndpoint, ...fallbackEndpoints]: string[]): void;
declare function setGraphqlEndpoint(graphqlEndpoint: string): void;
declare function setMinaGraphqlFallbackEndpoints(graphqlEndpoints: string[]): void;
/**
 * Sets up a GraphQL endpoint to be used for fetching information from an Archive Node.
 *
 * @param A GraphQL endpoint.
 */
declare function setArchiveGraphqlEndpoint(graphqlEndpoint: string): void;
declare function setArchiveGraphqlFallbackEndpoints(graphqlEndpoints: string[]): void;
/**
 * Sets up the lightnet account manager endpoint to be used for accounts acquisition and releasing.
 *
 * @param endpoint Account manager endpoint.
 */
declare function setLightnetAccountManagerEndpoint(endpoint: string): void;
/**
 * Gets account information on the specified publicKey by performing a GraphQL query
 * to the specified endpoint. This will call the 'GetAccountInfo' query which fetches
 * zkapp related account information.
 *
 * If an error is returned by the specified endpoint, an error is thrown. Otherwise,
 * the data is returned.
 *
 * @param publicKey The specified publicKey to get account information on
 * @param tokenId The specified tokenId to get account information on
 * @param graphqlEndpoint The graphql endpoint to fetch from
 * @param config An object that exposes an additional timeout option
 * @returns zkapp information on the specified account or an error is thrown
 */
declare function fetchAccount(accountInfo: {
    publicKey: string | PublicKey;
    tokenId?: string | Field;
}, graphqlEndpoint?: string, { timeout }?: {
    timeout?: number | undefined;
}): Promise<{
    account: Types.Account;
    error: undefined;
} | {
    account: undefined;
    error: FetchError;
}>;
type FetchConfig = {
    timeout?: number;
};
type FetchResponse<TDataResponse = any> = {
    data: TDataResponse;
    errors?: any;
};
type FetchError = {
    statusCode: number;
    statusText: string;
};
type ActionStatesStringified = {
    [K in keyof ActionStates]: string;
};
type GenesisConstants = {
    genesisTimestamp: string;
    coinbase: number;
    accountCreationFee: number;
    epochDuration: number;
    k: number;
    slotDuration: number;
    slotsPerEpoch: number;
};
declare function markAccountToBeFetched(publicKey: PublicKey, tokenId: Field, graphqlEndpoint: string): void;
declare function markNetworkToBeFetched(graphqlEndpoint: string): void;
declare function markActionsToBeFetched(publicKey: PublicKey, tokenId: Field, graphqlEndpoint: string, actionStates?: ActionStates): void;
declare function fetchMissingData(graphqlEndpoint: string, archiveEndpoint?: string): Promise<void>;
declare function getCachedAccount(publicKey: PublicKey, tokenId: Field, graphqlEndpoint?: string): Account | undefined;
declare function getCachedNetwork(graphqlEndpoint?: string): {
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
declare function getCachedActions(publicKey: PublicKey, tokenId: Field, graphqlEndpoint?: string): {
    hash: string;
    actions: string[][];
}[];
declare function getCachedGenesisConstants(graphqlEndpoint?: string): GenesisConstants;
/**
 * Adds an account to the local cache, indexed by a GraphQL endpoint.
 */
declare function addCachedAccount(partialAccount: PartialAccount, graphqlEndpoint?: string): void;
/**
 * Fetches the last block on the Mina network.
 */
declare function fetchLastBlock(graphqlEndpoint?: string): Promise<{
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
}>;
declare function fetchCurrentSlot(graphqlEndpoint?: string): Promise<number>;
declare function checkZkappTransaction(transactionHash: string, blockLength?: number): Promise<{
    success: boolean;
    failureReason: string[][][];
} | {
    success: boolean;
    failureReason: null;
}>;
/**
 * Fetches the status of a transaction.
 */
declare function fetchTransactionStatus(txId: string, graphqlEndpoint?: string): Promise<TransactionStatus>;
/**
 * Sends a zkApp command (transaction) to the specified GraphQL endpoint.
 */
declare function sendZkapp(json: string, graphqlEndpoint?: string, { timeout }?: {
    timeout?: number | undefined;
}): Promise<[undefined, FetchError] | [FetchResponse<SendZkAppResponse>, undefined]>;
/**
 * Asynchronously fetches event data for an account from the Mina Archive Node GraphQL API.
 * @async
 * @param accountInfo - The account information object.
 * @param accountInfo.publicKey - The account public key.
 * @param [accountInfo.tokenId] - The optional token ID for the account.
 * @param [graphqlEndpoint=networkConfig.archiveEndpoint] - The GraphQL endpoint to query. Defaults to the Archive Node GraphQL API.
 * @param [filterOptions={}] - The optional filter options object.
 * @returns A promise that resolves to an array of objects containing event data, block information and transaction information for the account.
 * @throws If the GraphQL request fails or the response is invalid.
 * @example
 * const accountInfo = { publicKey: 'B62qiwmXrWn7Cok5VhhB3KvCwyZ7NHHstFGbiU5n7m8s2RqqNW1p1wF' };
 * const events = await fetchEvents(accountInfo);
 * console.log(events);
 */
declare function fetchEvents(accountInfo: {
    publicKey: string;
    tokenId?: string;
}, graphqlEndpoint?: string, filterOptions?: EventActionFilterOptions): Promise<{
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
declare function fetchActions(accountInfo: ActionsQueryInputs, graphqlEndpoint?: string): Promise<{
    actions: string[][];
    hash: string;
}[] | {
    error: {
        statusCode: number;
        statusText: string;
    };
}>;
/**
 * Given a graphQL response from #getActionsQuery, process the actions into a canonical actions list
 */
export declare function createActionsList(accountInfo: ActionsQueryInputs, fetchedActions: FetchedAction[]): {
    actions: string[][];
    hash: string;
}[];
/**
 * Fetches genesis constants.
 */
declare function fetchGenesisConstants(graphqlEndpoint?: string): Promise<GenesisConstants>;
declare namespace Lightnet {
    /**
     * Gets random key pair (public and private keys) from account manager
     * that operates with accounts configured in target network Genesis Ledger.
     *
     * If an error is returned by the specified endpoint, an error is thrown. Otherwise,
     * the data is returned.
     *
     * @param options.isRegularAccount Whether to acquire key pair of regular or zkApp account (one with already configured verification key)
     * @param options.lightnetAccountManagerEndpoint Account manager endpoint to fetch from
     * @returns Key pair
     */
    function acquireKeyPair(options?: {
        isRegularAccount?: boolean;
        lightnetAccountManagerEndpoint?: string;
    }): Promise<{
        publicKey: PublicKey;
        privateKey: PrivateKey;
    }>;
    /**
     * Releases previously acquired key pair by public key.
     *
     * @param options.publicKey Public key of previously acquired key pair to release
     * @param options.lightnetAccountManagerEndpoint Account manager endpoint to fetch from
     * @returns Response message from the account manager as string or null if the request failed
     */
    function releaseKeyPair(options: {
        publicKey: string;
        lightnetAccountManagerEndpoint?: string;
    }): Promise<string | null>;
    /**
     * Gets previously acquired key pairs list.
     *
     * @param options.lightnetAccountManagerEndpoint Account manager endpoint to fetch from
     * @returns Key pairs list or null if the request failed
     */
    function listAcquiredKeyPairs(options: {
        lightnetAccountManagerEndpoint?: string;
    }): Promise<Array<{
        publicKey: PublicKey;
        privateKey: PrivateKey;
    }> | null>;
}
declare function makeGraphqlRequest<TDataResponse = any>(query: string, graphqlEndpoint: string | undefined, fallbackEndpoints: string[], { timeout }?: FetchConfig): Promise<[undefined, FetchError] | [FetchResponse<TDataResponse>, undefined]>;
