/**
 * Apply transactions to a ledger of accounts.
 */
import { type AccountUpdate } from '../account-update.js';
import { Account } from '../account.js';
export { applyAccountUpdate };
/**
 * Apply a single account update to update an account.
 *
 * TODO:
 * - This must receive and return some context global to the transaction, to check validity
 * - Should operate on the value / bigint type, not the provable type
 */
declare function applyAccountUpdate(account: Account, update: AccountUpdate): Account;
