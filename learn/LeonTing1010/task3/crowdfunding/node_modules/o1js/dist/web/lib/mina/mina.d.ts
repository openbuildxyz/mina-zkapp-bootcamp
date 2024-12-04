import { PublicKey } from '../provable/crypto/signature.js';
import { NetworkId } from '../../mina-signer/src/types.js';
import { currentTransaction } from './transaction-context.js';
import { type FeePayerSpec, type ActionStates, type NetworkConstants, activeInstance, setActiveInstance, Mina, currentSlot, getAccount, hasAccount, getBalance, getNetworkId, getNetworkConstants, getNetworkState, fetchEvents, fetchActions, getActions, getProofsEnabled } from './mina-instance.js';
import { Transaction, type PendingTransaction, type IncludedTransaction, type RejectedTransaction, type PendingTransactionStatus, type PendingTransactionPromise, transaction } from './transaction.js';
import { filterGroups } from './transaction-validation.js';
import { LocalBlockchain, TestPublicKey } from './local-blockchain.js';
export { LocalBlockchain, Network, currentTransaction, Transaction, type PendingTransaction, type IncludedTransaction, type RejectedTransaction, type PendingTransactionStatus, type PendingTransactionPromise, TestPublicKey, activeInstance, setActiveInstance, transaction, sender, currentSlot, getAccount, hasAccount, getBalance, getNetworkId, getNetworkConstants, getNetworkState, fetchEvents, fetchActions, getActions, FeePayerSpec, ActionStates, faucet, waitForFunding, getProofsEnabled, filterGroups, type NetworkConstants, };
/**
 * Represents the Mina blockchain running on a real network
 */
declare function Network(graphqlEndpoint: string): Mina;
declare function Network(options: {
    networkId?: NetworkId;
    mina: string | string[];
    archive?: string | string[];
    lightnetAccountManager?: string;
}): Mina;
/**
 * Returns the public key of the current transaction's sender account.
 *
 * Throws an error if not inside a transaction, or the sender wasn't passed in.
 */
declare function sender(): PublicKey;
declare function waitForFunding(address: string): Promise<void>;
/**
 * Requests the [testnet faucet](https://faucet.minaprotocol.com/api/v1/faucet) to fund a public key.
 */
declare function faucet(pub: PublicKey, network?: string): Promise<void>;
