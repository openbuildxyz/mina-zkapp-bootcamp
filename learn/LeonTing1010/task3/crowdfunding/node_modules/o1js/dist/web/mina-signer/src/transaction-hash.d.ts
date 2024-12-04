import { UInt32, UInt64 } from './field-bigint.js';
import { Binable } from '../../bindings/lib/binable.js';
import { Common, Delegation, Payment, UserCommand, UserCommandEnum, PaymentJson, DelegationJson } from './sign-legacy.js';
import { PublicKey } from './curve-bigint.js';
import { Signature, SignatureJson } from './signature.js';
export { hashPayment, hashStakeDelegation, SignedCommand, SignedCommandV1, Common, userCommandToEnum, userCommandToV1, Signed, SignedLegacy, HashBase58, };
type Signed<T> = {
    data: T;
    signature: string;
};
type SignedLegacy<T> = {
    data: T;
    signature: SignatureJson;
};
declare function hashPayment(signed: SignedLegacy<PaymentJson>, { berkeley }?: {
    berkeley?: boolean | undefined;
}): string;
declare function hashStakeDelegation(signed: SignedLegacy<DelegationJson>, { berkeley }?: {
    berkeley?: boolean | undefined;
}): string;
declare function userCommandToEnum({ common, body }: UserCommand): UserCommandEnum;
declare const Common: Binable<Common>;
declare const Payment: Binable<Payment>;
declare const Delegation: Binable<Delegation>;
type DelegationEnum = {
    type: 'SetDelegate';
    value: Delegation;
};
declare const DelegationEnum: Binable<DelegationEnum>;
declare const UserCommand: Binable<{
    common: Common;
    body: {
        type: 'Payment';
        value: Payment;
    } | {
        type: 'StakeDelegation';
        value: DelegationEnum;
    };
}>;
type SignedCommand = {
    payload: UserCommandEnum;
    signer: PublicKey;
    signature: Signature;
};
declare const SignedCommand: Binable<SignedCommand>;
declare const HashBase58: import("../../lib/util/base58.js").Base58<Uint8Array>;
declare function userCommandToV1({ common, body }: UserCommand): UserCommandV1;
type CommonV1 = {
    fee: UInt64;
    feePayer: PublicKey;
    nonce: UInt32;
    validUntil: UInt32;
    memo: string;
    feeToken: UInt64;
};
declare const CommonV1: Binable<CommonV1>;
type PaymentV1 = Payment & {
    source: PublicKey;
    tokenId: UInt64;
};
declare const PaymentV1: Binable<PaymentV1>;
type DelegationV1 = Delegation & {
    delegator: PublicKey;
};
declare const DelegationV1: Binable<DelegationV1>;
type DelegationEnumV1 = {
    type: 'SetDelegate';
    value: DelegationV1;
};
declare const DelegationEnumV1: Binable<DelegationEnumV1>;
type BodyV1 = {
    type: 'Payment';
    value: PaymentV1;
} | {
    type: 'StakeDelegation';
    value: DelegationEnumV1;
};
declare const BodyV1: Binable<{
    type: 'Payment';
    value: PaymentV1;
} | {
    type: 'StakeDelegation';
    value: DelegationEnumV1;
}>;
type UserCommandV1 = {
    common: CommonV1;
    body: BodyV1;
};
declare const UserCommandV1: Binable<UserCommandV1>;
type SignedCommandV1 = {
    payload: UserCommandV1;
    signer: PublicKey;
    signature: Signature;
};
declare const SignedCommandV1: Binable<SignedCommandV1> & import("../../lib/util/base58.js").Base58<SignedCommandV1>;
