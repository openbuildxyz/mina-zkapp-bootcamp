import { Binable } from '../../bindings/lib/binable.js';
import { PublicKey, Scalar } from './curve-bigint.js';
import { Field } from './field-bigint.js';
import { Signature, SignatureJson } from './signature.js';
import { NetworkId, SignedRosetta } from './types.js';
import * as Json from './types.js';
export { publicKeyToHex, signatureFromHex, signatureJsonFromHex, signatureToHex, signatureJsonToHex, fieldFromHex, fieldToHex, rosettaTransactionToSignedCommand, signTransaction, verifyTransaction, rosettaCombineSignature, rosettaCombinePayload, UnsignedPayload, UnsignedTransaction, SignedTransaction, };
declare function publicKeyToHex(publicKey: PublicKey): string;
declare function signatureFromHex(signatureHex: string): Signature;
declare function signatureJsonFromHex(signatureHex: string): SignatureJson;
declare function signatureJsonToHex(signatureJson: SignatureJson): string;
declare function signatureToHex(signature: Signature): string;
declare function fieldToHex<T extends Field | Scalar>(binable: Binable<T>, x: T, paddingBit?: boolean): string;
declare function fieldFromHex<T extends Field | Scalar>(binable: Binable<T>, hex: string): [T, boolean];
declare function signTransaction(transaction: UnsignedTransaction, privateKey: string, network: NetworkId): SignedRosetta<UnsignedTransaction>;
declare function verifyTransaction(signedTransaction: SignedRosetta<UnsignedTransaction>, network: NetworkId): boolean;
declare function rosettaCombineSignature(signature: SignedRosetta<UnsignedTransaction>, signingPayload: unknown): RosettaSignature;
declare function rosettaCombinePayload(unsignedPayload: UnsignedPayload, privateKey: Json.PrivateKey, network: NetworkId): {
    network_identifier: {
        blockchain: string;
        network: NetworkId;
    };
    unsigned_transaction: string;
    signatures: RosettaSignature[];
};
declare function rosettaTransactionToSignedCommand({ signature, payment, stake_delegation, }: SignedTransaction): {
    signature: string;
    signer: string;
    payload: {
        common: {
            fee: string;
            fee_payer_pk: string;
            nonce: string;
            valid_until: string | null;
            memo: string;
        };
        body: (string | {
            source_pk: string;
            receiver_pk: string;
            amount: string;
        })[];
    } | {
        common: {
            fee: string;
            fee_payer_pk: string;
            nonce: string;
            valid_until: string | null;
            memo: string;
        };
        body: (string | (string | {
            delegator: string;
            new_delegate: string;
        })[])[];
    };
};
type UnsignedPayload = {
    unsigned_transaction: string;
    payloads: unknown[];
};
type UnsignedTransaction = {
    randomOracleInput: string;
    signerInput: {
        prefix: string[];
        suffix: string[];
    };
    payment: Payment | null;
    stakeDelegation: StakeDelegation | null;
};
type SignedTransaction = {
    signature: string;
    payment: Payment | null;
    stake_delegation: StakeDelegation | null;
};
type RosettaSignature = {
    hex_bytes: string;
    public_key: {
        hex_bytes: string;
        curve_type: string;
    };
    signature_type: string;
    signing_payload: unknown;
};
type Payment = {
    to: string;
    from: string;
    fee: string;
    token: string;
    nonce: string;
    memo: string | null;
    amount: string;
    valid_until: string | null;
};
type StakeDelegation = {
    delegator: string;
    new_delegate: string;
    fee: string;
    nonce: string;
    memo: string | null;
    valid_until: string | null;
};
