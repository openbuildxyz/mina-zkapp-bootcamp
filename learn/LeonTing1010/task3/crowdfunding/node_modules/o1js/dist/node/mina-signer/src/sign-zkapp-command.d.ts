import { Json, AccountUpdate, ZkappCommand } from '../../bindings/mina-transaction/gen/transaction-bigint.js';
import { NetworkId } from './types.js';
export { signZkappCommand, verifyZkappCommandSignature };
export { transactionCommitments, verifyAccountUpdateSignature, accountUpdatesToCallForest, callForestHash, callForestHashGeneric, accountUpdateHash, feePayerHash, createFeePayer, accountUpdateFromFeePayer, isCallDepthValid, CallForest, };
declare function signZkappCommand(zkappCommand_: Json.ZkappCommand, privateKeyBase58: string, networkId: NetworkId): Json.ZkappCommand;
declare function verifyZkappCommandSignature(zkappCommand_: Json.ZkappCommand, publicKeyBase58: string, networkId: NetworkId): boolean;
declare function verifyAccountUpdateSignature(update: AccountUpdate, transactionCommitments: {
    commitment: bigint;
    fullCommitment: bigint;
}, networkId: NetworkId): boolean;
declare function transactionCommitments(zkappCommand: ZkappCommand, networkId: NetworkId): {
    commitment: bigint;
    fullCommitment: bigint;
};
type CallTree<AccountUpdate> = {
    accountUpdate: AccountUpdate;
    children: CallForest<AccountUpdate>;
};
type CallForest<AccountUpdate> = CallTree<AccountUpdate>[];
/**
 * Turn flat list into a hierarchical structure (forest) by letting the callDepth
 * determine parent-child relationships
 */
declare function accountUpdatesToCallForest<A extends {
    body: {
        callDepth: number;
    };
}>(updates: A[], callDepth?: number): CallForest<A>;
declare function accountUpdateHash(update: AccountUpdate, networkId: NetworkId): bigint;
declare function callForestHash(forest: CallForest<AccountUpdate>, networkId: NetworkId): bigint;
declare function callForestHashGeneric<A, F>(forest: CallForest<A>, hash: (a: A, networkId: NetworkId) => F, hashWithPrefix: (prefix: string, input: F[]) => F, emptyHash: F, networkId: NetworkId): F;
type FeePayer = ZkappCommand['feePayer'];
declare function createFeePayer(feePayer: FeePayer['body']): FeePayer;
declare function feePayerHash(feePayer: FeePayer, networkId: NetworkId): bigint;
declare function accountUpdateFromFeePayer({ body: { fee, nonce, publicKey, validUntil }, authorization: signature, }: FeePayer): AccountUpdate;
declare function isCallDepthValid(zkappCommand: ZkappCommand): boolean;
