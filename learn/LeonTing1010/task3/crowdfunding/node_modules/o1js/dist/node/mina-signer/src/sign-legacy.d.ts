import { UInt32, UInt64 } from './field-bigint.js';
import { PublicKey } from './curve-bigint.js';
import { SignatureJson } from './signature.js';
import { Json } from '../../bindings/mina-transaction/gen/transaction-bigint.js';
import { NetworkId } from './types.js';
export { signPayment, signStakeDelegation, signString, verifyPayment, verifyStakeDelegation, verifyStringSignature, paymentFromJson, delegationFromJson, commonFromJson, PaymentJson, PaymentJsonV1, DelegationJson, DelegationJsonV1, CommonJson, Tag, UserCommand, UserCommandEnum, BodyEnum, Payment, Delegation, Common, };
declare function signPayment(payment: PaymentJson, privateKeyBase58: string, networkId: NetworkId): SignatureJson;
declare function signStakeDelegation(delegation: DelegationJson, privateKeyBase58: string, networkId: NetworkId): SignatureJson;
declare function verifyPayment(payment: PaymentJson, signatureJson: SignatureJson, publicKeyBase58: string, networkId: NetworkId): boolean;
declare function verifyStakeDelegation(delegation: DelegationJson, signatureJson: SignatureJson, publicKeyBase58: string, networkId: NetworkId): boolean;
declare function paymentFromJson({ common, body: { receiver, amount }, }: PaymentJson): UserCommand;
declare function delegationFromJson({ common, body: { newDelegate }, }: DelegationJson): UserCommand;
declare function commonFromJson(c: CommonJson): Common;
declare function signString(string: string, privateKeyBase58: string, networkId: NetworkId): SignatureJson;
declare function verifyStringSignature(string: string, signatureJson: SignatureJson, publicKeyBase58: string, networkId: NetworkId): boolean;
type Tag = 'Payment' | 'StakeDelegation';
type UserCommand = {
    common: Common;
    body: {
        tag: Tag;
        source: PublicKey;
        receiver: PublicKey;
        amount: UInt64;
    };
};
type UserCommandEnum = {
    common: Common;
    body: BodyEnum;
};
type BodyEnum = {
    type: 'Payment';
    value: Payment;
} | {
    type: 'StakeDelegation';
    value: {
        type: 'SetDelegate';
        value: Delegation;
    };
};
type Common = {
    fee: UInt64;
    feePayer: PublicKey;
    nonce: UInt32;
    validUntil: {
        type: 'SinceGenesis';
        value: UInt32;
    };
    memo: string;
};
type Payment = {
    receiver: PublicKey;
    amount: UInt64;
};
type Delegation = {
    newDelegate: PublicKey;
};
type CommonJson = {
    fee: Json.UInt64;
    feePayer: Json.PublicKey;
    nonce: Json.UInt32;
    validUntil: Json.UInt32;
    memo: string;
};
type PaymentJson = {
    common: CommonJson;
    body: {
        receiver: Json.PublicKey;
        amount: Json.UInt64;
    };
};
type PaymentJsonV1 = {
    common: CommonJson;
    body: {
        source: Json.PublicKey;
        receiver: Json.PublicKey;
        amount: Json.UInt64;
    };
};
type DelegationJson = {
    common: CommonJson;
    body: {
        newDelegate: Json.PublicKey;
    };
};
type DelegationJsonV1 = {
    common: CommonJson;
    body: {
        delegator: Json.PublicKey;
        newDelegate: Json.PublicKey;
    };
};
