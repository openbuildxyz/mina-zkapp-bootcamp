import { Bool } from '../../provable/wrapped.js';
import { UInt64 } from '../../provable/int.js';
import { PublicKey } from '../../provable/crypto/signature.js';
import { AccountUpdate, AccountUpdateForest, AccountUpdateTree } from '../account-update.js';
import { DeployArgs, SmartContract } from '../zkapp.js';
export { TokenContract };
/**
 *
 * Base token contract which
 * - implements the `Approvable` API, with the `approveBase()` method left to be defined by subclasses
 * - implements the `Transferable` API as a wrapper around the `Approvable` API
 */
declare abstract class TokenContract extends SmartContract {
    /** The maximum number of account updates using the token in a single
     * transaction that this contract supports. */
    static MAX_ACCOUNT_UPDATES: number;
    /**
     * Deploys a {@link TokenContract}.
     *
     * In addition to base smart contract deployment, this adds two steps:
     * - set the `access` permission to `proofOrSignature()`, to prevent against unauthorized token operations
     *   - not doing this would imply that anyone can bypass token contract authorization and simply mint themselves tokens
     * - require the zkapp account to be new, using the `isNew` precondition.
     *   this guarantees that the access permission is set from the very start of the existence of this account.
     *   creating the zkapp account before deployment would otherwise be a security vulnerability that is too easy to introduce.
     *
     * Note that because of the `isNew` precondition, the zkapp account must not be created prior to calling `deploy()`.
     *
     * If the contract needs to be re-deployed, you can switch off this behaviour by overriding the `isNew` precondition:
     * ```ts
     * async deploy() {
     *   await super.deploy();
     *   // DON'T DO THIS ON THE INITIAL DEPLOYMENT!
     *   this.account.isNew.requireNothing();
     * }
     * ```
     */
    deploy(args?: DeployArgs): Promise<void>;
    /**
     * Returns the `tokenId` of the token managed by this contract.
     */
    deriveTokenId(): import("../../provable/field.js").Field;
    /**
     * Helper methods to use from within a token contract.
     */
    get internal(): {
        mint({ address, amount, }: {
            address: PublicKey | AccountUpdate | SmartContract;
            amount: number | bigint | UInt64;
        }): AccountUpdate;
        burn({ address, amount, }: {
            address: PublicKey | AccountUpdate | SmartContract;
            amount: number | bigint | UInt64;
        }): AccountUpdate;
        send({ from, to, amount, }: {
            from: PublicKey | AccountUpdate | SmartContract;
            to: PublicKey | AccountUpdate | SmartContract;
            amount: number | bigint | UInt64;
        }): AccountUpdate;
    };
    abstract approveBase(forest: AccountUpdateForest): Promise<void>;
    /**
     * Iterate through the account updates in `updates` and apply `callback` to each.
     *
     * This method is provable and is suitable as a base for implementing `approveUpdates()`.
     */
    forEachUpdate(updates: AccountUpdateForest, callback: (update: AccountUpdate, usesToken: Bool) => void): void;
    /**
     * Use `forEachUpdate()` to prove that the total balance change of child account updates is zero.
     *
     * This is provided out of the box as it is both a good example, and probably the most common implementation, of `approveBase()`.
     */
    checkZeroBalanceChange(updates: AccountUpdateForest): void;
    /**
     * Approve a single account update (with arbitrarily many children).
     */
    approveAccountUpdate(accountUpdate: AccountUpdate | AccountUpdateTree): Promise<void>;
    /**
     * Approve a list of account updates (with arbitrarily many children).
     */
    approveAccountUpdates(accountUpdates: (AccountUpdate | AccountUpdateTree)[]): Promise<void>;
    /**
     * Transfer `amount` of tokens from `from` to `to`.
     */
    transfer(from: PublicKey | AccountUpdate, to: PublicKey | AccountUpdate, amount: UInt64 | number | bigint): Promise<void>;
}
