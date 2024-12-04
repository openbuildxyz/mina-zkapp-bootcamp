import { FlexibleProvable } from '../provable/types/struct.js';
import { Provable } from '../provable/provable.js';
import { Field, Bool } from '../provable/wrapped.js';
import { Pickles } from '../../snarky.js';
import { Types } from '../../bindings/mina-transaction/types.js';
import { PrivateKey, PublicKey } from '../provable/crypto/signature.js';
import { UInt64, UInt32, Int64 } from '../provable/int.js';
import type { SmartContract } from './zkapp.js';
import { Preconditions, Account, Network, CurrentSlot, OrIgnore, ClosedInterval } from './precondition.js';
import { Empty } from '../proof-system/zkprogram.js';
import { Proof } from '../proof-system/proof.js';
import { Events as BaseEvents, Actions as BaseActions, MayUseToken as BaseMayUseToken } from '../../bindings/mina-transaction/transaction-leaves.js';
import { CallForest } from '../../mina-signer/src/sign-zkapp-command.js';
import { MerkleList, MerkleListBase } from '../provable/merkle-list.js';
import { Hashed } from '../provable/packed.js';
import { From } from '../../bindings/lib/provable-generic.js';
export { AccountUpdate, Permissions, ZkappPublicInput, TransactionVersion, AccountUpdateForest, AccountUpdateTree, };
export { SetOrKeep, Permission, Preconditions, Body, Authorization, FeePayerUnsigned, ZkappCommand, addMissingSignatures, addMissingProofs, Events, Actions, TokenId, CallForest, zkAppProver, dummySignature, LazyProof, AccountUpdateTreeBase, AccountUpdateLayout, hashAccountUpdate, HashedAccountUpdate, };
declare const TransactionVersion: {
    current: () => Types.UInt32;
};
type ZkappProverData = {
    transaction: ZkappCommand;
    accountUpdate: AccountUpdate;
    index: number;
};
declare let zkAppProver: {
    run<Result>(witnesses: unknown[], proverData: ZkappProverData, callback: () => Promise<Result>): Promise<Result>;
    getData(): ZkappProverData;
};
type AuthRequired = Types.Json.AuthRequired;
type AccountUpdateBody = Types.AccountUpdate['body'];
type Update = AccountUpdateBody['update'];
type MayUseToken = BaseMayUseToken;
declare const MayUseToken: {
    type: {
        check: ({ parentsOwnToken, inheritFromParent }: Types.MayUseToken) => void;
        toFields: (x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) => import("../provable/field.js").Field[];
        toAuxiliary: (x?: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        } | undefined) => any[];
        sizeInFields: () => number;
        toValue: (x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
        fromValue: (x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        } | {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        }) => {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        toCanonical?: ((x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) | undefined;
        fromFields: (x: import("../provable/field.js").Field[]) => {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        toInput: (x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) => {
            fields?: import("../provable/field.js").Field[] | undefined;
            packed?: [import("../provable/field.js").Field, number][] | undefined;
        };
        toJSON: (x: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
        fromJSON: (x: {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        }) => {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        empty: () => {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
    };
    No: {
        parentsOwnToken: import("../provable/bool.js").Bool;
        inheritFromParent: import("../provable/bool.js").Bool;
    };
    ParentsOwnToken: {
        parentsOwnToken: import("../provable/bool.js").Bool;
        inheritFromParent: import("../provable/bool.js").Bool;
    };
    InheritFromParent: {
        parentsOwnToken: import("../provable/bool.js").Bool;
        inheritFromParent: import("../provable/bool.js").Bool;
    };
    isNo: ({ body: { mayUseToken: { parentsOwnToken, inheritFromParent }, }, }: AccountUpdate) => import("../provable/bool.js").Bool;
    isParentsOwnToken: (a: AccountUpdate) => import("../provable/bool.js").Bool;
    isInheritFromParent: (a: AccountUpdate) => import("../provable/bool.js").Bool;
};
type Events = BaseEvents;
declare const Events: {
    pushEvent(events: Events, event: Field[]): Events;
    toFields: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => import("../provable/field.js").Field[];
    toAuxiliary: (x?: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    } | undefined) => any[];
    fromFields: (x: import("../provable/field.js").Field[], aux: any[]) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    sizeInFields(): number;
    check: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => void;
    toValue: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    toCanonical?: ((x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) | undefined;
    toInput: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    empty: () => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    fromList(events: import("../provable/field.js").Field[][]): {
        hash: import("../provable/field.js").Field;
        data: import("../provable/field.js").Field[][];
    };
    hash(events: import("../provable/field.js").Field[][]): import("../provable/field.js").Field;
};
type Actions = BaseActions;
declare const Actions: {
    pushEvent(actions: Actions, action: Field[]): Actions;
    toFields: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => import("../provable/field.js").Field[];
    toAuxiliary: (x?: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    } | undefined) => any[];
    fromFields: (x: import("../provable/field.js").Field[], aux: any[]) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    sizeInFields(): number;
    check: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => void;
    toValue: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        data: bigint[][];
        hash: bigint;
    };
    fromValue: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    } | {
        data: bigint[][];
        hash: bigint;
    }) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    toCanonical?: ((x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) | undefined;
    toInput: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    }) => string[][];
    fromJSON: (x: string[][]) => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    empty: () => {
        data: import("../provable/field.js").Field[][];
        hash: import("../provable/field.js").Field;
    };
    fromList(events: import("../provable/field.js").Field[][]): {
        hash: import("../provable/field.js").Field;
        data: import("../provable/field.js").Field[][];
    };
    hash(events: import("../provable/field.js").Field[][]): import("../provable/field.js").Field;
    emptyActionState(): import("../provable/field.js").Field;
    updateSequenceState(state: import("../provable/field.js").Field, sequenceEventsHash: import("../provable/field.js").Field): import("../provable/field.js").Field;
};
/**
 * Either set a value or keep it the same.
 */
