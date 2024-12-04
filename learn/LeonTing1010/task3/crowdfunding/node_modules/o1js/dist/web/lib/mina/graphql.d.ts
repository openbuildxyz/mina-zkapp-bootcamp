import { UInt32 } from '../provable/int.js';
import type { ZkappCommand } from './account-update.js';
import type { ActionStatesStringified } from './fetch.js';
import { Types } from '../../bindings/mina-transaction/types.js';
export { type EpochData, type LastBlockQueryResponse, type GenesisConstantsResponse, type FailureReasonResponse, type LastBlockQueryFailureCheckResponse, type FetchedAction, type FetchedBlock, type TransactionStatus, type TransactionStatusQueryResponse, type EventQueryResponse, type ActionQueryResponse, type EventActionFilterOptions, type SendZkAppResponse, type FetchedAccount, type FetchedAccountResponse, type CurrentSlotResponse, getEventsQuery, getActionsQuery, sendZkappQuery, transactionStatusQuery, lastBlockQueryFailureCheck, accountQuery, currentSlotQuery, genesisConstantsQuery, lastBlockQuery, removeJsonQuotes, };
declare function removeJsonQuotes(json: string): string;
type AuthRequired = Types.Json.AuthRequired;
type FetchedAccount = {
    publicKey: string;
    token: string;
    nonce: string;
    balance: {
        total: string;
    };
    tokenSymbol: string | null;
    receiptChainHash: string | null;
    timing: {
        initialMinimumBalance: string | null;
        cliffTime: string | null;
        cliffAmount: string | null;
        vestingPeriod: string | null;
        vestingIncrement: string | null;
    };
    permissions: {
        editState: AuthRequired;
        access: AuthRequired;
        send: AuthRequired;
        receive: AuthRequired;
        setDelegate: AuthRequired;
        setPermissions: AuthRequired;
        setVerificationKey: {
            auth: AuthRequired;
            txnVersion: string;
        };
        setZkappUri: AuthRequired;
        editActionState: AuthRequired;
        setTokenSymbol: AuthRequired;
        incrementNonce: AuthRequired;
        setVotingFor: AuthRequired;
        setTiming: AuthRequired;
    } | null;
    delegateAccount: {
        publicKey: string;
    } | null;
    votingFor: string | null;
    zkappState: string[] | null;
    verificationKey: {
        verificationKey: string;
        hash: string;
    } | null;
    actionState: string[] | null;
    provedState: boolean | null;
    zkappUri: string | null;
};
type FetchedAccountResponse = {
    account: FetchedAccount;
};
type EpochData = {
    ledger: {
        hash: string;
        totalCurrency: string;
    };
    seed: string;
    startCheckpoint: string;
    lockCheckpoint: string;
    epochLength: string;
};
type LastBlockQueryResponse = {
    bestChain: {
        protocolState: {
            blockchainState: {
                snarkedLedgerHash: string;
                stagedLedgerHash: string;
                date: string;
                utcDate: string;
                stagedLedgerProofEmitted: boolean;
            };
            previousStateHash: string;
            consensusState: {
                blockHeight: string;
                slotSinceGenesis: string;
                slot: string;
                nextEpochData: EpochData;
                stakingEpochData: EpochData;
                epochCount: string;
                minWindowDensity: string;
                totalCurrency: string;
                epoch: string;
            };
        };
    }[];
};
type FailureReasonResponse = {
    failures: string[];
    index: number;
}[];
type LastBlockQueryFailureCheckResponse = {
    bestChain: {
        transactions: {
            zkappCommands: {
                hash: string;
                failureReason: FailureReasonResponse;
            }[];
        };
    }[];
};
type FetchedBlock = {
    protocolState: {
        blockchainState: {
            snarkedLedgerHash: string;
            stagedLedgerHash: string;
            date: string;
            utcDate: string;
            stagedLedgerProofEmitted: boolean;
        };
        previousStateHash: string;
        consensusState: {
            blockHeight: string;
            slotSinceGenesis: string;
            slot: string;
            nextEpochData: {
                ledger: {
                    hash: string;
                    totalCurrency: string;
                };
                seed: string;
                startCheckpoint: string;
                lockCheckpoint: string;
                epochLength: string;
            };
            stakingEpochData: {
                ledger: {
                    hash: string;
                    totalCurrency: string;
                };
                seed: string;
                startCheckpoint: string;
                lockCheckpoint: string;
                epochLength: string;
            };
            epochCount: string;
            minWindowDensity: string;
            totalCurrency: string;
            epoch: string;
        };
    };
};
type GenesisConstantsResponse = {
    genesisConstants: {
        genesisTimestamp: string;
        coinbase: string;
        accountCreationFee: string;
    };
    daemonStatus: {
        consensusConfiguration: {
            epochDuration: string;
            k: string;
            slotDuration: string;
            slotsPerEpoch: string;
        };
    };
};
type CurrentSlotResponse = {
    bestChain: Array<{
        protocolState: {
            consensusState: {
                slot: number;
            };
        };
    }>;
};
/**
 * INCLUDED: A transaction that is on the longest chain
 *
 * PENDING: A transaction either in the transition frontier or in transaction pool but is not on the longest chain
 *
 * UNKNOWN: The transaction has either been snarked, reached finality through consensus or has been dropped
 *
 */
