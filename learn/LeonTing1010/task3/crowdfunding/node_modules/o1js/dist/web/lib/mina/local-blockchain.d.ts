import { Field } from '../provable/wrapped.js';
import { UInt32, UInt64 } from '../provable/int.js';
import { PrivateKey, PublicKey } from '../provable/crypto/signature.js';
import { Account } from './account.js';
import { NetworkId } from '../../mina-signer/src/types.js';
import { TupleN } from '../util/types.js';
import { Transaction, PendingTransactionPromise } from './transaction.js';
import { type FeePayerSpec, type ActionStates } from './mina-instance.js';
export { LocalBlockchain, TestPublicKey };
type TestPublicKey = PublicKey & {
    key: PrivateKey;
};
declare function TestPublicKey(key: PrivateKey): TestPublicKey;
declare namespace TestPublicKey {
    function random<N extends number = 1>(count?: N): N extends 1 ? TestPublicKey : TupleN<TestPublicKey, N>;
    function fromBase58(base58: string): TestPublicKey;
}
/**
 * A mock Mina blockchain running locally and useful for testing.
 */
declare function LocalBlockchain({ proofsEnabled, enforceTransactionLimits, }?: {
    proofsEnabled?: boolean | undefined;
    enforceTransactionLimits?: boolean | undefined;
}): Promise<{
    getNetworkId: () => NetworkId;
    proofsEnabled: boolean;
    getNetworkConstants(): {
        genesisTimestamp: UInt64;
        slotTime: UInt64;
        accountCreationFee: UInt64;
    };
    currentSlot(): UInt32;
    hasAccount(publicKey: PublicKey, tokenId?: Field): boolean;
    getAccount(publicKey: PublicKey, tokenId?: Field): Account;
    getNetworkState(): {
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
    sendTransaction(txn: Transaction<boolean, boolean>): PendingTransactionPromise;
    transaction(sender: FeePayerSpec, f: () => Promise<void>): import("./transaction.js").TransactionPromise<false, false>;
    applyJsonTransaction(json: string): void;
    fetchEvents(publicKey: PublicKey, tokenId?: Field): Promise<any>;
    fetchActions(publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field): Promise<{
        hash: string;
        actions: string[][];
    }[]>;
    getActions(publicKey: PublicKey, actionStates?: ActionStates, tokenId?: Field): {
        hash: string;
        actions: string[][];
    }[];
    addAccount: (publicKey: PublicKey, balance: string) => void;
    /**
     * An array of 10 test accounts that have been pre-filled with
     * 30000000000 units of currency.
     */
    testAccounts: [TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey, TestPublicKey];
    setGlobalSlot(slot: UInt32 | number): void;
    incrementGlobalSlot(increment: UInt32 | number): void;
    setBlockchainLength(height: UInt32): void;
    setTotalCurrency(currency: UInt64): void;
    setProofsEnabled(newProofsEnabled: boolean): void;
    resetProofsEnabled(): void;
}>;