type SetOrKeep<T> = {
    isSome: Bool;
    value: T;
};
/**
 * One specific permission value.
 *
 * A {@link Permission} tells one specific permission for our zkapp how it
 * should behave when presented with requested modifications.
 *
 * Use static factory methods on this class to use a specific behavior. See
 * documentation on those methods to learn more.
 */
type Permission = Types.AuthRequired;
declare class VerificationKeyPermission {
    auth: Permission;
    txnVersion: UInt32;
    constructor(auth: Permission, txnVersion: UInt32);
    static withCurrentVersion(perm: Permission): VerificationKeyPermission;
}
declare let Permission: {
    /**
     * Modification is impossible.
     */
    impossible: () => Permission;
    /**
     * Modification is always permitted
     */
    none: () => Permission;
    /**
     * Modification is permitted by zkapp proofs only
     */
    proof: () => Permission;
    /**
     * Modification is permitted by signatures only, using the private key of the zkapp account
     */
    signature: () => Permission;
    /**
     * Modification is permitted by zkapp proofs or signatures
     */
    proofOrSignature: () => Permission;
    /**
     * Special Verification key permissions.
     *
     * The difference to normal permissions is that `Permission.proof` and `Permission.impossible` are replaced by less restrictive permissions:
     * - `impossible` is replaced by `impossibleDuringCurrentVersion`
     * - `proof` is replaced by `proofDuringCurrentVersion`
     *
     * The issue is that a future hardfork which changes the proof system could mean that old verification keys can no longer
     * be used to verify proofs in the new proof system, and the zkApp would have to be redeployed to adapt the verification key.
     *
     * Having either `impossible` or `proof` would mean that these zkApps can't be upgraded after this hypothetical hardfork, and would become unusable.
     *
     * Such a future hardfork would manifest as an increment in the "transaction version" of zkApps, which you can check with {@link TransactionVersion.current()}.
     *
     * The `impossibleDuringCurrentVersion` and `proofDuringCurrentVersion` have an additional `txnVersion` field.
     * These permissions follow the same semantics of not upgradable, or only upgradable with proofs,
     * _as long as_ the current transaction version is the same as the one on the permission.
     *
     * Once the current transaction version is higher than the one on the permission, the permission is treated as `signature`,
     * and the zkApp can be redeployed with a signature of the original account owner.
     */
    VerificationKey: {
        /**
         * Modification is impossible, as long as the network accepts the current {@link TransactionVersion}.
         *
         * After a hardfork that increments the transaction version, the permission is treated as `signature`.
         */
        impossibleDuringCurrentVersion: () => VerificationKeyPermission;
        /**
         * Modification is always permitted
         */
        none: () => VerificationKeyPermission;
        /**
         * Modification is permitted by zkapp proofs only; as long as the network accepts the current {@link TransactionVersion}.
         *
         * After a hardfork that increments the transaction version, the permission is treated as `signature`.
         */
        proofDuringCurrentVersion: () => VerificationKeyPermission;
        /**
         * Modification is permitted by signatures only, using the private key of the zkapp account
         */
        signature: () => VerificationKeyPermission;
        /**
         * Modification is permitted by zkapp proofs or signatures
         */
        proofOrSignature: () => VerificationKeyPermission;
    };
};
type Permissions_ = Update['permissions']['value'];
/**
 * Permissions specify how specific aspects of the zkapp account are allowed
 * to be modified. All fields are denominated by a {@link Permission}.
 */