type TransactionStatus = 'INCLUDED' | 'PENDING' | 'UNKNOWN';
type TransactionStatusQueryResponse = {
    transactionStatus: TransactionStatus;
};
type SendZkAppResponse = {
    sendZkapp: {
        zkapp: {
            hash: string;
            id: string;
            zkappCommand: ZkappCommand;
            failureReasons: FailureReasonResponse;
        };
    };
};
type EventQueryResponse = {
    events: {
        blockInfo: {
            distanceFromMaxBlockHeight: number;
            globalSlotSinceGenesis: number;
            height: number;
            stateHash: string;
            parentHash: string;
            chainStatus: string;
        };
        eventData: {
            transactionInfo: {
                hash: string;
                memo: string;
                status: string;
            };
            data: string[];
        }[];
    }[];
};
type FetchedAction = {
    blockInfo: {
        distanceFromMaxBlockHeight: number;
    };
    actionState: {
        actionStateOne: string;
        actionStateTwo: string;
    };
    actionData: {
        accountUpdateId: string;
        data: string[];
    }[];
};
type ActionQueryResponse = {
    actions: FetchedAction[];
};
type EventActionFilterOptions = {
    to?: UInt32;
    from?: UInt32;
};
declare const transactionStatusQuery: (txId: string) => string;
declare const getEventsQuery: (publicKey: string, tokenId: string, filterOptions?: EventActionFilterOptions) => string;
declare const getActionsQuery: (publicKey: string, actionStates: ActionStatesStringified, tokenId: string, _filterOptions?: EventActionFilterOptions) => string;
declare const genesisConstantsQuery = "{\n    genesisConstants {\n      genesisTimestamp\n      coinbase\n      accountCreationFee\n    }\n    daemonStatus {\n      consensusConfiguration {\n        epochDuration\n        k\n        slotDuration\n        slotsPerEpoch\n      }\n    }\n  }";
declare const lastBlockQuery = "{\n  bestChain(maxLength: 1) {\n    protocolState {\n      blockchainState {\n        snarkedLedgerHash\n        stagedLedgerHash\n        date\n        utcDate\n        stagedLedgerProofEmitted\n      }\n      previousStateHash\n      consensusState {\n        blockHeight\n        slotSinceGenesis\n        slot\n        nextEpochData {\n          ledger {hash totalCurrency}\n          seed\n          startCheckpoint\n          lockCheckpoint\n          epochLength\n        }\n        stakingEpochData {\n          ledger {hash totalCurrency}\n          seed\n          startCheckpoint\n          lockCheckpoint\n          epochLength\n        }\n        epochCount\n        minWindowDensity\n        totalCurrency\n        epoch\n      }\n    }\n  }\n}";
declare const lastBlockQueryFailureCheck: (length: number) => string;
declare function sendZkappQuery(json: string): string;
declare const accountQuery: (publicKey: string, tokenId: string) => string;
declare const currentSlotQuery = "{\n    bestChain(maxLength: 1) {\n      protocolState {\n        consensusState {\n          slot\n        }\n      }\n    }\n}";
