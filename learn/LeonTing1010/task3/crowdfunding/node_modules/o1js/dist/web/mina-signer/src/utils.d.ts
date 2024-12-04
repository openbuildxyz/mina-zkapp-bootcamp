import type { Payment, StakeDelegation, ZkappCommand, Signed, SignedAny, SignedLegacy, SignableData } from './types.js';
export declare function isZkappCommand(p: SignableData | ZkappCommand): p is ZkappCommand;
export declare function isPayment(p: SignableData | ZkappCommand): p is Payment;
export declare function isStakeDelegation(p: SignableData | ZkappCommand): p is StakeDelegation;
export declare function isSignedZkappCommand(p: SignedAny): p is Signed<ZkappCommand>;
export declare function isSignedPayment(p: SignedAny): p is SignedLegacy<Payment>;
export declare function isSignedDelegation(p: SignedAny): p is SignedLegacy<StakeDelegation>;
export declare function isSignedString(p: SignedAny): p is SignedLegacy<string>;