interface Permissions extends Permissions_ {
    /**
     * The {@link Permission} corresponding to the 8 state fields associated with
     * an account.
     */
    editState: Permission;
    /**
     * The {@link Permission} corresponding to the ability to send transactions
     * from this account.
     */
    send: Permission;
    /**
     * The {@link Permission} corresponding to the ability to receive transactions
     * to this account.
     */
    receive: Permission;
    /**
     * The {@link Permission} corresponding to the ability to set the delegate
     * field of the account.
     */
    setDelegate: Permission;
    /**
     * The {@link Permission} corresponding to the ability to set the permissions
     * field of the account.
     */
    setPermissions: Permission;
    /**
     * The {@link Permission} corresponding to the ability to set the verification
     * key associated with the circuit tied to this account. Effectively
     * "upgradeability" of the smart contract.
     */
    setVerificationKey: VerificationKeyPermission;
    /**
     * The {@link Permission} corresponding to the ability to set the zkapp uri
     * typically pointing to the source code of the smart contract. Usually this
     * should be changed whenever the {@link Permissions.setVerificationKey} is
     * changed. Effectively "upgradeability" of the smart contract.
     */
    setZkappUri: Permission;
    /**
     * The {@link Permission} corresponding to the ability to emit actions to the account.
     */
    editActionState: Permission;
    /**
     * The {@link Permission} corresponding to the ability to set the token symbol
     * for this account.
     */
    setTokenSymbol: Permission;
    incrementNonce: Permission;
    setVotingFor: Permission;
    setTiming: Permission;
    /**
     * Permission to control the ability to include _any_ account update for this
     * account in a transaction. Note that this is more restrictive than all other
     * permissions combined. For normal accounts it can safely be set to `none`,
     * but for token contracts this has to be more restrictive, to prevent
     * unauthorized token interactions -- for example, it could be
     * `proofOrSignature`.
     */
    access: Permission;
}
declare let Permissions: {
    /**
     * Default permissions are:
     *
     *   {@link Permissions.editState} = {@link Permission.proof}
     *
     *   {@link Permissions.send} = {@link Permission.signature}
     *
     *   {@link Permissions.receive} = {@link Permission.none}
     *
     *   {@link Permissions.setDelegate} = {@link Permission.signature}
     *
     *   {@link Permissions.setPermissions} = {@link Permission.signature}
     *
     *   {@link Permissions.setVerificationKey} = {@link Permission.signature}
     *
     *   {@link Permissions.setZkappUri} = {@link Permission.signature}
     *
     *   {@link Permissions.editActionState} = {@link Permission.proof}
     *
     *   {@link Permissions.setTokenSymbol} = {@link Permission.signature}
     *
     */
    default: () => Permissions;
    initial: () => Permissions;
    dummy: () => Permissions;
    allImpossible: () => Permissions;
    fromString: (permission: AuthRequired) => Permission;
    fromJSON: (permissions: NonNullable<Types.Json.AccountUpdate['body']['update']['permissions']>) => Permissions;
    /**
     * Modification is impossible.
     */
    impossible: () => Permission;
    /**
     * Modification is always permitted
     */
    none: () => Permission;
    /**
     * Modification is permitted by zkapp proofs only
     */
    proof: () => Permission;
    /**
     * Modification is permitted by signatures only, using the private key of the zkapp account
     */
    signature: () => Permission;
    /**
     * Modification is permitted by zkapp proofs or signatures
     */
    proofOrSignature: () => Permission;
    /**
     * Special Verification key permissions.
     *
     * The difference to normal permissions is that `Permission.proof` and `Permission.impossible` are replaced by less restrictive permissions:
     * - `impossible` is replaced by `impossibleDuringCurrentVersion`
     * - `proof` is replaced by `proofDuringCurrentVersion`
     *
     * The issue is that a future hardfork which changes the proof system could mean that old verification keys can no longer
     * be used to verify proofs in the new proof system, and the zkApp would have to be redeployed to adapt the verification key.
     *
     * Having either `impossible` or `proof` would mean that these zkApps can't be upgraded after this hypothetical hardfork, and would become unusable.
     *
     * Such a future hardfork would manifest as an increment in the "transaction version" of zkApps, which you can check with {@link TransactionVersion.current()}.
     *
     * The `impossibleDuringCurrentVersion` and `proofDuringCurrentVersion` have an additional `txnVersion` field.
     * These permissions follow the same semantics of not upgradable, or only upgradable with proofs,
     * _as long as_ the current transaction version is the same as the one on the permission.
     *
     * Once the current transaction version is higher than the one on the permission, the permission is treated as `signature`,
     * and the zkApp can be redeployed with a signature of the original account owner.
     */
    VerificationKey: {
        /**
         * Modification is impossible, as long as the network accepts the current {@link TransactionVersion}.
         *
         * After a hardfork that increments the transaction version, the permission is treated as `signature`.
         */
        impossibleDuringCurrentVersion: () => VerificationKeyPermission;
        /**
         * Modification is always permitted
         */
        none: () => VerificationKeyPermission;
        /**
         * Modification is permitted by zkapp proofs only; as long as the network accepts the current {@link TransactionVersion}.
         *
         * After a hardfork that increments the transaction version, the permission is treated as `signature`.
         */
        proofDuringCurrentVersion: () => VerificationKeyPermission;
        /**
         * Modification is permitted by signatures only, using the private key of the zkapp account
         */
        signature: () => VerificationKeyPermission;
        /**
         * Modification is permitted by zkapp proofs or signatures
         */
        proofOrSignature: () => VerificationKeyPermission;
    };
};
/**
 * The body of describing how some [[ AccountUpdate ]] should change.
 */
interface Body extends AccountUpdateBody {
    /**
     * The address for this body.
     */
    publicKey: PublicKey;
    /**
     * Specify {@link Update}s to tweakable pieces of the account record backing
     * this address in the ledger.
     */
    update: Update;
    /**
     * The TokenId for this account.
     */
    tokenId: Field;
    /**
     * By what {@link Int64} should the balance of this account change. All
     * balanceChanges must balance by the end of smart contract execution.
     */
    balanceChange: Int64;
    /**
     * Recent events that have been emitted from this account.
     * Events can be collected by archive nodes.
     *
     * [Check out our documentation about
     * Events!](https://docs.minaprotocol.com/zkapps/advanced-o1js/events)
     */
    events: Events;
    /**
     * Recent {@link Action}s emitted from this account.
     * Actions can be collected by archive nodes and used in combination with
     * a {@link Reducer}.
     *
     * [Check out our documentation about
     * Actions!](https://docs.minaprotocol.com/zkapps/advanced-o1js/actions-and-reducer)
     */
    actions: Events;
    /**
     * The type of call.
     */
    mayUseToken: MayUseToken;
    callData: Field;
    callDepth: number;
    /**
     * A list of {@link Preconditions} that need to be fulfilled in order for
     * the {@link AccountUpdate} to be valid.
     */
    preconditions: Preconditions;
    /**
     * Defines if a full commitment is required for this transaction.
     */
    useFullCommitment: Bool;
    /**
     * Defines if the fee for creating this account should be paid out of this
     * account's balance change.
     *
     * This must only be true if the balance change is larger than the account
     * creation fee and the token ID is the default.
     */
    implicitAccountCreationFee: Bool;
    /**
     * Defines if the nonce should be incremented with this {@link AccountUpdate}.
     */
    incrementNonce: Bool;
    /**
     * Defines the type of authorization that is needed for this {@link
     * AccountUpdate}.
     *
     * A authorization can be one of three types: None, Proof or Signature
     */
    authorizationKind: AccountUpdateBody['authorizationKind'];
}
declare const Body: {
    /**
     * A body that doesn't change the underlying account record
     */
    keepAll(publicKey: PublicKey, tokenId?: Field, mayUseToken?: MayUseToken): Body;
    dummy(): Body;
};
type FeePayer = Types.ZkappCommand['feePayer'];
type FeePayerUnsigned = FeePayer & {
    lazyAuthorization?: LazySignature | undefined;
};
type Control = Types.AccountUpdate['authorization'];
type LazyNone = {
    kind: 'lazy-none';
};
type LazySignature = {
    kind: 'lazy-signature';
};
type LazyProof = {
    kind: 'lazy-proof';
    methodName: string;
    args: any[];
    previousProofs: Pickles.Proof[];
    ZkappClass: typeof SmartContract;
    memoized: {
        fields: Field[];
        aux: any[];
    }[];
    blindingValue: Field;
};
declare const TokenId: {
    default: import("../provable/field.js").Field;
    derive(tokenOwner: PublicKey, parentTokenId?: import("../provable/field.js").Field): Field;
    toBase58(t: import("../provable/field.js").Field): string;
    fromBase58(base58: string): import("../provable/field.js").Field;
    empty: () => import("../provable/field.js").Field;
    fromFields: (x: import("../provable/field.js").Field[], aux: any[]) => import("../provable/field.js").Field;
    toFields: (x: import("../provable/field.js").Field) => import("../provable/field.js").Field[];
    toAuxiliary: (x?: import("../provable/field.js").Field | undefined) => any[];
    sizeInFields: () => number;
    check: (x: import("../provable/field.js").Field) => void;
    toValue: (x: import("../provable/field.js").Field) => bigint;
    fromValue: (x: bigint | import("../provable/field.js").Field) => import("../provable/field.js").Field;
    toCanonical?: ((x: import("../provable/field.js").Field) => import("../provable/field.js").Field) | undefined;
    toInput: (x: import("../provable/field.js").Field) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    toJSON(x: import("../provable/field.js").Field): string;
    fromJSON(x: string): import("../provable/field.js").Field;
};
/**
 * An {@link AccountUpdate} is a set of instructions for the Mina network.
 * It includes {@link Preconditions} and a list of state updates, which need to
 * be authorized by either a {@link Signature} or {@link Proof}.
 */
