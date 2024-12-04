import { SignedLegacy } from './transaction-hash.js';
import { DelegationJson, PaymentJson } from './sign-legacy.js';
import { Random } from '../../lib/testing/property.js';
import { ZkappCommand } from '../../bindings/mina-transaction/gen/transaction-bigint.js';
import { NetworkId } from './types.js';
export { RandomTransaction };
declare const RandomTransaction: {
    payment: Random<PaymentJson>;
    delegation: Random<DelegationJson>;
    signedPayment: Random<SignedLegacy<PaymentJson>>;
    signedDelegation: Random<SignedLegacy<DelegationJson>>;
    zkappCommand: Random<ZkappCommand>;
    zkappCommandAndFeePayerKey: Random<{
        feePayerKey: bigint;
        zkappCommand: ZkappCommand;
    }>;
    zkappCommandJson: Random<{
        feePayer: {
            body: {
                publicKey: string;
                fee: string;
                validUntil: string | null;
                nonce: string;
            };
            authorization: string;
        };
        accountUpdates: import("src/bindings/mina-transaction/gen/transaction-json.js").AccountUpdate[];
        memo: string;
    }>;
    networkId: Random<NetworkId>;
    accountUpdateWithCallDepth: Random<import("../../bindings/mina-transaction/gen/transaction-bigint.js").AccountUpdate>;
};
