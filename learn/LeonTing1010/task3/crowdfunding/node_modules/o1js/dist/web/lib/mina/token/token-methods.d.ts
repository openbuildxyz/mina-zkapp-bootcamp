import { AccountUpdate } from '../account-update.js';
import { PublicKey } from '../../provable/crypto/signature.js';
import type { SmartContract } from '../zkapp.js';
import { UInt64 } from '../../provable/int.js';
export { tokenMethods };
declare function tokenMethods(self: AccountUpdate): {
    /**
     * Mints token balance to `address`. Returns the mint account update.
     */
    mint({ address, amount, }: {
        address: PublicKey | AccountUpdate | SmartContract;
        amount: number | bigint | UInt64;
    }): AccountUpdate;
    /**
     * Burn token balance on `address`. Returns the burn account update.
     */
    burn({ address, amount, }: {
        address: PublicKey | AccountUpdate | SmartContract;
        amount: number | bigint | UInt64;
    }): AccountUpdate;
    /**
     * Move token balance from `from` to `to`. Returns the `to` account update.
     */
    send({ from, to, amount, }: {
        from: PublicKey | AccountUpdate | SmartContract;
        to: PublicKey | AccountUpdate | SmartContract;
        amount: number | bigint | UInt64;
    }): AccountUpdate;
};