declare class AccountUpdate implements Types.AccountUpdate {
    id: number;
    /**
     * A human-readable label for the account update, indicating how that update
     * was created. Can be modified by applications to add richer information.
     */
    label: string;
    body: Body;
    authorization: Control;
    lazyAuthorization: LazySignature | LazyProof | LazyNone | undefined;
    account: Account;
    network: Network;
    currentSlot: CurrentSlot;
    private isSelf;
    static Actions: {
        pushEvent(actions: Types.Events, action: import("../provable/field.js").Field[]): Types.Events;
        toFields: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => import("../provable/field.js").Field[];
        toAuxiliary: (x?: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        } | undefined) => any[];
        fromFields: (x: import("../provable/field.js").Field[], aux: any[]) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        sizeInFields(): number;
        check: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => void;
        toValue: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            data: bigint[][];
            hash: bigint;
        };
        fromValue: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        } | {
            data: bigint[][];
            hash: bigint;
        }) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        toCanonical?: ((x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) | undefined;
        toInput: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            fields?: import("../provable/field.js").Field[] | undefined;
            packed?: [import("../provable/field.js").Field, number][] | undefined;
        };
        toJSON: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => string[][];
        fromJSON: (x: string[][]) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        empty: () => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        fromList(events: import("../provable/field.js").Field[][]): {
            hash: import("../provable/field.js").Field;
            data: import("../provable/field.js").Field[][];
        };
        hash(events: import("../provable/field.js").Field[][]): import("../provable/field.js").Field;
        emptyActionState(): import("../provable/field.js").Field;
        updateSequenceState(state: import("../provable/field.js").Field, sequenceEventsHash: import("../provable/field.js").Field): import("../provable/field.js").Field;
    };
    static Events: {
        pushEvent(events: Types.Events, event: import("../provable/field.js").Field[]): Types.Events;
        toFields: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => import("../provable/field.js").Field[];
        toAuxiliary: (x?: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        } | undefined) => any[];
        fromFields: (x: import("../provable/field.js").Field[], aux: any[]) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        sizeInFields(): number;
        check: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => void;
        toValue: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            data: bigint[][];
            hash: bigint;
        };
        fromValue: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        } | {
            data: bigint[][];
            hash: bigint;
        }) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        toCanonical?: ((x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) | undefined;
        toInput: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => {
            fields?: import("../provable/field.js").Field[] | undefined;
            packed?: [import("../provable/field.js").Field, number][] | undefined;
        };
        toJSON: (x: {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        }) => string[][];
        fromJSON: (x: string[][]) => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        empty: () => {
            data: import("../provable/field.js").Field[][];
            hash: import("../provable/field.js").Field;
        };
        fromList(events: import("../provable/field.js").Field[][]): {
            hash: import("../provable/field.js").Field;
            data: import("../provable/field.js").Field[][];
        };
        hash(events: import("../provable/field.js").Field[][]): import("../provable/field.js").Field;
    };
    constructor(body: Body, authorization?: Control);
    /**
     * Clones the {@link AccountUpdate}.
     */
    static clone(accountUpdate: AccountUpdate): AccountUpdate;
    get tokenId(): import("../provable/field.js").Field;
    send({ to, amount, }: {
        to: PublicKey | AccountUpdate | SmartContract;
        amount: number | bigint | UInt64;
    }): AccountUpdate;
    /**
     * Makes another {@link AccountUpdate} a child of this one.
     *
     * The parent-child relationship means that the child becomes part of the "statement"
     * of the parent, and goes into the commitment that is authorized by either a signature
     * or a proof.
     *
     * For a proof in particular, child account updates are contained in the public input
     * of the proof that authorizes the parent account update.
     */
    approve(child: AccountUpdate | AccountUpdateTree | AccountUpdateForest): void;
    get balance(): {
        addInPlace(x: Int64 | UInt32 | UInt64 | string | number | bigint): void;
        subInPlace(x: Int64 | UInt32 | UInt64 | string | number | bigint): void;
    };
    get balanceChange(): Int64;
    set balanceChange(x: Int64);
    get update(): Update;
    static setValue<T>(maybeValue: SetOrKeep<T>, value: T): void;
    /**
     * Constrain a property to lie between lower and upper bounds.
     *
     * @param property The property to constrain
     * @param lower The lower bound
     * @param upper The upper bound
     *
     * Example: To constrain the account balance of a SmartContract to lie between
     * 0 and 20 MINA, you can use
     *
     * ```ts
     * \@method onlyRunsWhenBalanceIsLow() {
     *   let lower = UInt64.zero;
     *   let upper = UInt64.from(20e9);
     *   AccountUpdate.assertBetween(this.self.body.preconditions.account.balance, lower, upper);
     *   // ...
     * }
     * ```
     */
    static assertBetween<T>(property: OrIgnore<ClosedInterval<T>>, lower: T, upper: T): void;
    /**
     * Fix a property to a certain value.
     *
     * @param property The property to constrain
     * @param value The value it is fixed to
     *
     * Example: To fix the account nonce of a SmartContract to 0, you can use
     *
     * ```ts
     * \@method onlyRunsWhenNonceIsZero() {
     *   AccountUpdate.assertEquals(this.self.body.preconditions.account.nonce, UInt32.zero);
     *   // ...
     * }
     * ```
     */
    static assertEquals<T extends object>(property: OrIgnore<ClosedInterval<T> | T>, value: T): void;
    get publicKey(): PublicKey;
    /**
     * Use this command if this account update should be signed by the account
     * owner, instead of not having any authorization.
     *
     * If you use this and are not relying on a wallet to sign your transaction,
     * then you should use the following code before sending your transaction:
     *
     * ```ts
     * let tx = await Mina.transaction(...); // create transaction as usual, using `requireSignature()` somewhere
     * tx.sign([privateKey]); // pass the private key of this account to `sign()`!
     * ```
     *
     * Note that an account's {@link Permissions} determine which updates have to
     * be (can be) authorized by a signature.
     */
    requireSignature(): void;
    static signFeePayerInPlace(feePayer: FeePayerUnsigned): void;
    static getNonce(accountUpdate: AccountUpdate | FeePayerUnsigned): Types.UInt32;
    private static signingInfo;
    private static getSigningInfo;
    private static getSigningInfoUnchecked;
    toJSON(): Types.Json.AccountUpdate;
    static toJSON(a: AccountUpdate): Types.Json.AccountUpdate;
    static fromJSON(json: Types.Json.AccountUpdate): AccountUpdate;
    hash(): Field;
    toPublicInput({ accountUpdates, }: {
        accountUpdates: AccountUpdate[];
    }): ZkappPublicInput;
    toPrettyLayout(): void;
    extractTree(): AccountUpdateTree;
    /**
     * Create an account update from a public key and an optional token id.
     *
     * **Important**: This method is different from `AccountUpdate.create()`, in that it really just creates the account update object.
     * It does not attach the update to the current transaction or smart contract.
     * Use this method for lower-level operations with account updates.
     */
    static default(address: PublicKey, tokenId?: Field): AccountUpdate;
    static dummy(): AccountUpdate;
    isDummy(): import("../provable/bool.js").Bool;
    static defaultFeePayer(address: PublicKey, nonce: UInt32): FeePayerUnsigned;
    static dummyFeePayer(): FeePayerUnsigned;
    /**
     * Creates an account update. If this is inside a transaction, the account
     * update becomes part of the transaction. If this is inside a smart contract
     * method, the account update will not only become part of the transaction,
     * but also becomes available for the smart contract to modify, in a way that
     * becomes part of the proof.
     */
    static create(publicKey: PublicKey, tokenId?: Field): AccountUpdate;
    /**
     * Create an account update that is added to the transaction only if a condition is met.
     *
     * See {@link AccountUpdate.create} for more information. In this method, you can pass in
     * a condition that determines whether the account update should be added to the transaction.
     */
    static createIf(condition: Bool, publicKey: PublicKey, tokenId?: Field): AccountUpdate;
    /**
     * Attach account update to the current transaction
     * -- if in a smart contract, to its children
     */
    static attachToTransaction(accountUpdate: AccountUpdate): void;
    /**
     * Disattach an account update from where it's currently located in the transaction
     */
    static unlink(accountUpdate: AccountUpdate): void;
    /**
     * Creates an account update, like {@link AccountUpdate.create}, but also
     * makes sure this account update will be authorized with a signature.
     *
     * If you use this and are not relying on a wallet to sign your transaction,
     * then you should use the following code before sending your transaction:
     *
     * ```ts
     * let tx = await Mina.transaction(...); // create transaction as usual, using `createSigned()` somewhere
     * tx.sign([privateKey]); // pass the private key of this account to `sign()`!
     * ```
     *
     * Note that an account's {@link Permissions} determine which updates have to
     * be (can be) authorized by a signature.
     */
    static createSigned(publicKey: PublicKey, tokenId?: Field): AccountUpdate;
    /**
     * Use this method to pay the account creation fee for another account (or, multiple accounts using the optional second argument).
     *
     * Beware that you _don't_ need to specify the account that is created!
     * Instead, the protocol will automatically identify that accounts need to be created,
     * and require that the net balance change of the transaction covers the account creation fee.
     *
     * @param feePayer the address of the account that pays the fee
     * @param numberOfAccounts the number of new accounts to fund (default: 1)
     * @returns they {@link AccountUpdate} for the account which pays the fee
     */
    static fundNewAccount(feePayer: PublicKey, numberOfAccounts?: number): AccountUpdate;
    static sizeInFields: () => number;
    static toFields: (x: Types.AccountUpdate) => import("../provable/field.js").Field[];
    static toAuxiliary(a?: AccountUpdate): (any[] | {
        lazyAuthorization: LazySignature | LazyProof | LazyNone | undefined;
        id: number;
        label: string;
    })[];
    static toInput: (x: Types.AccountUpdate) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    static empty(): AccountUpdate;
    static check: (x: Types.AccountUpdate) => void;
    static fromFields(fields: Field[], [other, aux]: any[]): AccountUpdate;
    static toValue: (x: Types.AccountUpdate) => import("../../bindings/mina-transaction/gen/transaction-bigint.js").AccountUpdate;
    static fromValue(value: From<typeof Types.AccountUpdate> | AccountUpdate): AccountUpdate;
    /**
     * This function acts as the `check()` method on an `AccountUpdate` that is sent to the Mina node as part of a transaction.
     *
     * Background: the Mina node performs most necessary validity checks on account updates, both in- and outside of circuits.
     * To save constraints, we don't repeat these checks in zkApps in places where we can be sure the checked account udpates
     * will be part of a transaction.
     *
     * However, there are a few checks skipped by the Mina node, that could cause vulnerabilities in zkApps if
     * not checked in the zkApp proof itself. Adding these extra checks is the purpose of this function.
     */
    private static clientSideOnlyChecks;
    static witness<T>(resultType: FlexibleProvable<T>, compute: () => Promise<{
        accountUpdate: AccountUpdate;
        result: T;
    }>, { skipCheck }?: {
        skipCheck?: boolean | undefined;
    }): Promise<{
        accountUpdate: AccountUpdate;
        result: T;
    }>;
    static MayUseToken: {
        type: {
            check: ({ parentsOwnToken, inheritFromParent }: Types.MayUseToken) => void;
            toFields: (x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) => import("../provable/field.js").Field[];
            toAuxiliary: (x?: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            } | undefined) => any[];
            sizeInFields: () => number;
            toValue: (x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) => {
                parentsOwnToken: boolean;
                inheritFromParent: boolean;
            };
            fromValue: (x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            } | {
                parentsOwnToken: boolean;
                inheritFromParent: boolean;
            }) => {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            };
            toCanonical?: ((x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) => {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) | undefined;
            fromFields: (x: import("../provable/field.js").Field[]) => {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            };
            toInput: (x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) => {
                fields?: import("../provable/field.js").Field[] | undefined;
                packed?: [import("../provable/field.js").Field, number][] | undefined;
            };
            toJSON: (x: {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            }) => {
                parentsOwnToken: boolean;
                inheritFromParent: boolean;
            };
            fromJSON: (x: {
                parentsOwnToken: boolean;
                inheritFromParent: boolean;
            }) => {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            };
            empty: () => {
                parentsOwnToken: import("../provable/bool.js").Bool;
                inheritFromParent: import("../provable/bool.js").Bool;
            };
        };
        No: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        ParentsOwnToken: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        InheritFromParent: {
            parentsOwnToken: import("../provable/bool.js").Bool;
            inheritFromParent: import("../provable/bool.js").Bool;
        };
        isNo: ({ body: { mayUseToken: { parentsOwnToken, inheritFromParent }, }, }: AccountUpdate) => import("../provable/bool.js").Bool;
        isParentsOwnToken: (a: AccountUpdate) => import("../provable/bool.js").Bool;
        isInheritFromParent: (a: AccountUpdate) => import("../provable/bool.js").Bool;
    };
    /**
     * Returns a JSON representation of only the fields that differ from the
     * default {@link AccountUpdate}.
     */
    toPretty(): any;
}
declare function hashAccountUpdate(update: AccountUpdate): import("../provable/field.js").Field;
declare const HashedAccountUpdate_base: {
    new (hash: import("../provable/field.js").Field, value: import("../../index.js").Unconstrained<AccountUpdate>): Hashed<AccountUpdate>;
    create<T>(type: import("../provable/types/provable-intf.js").WithProvable<import("../provable/crypto/poseidon.js").ProvableHashable<T>>, hash?: ((t: T) => import("../provable/field.js").Field) | undefined): typeof Hashed<T> & {
        provable: import("../provable/crypto/poseidon.js").ProvableHashable<Hashed<T>>;
        empty(): Hashed<T>;
    };
    _hash(_: any): import("../provable/field.js").Field;
    hash<T_1>(value: T_1, hash?: import("../provable/field.js").Field | undefined): Hashed<T_1>;
    _provable: import("../provable/crypto/poseidon.js").ProvableHashable<Hashed<any>> | undefined;
    _innerProvable: import("../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly innerProvable: import("../provable/crypto/poseidon.js").ProvableHashable<any>; /**
     * Modification is permitted by zkapp proofs or signatures
     */
} & {
    provable: import("../provable/crypto/poseidon.js").ProvableHashable<Hashed<AccountUpdate>>;
    empty(): Hashed<AccountUpdate>;
};
declare class HashedAccountUpdate extends HashedAccountUpdate_base {
}
type AccountUpdateTreeBase = {
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: AccountUpdateForestBase;
};
type AccountUpdateForestBase = MerkleListBase<AccountUpdateTreeBase>;
declare const AccountUpdateTreeBase: (new (value: {
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: MerkleListBase<AccountUpdateTreeBase>;
}) => {
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: MerkleListBase<AccountUpdateTreeBase>;
}) & {
    _isStruct: true;
} & Provable<{
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: MerkleListBase<AccountUpdateTreeBase>;
}> & {
    toInput: (x: {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    empty: () => {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    };
};
declare const AccountUpdateForest_base: {
    new ({ hash, data }: MerkleListBase<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>): MerkleList<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>;
    create<T>(type: import("../provable/types/provable-intf.js").WithProvable<import("../provable/crypto/poseidon.js").ProvableHashable<T>>, nextHash?: (hash: import("../provable/field.js").Field, value: T) => import("../provable/field.js").Field, emptyHash_?: import("../provable/field.js").Field): typeof MerkleList<T> & {
        empty: () => MerkleList<T>;
        from: (array: T[]) => MerkleList<T>;
        fromReverse: (array: T[]) => MerkleList<T>;
        provable: import("../provable/crypto/poseidon.js").ProvableHashable<MerkleList<T>>;
    };
    _nextHash: ((hash: import("../provable/field.js").Field, t: any) => import("../provable/field.js").Field) | undefined;
    _emptyHash: import("../provable/field.js").Field | undefined;
    _provable: import("../provable/crypto/poseidon.js").ProvableHashable<MerkleList<any>> | undefined;
    _innerProvable: import("../provable/crypto/poseidon.js").ProvableHashable<any> | undefined;
    readonly emptyHash: import("../provable/field.js").Field;
} & {
    empty: () => MerkleList<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>;
    from: (array: {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }[]) => MerkleList<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>;
    fromReverse: (array: {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }[]) => MerkleList<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>;
    provable: import("../provable/crypto/poseidon.js").ProvableHashable<MerkleList<{
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: MerkleListBase<AccountUpdateTreeBase>;
    }>>;
};
/**
 * Class which represents a forest (list of trees) of account updates,
 * in a compressed way which allows iterating and selectively witnessing the account updates.
 *
 * The (recursive) type signature is:
 * ```
 * type AccountUpdateForest = MerkleList<AccountUpdateTree>;
 * type AccountUpdateTree = {
 *   accountUpdate: Hashed<AccountUpdate>;
 *   children: AccountUpdateForest;
 * };
 * ```
 */
declare class AccountUpdateForest extends AccountUpdateForest_base {
    static provable: {
        sizeInFields(): number;
        toFields(value: AccountUpdateForest | MerkleList<{
            id: number;
            accountUpdate: Hashed<AccountUpdate>;
            children: MerkleListBase<AccountUpdateTreeBase>;
        }>): import("../provable/field.js").Field[];
        toAuxiliary(value?: AccountUpdateForest | MerkleList<{
            id: number;
            accountUpdate: Hashed<AccountUpdate>;
            children: MerkleListBase<AccountUpdateTreeBase>;
        }> | undefined): any[];
        fromFields(fields: import("../provable/field.js").Field[], aux: any[]): AccountUpdateForest;
        check(value: AccountUpdateForest | MerkleList<{
            id: number;
            accountUpdate: Hashed<AccountUpdate>;
            children: MerkleListBase<AccountUpdateTreeBase>;
        }>): void;
        toValue(value: AccountUpdateForest | MerkleList<{
            id: number;
            accountUpdate: Hashed<AccountUpdate>;
            children: MerkleListBase<AccountUpdateTreeBase>;
        }>): any;
        fromValue(value: any): AccountUpdateForest;
        empty(): AccountUpdateForest;
        toInput(value: AccountUpdateForest | MerkleList<{
            id: number;
            accountUpdate: Hashed<AccountUpdate>;
            children: MerkleListBase<AccountUpdateTreeBase>;
        }>): {
            fields?: import("../provable/field.js").Field[] | undefined;
            packed?: [import("../provable/field.js").Field, number][] | undefined;
        };
    };
    push(update: AccountUpdate | AccountUpdateTreeBase): void;
    pushIf(condition: Bool, update: AccountUpdate | AccountUpdateTreeBase): void;
    static fromFlatArray(updates: AccountUpdate[]): AccountUpdateForest;
    toFlatArray(mutate?: boolean, depth?: number): AccountUpdate[];
    static toFlatArray(forest: AccountUpdateForestBase, mutate?: boolean, depth?: number): AccountUpdate[];
    private static fromSimpleForest;
    static assertConstant(forest: AccountUpdateForestBase): void;
    static empty(): AccountUpdateForest;
    static from(array: AccountUpdateTreeBase[]): AccountUpdateForest;
    static fromReverse(array: AccountUpdateTreeBase[]): AccountUpdateForest;
}
declare const AccountUpdateTree_base: (new (value: {
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: AccountUpdateForest;
}) => {
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: AccountUpdateForest;
}) & {
    _isStruct: true;
} & Provable<{
    id: number;
    accountUpdate: Hashed<AccountUpdate>;
    children: AccountUpdateForest;
}> & {
    toInput: (x: {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: AccountUpdateForest;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    empty: () => {
        id: number;
        accountUpdate: Hashed<AccountUpdate>;
        children: AccountUpdateForest;
    };
};
/**
 * Class which represents a tree of account updates,
 * in a compressed way which allows iterating and selectively witnessing the account updates.
 *
 * The (recursive) type signature is:
 * ```
 * type AccountUpdateTree = {
 *   accountUpdate: Hashed<AccountUpdate>;
 *   children: AccountUpdateForest;
 * };
 * type AccountUpdateForest = MerkleList<AccountUpdateTree>;
 * ```
 */
declare class AccountUpdateTree extends AccountUpdateTree_base {
    /**
     * Create a tree of account updates which only consists of a root.
     */
    static from(update: AccountUpdate | AccountUpdateTree, hash?: Field): AccountUpdateTree;
    /**
     * Add an {@link AccountUpdate} or {@link AccountUpdateTree} to the children of this tree's root.
     *
     * See {@link AccountUpdate.approve}.
     */
    approve(update: AccountUpdate | AccountUpdateTree, hash?: Field): void;
    static fromFields(fields: Field[], aux: any): AccountUpdateTree;
    static empty(): AccountUpdateTree;
}
/**
 * `UnfinishedForest` / `UnfinishedTree` are structures for constructing the forest of child account updates from a circuit.
 *
 * The circuit can mutate account updates and change their array of children, so here we can't hash
 * everything immediately. Instead, we maintain a structure consisting of either hashes or full account
 * updates that can be hashed into a final call forest at the end.
 *
 * `UnfinishedForest` and `UnfinishedTree` behave like a tagged enum type:
 * ```
 * type UnfinishedForest =
 *  | Mutable of UnfinishedTree[]
 *  | Final of AccountUpdateForest;
 *
 * type UnfinishedTree = (
 *  | Mutable of AccountUpdate
 *  | Final of HashedAccountUpdate
 * ) & { children: UnfinishedForest, ... }
 * ```
 */
type UnfinishedTree = {
    id: number;
    isDummy: Bool;
    readonly children: UnfinishedForest;
    siblings?: UnfinishedForest;
} & ({
    final: HashedAccountUpdate;
    mutable?: undefined;
} | {
    final?: undefined;
    mutable: AccountUpdate;
});
type UnfinishedForestFinal = UnfinishedForest & {
    final: AccountUpdateForest;
    mutable?: undefined;
};
type UnfinishedForestMutable = UnfinishedForest & {
    final?: undefined;
    mutable: UnfinishedTree[];
};
declare class UnfinishedForest {
    final?: AccountUpdateForest;
    mutable?: UnfinishedTree[];
    isFinal(): this is UnfinishedForestFinal;
    isMutable(): this is UnfinishedForestMutable;
    constructor(mutable?: UnfinishedTree[], final?: AccountUpdateForest);
    static empty(): UnfinishedForestMutable;
    private setFinal;
    finalize(): AccountUpdateForest;
    witnessHash(): UnfinishedForestFinal;
    push(node: UnfinishedTree): void;
    remove(node: UnfinishedTree): void;
    setToForest(forest: AccountUpdateForestBase): UnfinishedForestFinal;
    static fromForest(forest: AccountUpdateForestBase): UnfinishedForestFinal;
    toFlatArray(mutate?: boolean, depth?: number): AccountUpdate[];
    toConstantInPlace(): void;
    print(): void;
}
declare const UnfinishedTree: {
    create(update: AccountUpdate | AccountUpdateTree): UnfinishedTree;
    setTo(node: UnfinishedTree, update: AccountUpdate | AccountUpdateTree): void;
    finalize(node: UnfinishedTree): AccountUpdateTreeBase & {
        isDummy: Bool;
    };
    isUnfinished(input: AccountUpdate | AccountUpdateTree | UnfinishedTree): input is UnfinishedTree;
};
declare class AccountUpdateLayout {
    readonly map: Map<number, UnfinishedTree>;
    readonly root: UnfinishedTree;
    final?: AccountUpdateForest;
    constructor(root?: AccountUpdate);
    get(update: AccountUpdate | AccountUpdateTree): UnfinishedTree | undefined;
    private getOrCreate;
    pushChild(parent: AccountUpdate | UnfinishedTree, child: AccountUpdate | AccountUpdateTree): void;
    pushTopLevel(child: AccountUpdate): void;
    setChildren(parent: AccountUpdate | UnfinishedTree, children: AccountUpdateForest): void;
    setTopLevel(children: AccountUpdateForest): void;
    disattach(update: AccountUpdate | AccountUpdateTree): UnfinishedTree | undefined;
    finalizeAndRemove(update: AccountUpdate | AccountUpdateTree): AccountUpdateForest | undefined;
    finalizeChildren(): AccountUpdateForest;
    toFlatList({ mutate }: {
        mutate: boolean;
    }): AccountUpdate[];
    forEachPredecessor(update: AccountUpdate, callback: (update: AccountUpdate) => void): void;
    toConstantInPlace(): void;
}
type ZkappCommand = {
    feePayer: FeePayerUnsigned;
    accountUpdates: AccountUpdate[];
    memo: string;
};
type ZkappCommandSigned = {
    feePayer: FeePayer;
    accountUpdates: (AccountUpdate & {
        lazyAuthorization?: LazyProof;
    })[];
    memo: string;
};
type ZkappCommandProved = {
    feePayer: FeePayerUnsigned;
    accountUpdates: (AccountUpdate & {
        lazyAuthorization?: LazySignature;
    })[];
    memo: string;
};
declare const ZkappCommand: {
    toPretty(transaction: ZkappCommand): any[];
    fromJSON(json: Types.Json.ZkappCommand): ZkappCommand;
    toJSON({ feePayer, accountUpdates, memo }: ZkappCommand): Types.Json.ZkappCommand;
};
type AccountUpdateProved = AccountUpdate & {
    lazyAuthorization?: LazySignature;
};
declare const Authorization: {
    hasLazyProof(accountUpdate: AccountUpdate): boolean;
    hasAny(accountUpdate: AccountUpdate): boolean;
    setSignature(accountUpdate: AccountUpdate, signature: string): void;
    setProof(accountUpdate: AccountUpdate, proof: string): AccountUpdateProved;
    setLazySignature(accountUpdate: AccountUpdate): void;
    setLazyNone(accountUpdate: AccountUpdate): void;
};
declare function addMissingSignatures(zkappCommand: ZkappCommand, privateKeys: PrivateKey[]): ZkappCommandSigned;
declare function dummySignature(): string;
/**
 * The public input for zkApps consists of certain hashes of the proving
 * account update (and its child updates) which is constructed during method execution.
 *
 * For SmartContract proving, a method is run twice: First outside the proof, to
 * obtain the public input, and once in the prover, which takes the public input
 * as input. The current transaction is hashed again inside the prover, which
 * asserts that the result equals the input public input, as part of the snark
 * circuit. The block producer will also hash the transaction they receive and
 * pass it as a public input to the verifier. Thus, the transaction is fully
 * constrained by the proof - the proof couldn't be used to attest to a different
 * transaction.
 */
type ZkappPublicInput = {
    accountUpdate: Field;
    calls: Field;
};
declare let ZkappPublicInput: Omit<import("../provable/types/provable-intf.js").Provable<{
    accountUpdate: import("../provable/field.js").Field;
    calls: import("../provable/field.js").Field;
}, {
    accountUpdate: bigint;
    calls: bigint;
}>, "fromFields"> & {
    fromFields: (fields: import("../provable/field.js").Field[]) => {
        accountUpdate: import("../provable/field.js").Field;
        calls: import("../provable/field.js").Field;
    };
} & {
    toInput: (x: {
        accountUpdate: import("../provable/field.js").Field;
        calls: import("../provable/field.js").Field;
    }) => {
        fields?: import("../provable/field.js").Field[] | undefined;
        packed?: [import("../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        accountUpdate: import("../provable/field.js").Field;
        calls: import("../provable/field.js").Field;
    }) => {
        accountUpdate: string;
        calls: string;
    };
    fromJSON: (x: {
        accountUpdate: string;
        calls: string;
    }) => {
        accountUpdate: import("../provable/field.js").Field;
        calls: import("../provable/field.js").Field;
    };
    empty: () => {
        accountUpdate: import("../provable/field.js").Field;
        calls: import("../provable/field.js").Field;
    };
};
declare function addMissingProofs(zkappCommand: ZkappCommand, { proofsEnabled }: {
    proofsEnabled?: boolean | undefined;
}): Promise<{
    zkappCommand: ZkappCommandProved;
    proofs: (Proof<ZkappPublicInput, Empty> | undefined)[];
}>;
