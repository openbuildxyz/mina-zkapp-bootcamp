/**
 * This module holds the global Mina instance and its interface.
 */
import { ZkappCommand, ZkappPublicInput, AccountUpdate } from './account-update.js';
import type { NetworkId } from '../../mina-signer/src/types.js';
import type { Account } from './account.js';
import type { NetworkValue } from './precondition.js';
export { reportGetAccountError, defaultNetworkState, verifyTransactionLimits, verifyAccountUpdate, filterGroups, };
declare function reportGetAccountError(publicKey: string, tokenId: string): string;
declare function defaultNetworkState(): NetworkValue;
declare function verifyTransactionLimits({ accountUpdates }: ZkappCommand): void;
declare function filterGroups(xs: AuthorizationKind[]): {
    signedPair: number;
    signedSingle: number;
    proof: number;
};
declare function verifyAccountUpdate(account: Account, accountUpdate: AccountUpdate, publicInput: ZkappPublicInput, transactionCommitments: {
    commitment: bigint;
    fullCommitment: bigint;
}, proofsEnabled: boolean, networkId: NetworkId): Promise<void>;
type AuthorizationKind = {
    isProved: boolean;
    isSigned: boolean;
};
