import { PublicKey, UInt64, UInt32, TokenId, Field, AuthRequired, BalanceChange, Sign, Bool } from '../transaction-leaves-bigint.js';
import { GenericSignable } from '../../lib/generic.js';
import { GenericLayout } from '../../lib/from-layout.js';
import * as Json from './transaction-json.js';
export { customTypes, ZkappCommand, AccountUpdate, Account };
export { Json };
export * from '../transaction-leaves-bigint.js';
export { signableFromLayout, toJSONEssential, empty, Layout, TypeMap };
type TypeMap = {
    PublicKey: PublicKey;
    UInt64: UInt64;
    UInt32: UInt32;
    TokenId: TokenId;
    Field: Field;
    AuthRequired: AuthRequired;
    BalanceChange: BalanceChange;
    Sign: Sign;
    Bool: Bool;
};
declare const TypeMap: {
    [K in keyof TypeMap]: Signable<TypeMap[K], Json.TypeMap[K]>;
};
type Signable<T, TJson> = GenericSignable<T, TJson, Field>;
type Layout = GenericLayout<TypeMap>;
type CustomTypes = {
    TransactionVersion: Signable<UInt32, Json.TypeMap['UInt32']>;
    ZkappUri: Signable<{
        data: string;
        hash: Field;
    }, string>;
    TokenSymbol: Signable<{
        symbol: string;
        field: Field;
    }, string>;
    StateHash: Signable<Field, Json.TypeMap['Field']>;
    BalanceChange: Signable<BalanceChange, {
        magnitude: Json.TypeMap['UInt64'];
        sgn: Json.TypeMap['Sign'];
    }>;
    Events: Signable<{
        data: Field[][];
        hash: Field;
    }, Json.TypeMap['Field'][][]>;
    Actions: Signable<{
        data: Field[][];
        hash: Field;
    }, Json.TypeMap['Field'][][]>;
    ActionState: Signable<Field, Json.TypeMap['Field']>;
    MayUseToken: Signable<{
        parentsOwnToken: Bool;
        inheritFromParent: Bool;
    }, {
        parentsOwnToken: Json.TypeMap['Bool'];
        inheritFromParent: Json.TypeMap['Bool'];
    }>;
    VerificationKeyHash: Signable<Field, Json.TypeMap['Field']>;
    ReceiptChainHash: Signable<Field, Json.TypeMap['Field']>;
};
declare let customTypes: CustomTypes;
declare let signableFromLayout: <T, TJson>(typeData: GenericLayout<TypeMap>) => {
    toJSON(value: T): TJson;
    fromJSON(json: TJson): T;
    toInput(value: T): {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    empty(): T;
}, toJSONEssential: (typeData: GenericLayout<TypeMap>, value: any) => any, empty: (typeData: GenericLayout<TypeMap>) => any;
type ZkappCommand = {
    feePayer: {
        body: {
            publicKey: PublicKey;
            fee: UInt64;
            validUntil?: UInt32;
            nonce: UInt32;
        };
        authorization: string;
    };
    accountUpdates: {
        body: {
            publicKey: PublicKey;
            tokenId: TokenId;
            update: {
                appState: {
                    isSome: Bool;
                    value: Field;
                }[];
                delegate: {
                    isSome: Bool;
                    value: PublicKey;
                };
                verificationKey: {
                    isSome: Bool;
                    value: {
                        data: string;
                        hash: Field;
                    };
                };
                permissions: {
                    isSome: Bool;
                    value: {
                        editState: AuthRequired;
                        access: AuthRequired;
                        send: AuthRequired;
                        receive: AuthRequired;
                        setDelegate: AuthRequired;
                        setPermissions: AuthRequired;
                        setVerificationKey: {
                            auth: AuthRequired;
                            txnVersion: UInt32;
                        };
                        setZkappUri: AuthRequired;
                        editActionState: AuthRequired;
                        setTokenSymbol: AuthRequired;
                        incrementNonce: AuthRequired;
                        setVotingFor: AuthRequired;
                        setTiming: AuthRequired;
                    };
                };
                zkappUri: {
                    isSome: Bool;
                    value: {
                        data: string;
                        hash: Field;
                    };
                };
                tokenSymbol: {
                    isSome: Bool;
                    value: {
                        symbol: string;
                        field: Field;
                    };
                };
                timing: {
                    isSome: Bool;
                    value: {
                        initialMinimumBalance: UInt64;
                        cliffTime: UInt32;
                        cliffAmount: UInt64;
                        vestingPeriod: UInt32;
                        vestingIncrement: UInt64;
                    };
                };
                votingFor: {
                    isSome: Bool;
                    value: Field;
                };
            };
            balanceChange: BalanceChange;
            incrementNonce: Bool;
            events: {
                data: Field[][];
                hash: Field;
            };
            actions: {
                data: Field[][];
                hash: Field;
            };
            callData: Field;
            callDepth: number;
            preconditions: {
                network: {
                    snarkedLedgerHash: {
                        isSome: Bool;
                        value: Field;
                    };
                    blockchainLength: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                    minWindowDensity: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                    totalCurrency: {
                        isSome: Bool;
                        value: {
                            lower: UInt64;
                            upper: UInt64;
                        };
                    };
                    globalSlotSinceGenesis: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                    stakingEpochData: {
                        ledger: {
                            hash: {
                                isSome: Bool;
                                value: Field;
                            };
                            totalCurrency: {
                                isSome: Bool;
                                value: {
                                    lower: UInt64;
                                    upper: UInt64;
                                };
                            };
                        };
                        seed: {
                            isSome: Bool;
                            value: Field;
                        };
                        startCheckpoint: {
                            isSome: Bool;
                            value: Field;
                        };
                        lockCheckpoint: {
                            isSome: Bool;
                            value: Field;
                        };
                        epochLength: {
                            isSome: Bool;
                            value: {
                                lower: UInt32;
                                upper: UInt32;
                            };
                        };
                    };
                    nextEpochData: {
                        ledger: {
                            hash: {
                                isSome: Bool;
                                value: Field;
                            };
                            totalCurrency: {
                                isSome: Bool;
                                value: {
                                    lower: UInt64;
                                    upper: UInt64;
                                };
                            };
                        };
                        seed: {
                            isSome: Bool;
                            value: Field;
                        };
                        startCheckpoint: {
                            isSome: Bool;
                            value: Field;
                        };
                        lockCheckpoint: {
                            isSome: Bool;
                            value: Field;
                        };
                        epochLength: {
                            isSome: Bool;
                            value: {
                                lower: UInt32;
                                upper: UInt32;
                            };
                        };
                    };
                };
                account: {
                    balance: {
                        isSome: Bool;
                        value: {
                            lower: UInt64;
                            upper: UInt64;
                        };
                    };
                    nonce: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                    receiptChainHash: {
                        isSome: Bool;
                        value: Field;
                    };
                    delegate: {
                        isSome: Bool;
                        value: PublicKey;
                    };
                    state: {
                        isSome: Bool;
                        value: Field;
                    }[];
                    actionState: {
                        isSome: Bool;
                        value: Field;
                    };
                    provedState: {
                        isSome: Bool;
                        value: Bool;
                    };
                    isNew: {
                        isSome: Bool;
                        value: Bool;
                    };
                };
                validWhile: {
                    isSome: Bool;
                    value: {
                        lower: UInt32;
                        upper: UInt32;
                    };
                };
            };
            useFullCommitment: Bool;
            implicitAccountCreationFee: Bool;
            mayUseToken: {
                parentsOwnToken: Bool;
                inheritFromParent: Bool;
            };
            authorizationKind: {
                isSigned: Bool;
                isProved: Bool;
                verificationKeyHash: Field;
            };
        };
        authorization: {
            proof?: string;
            signature?: string;
        };
    }[];
    memo: string;
};
declare let ZkappCommand: {
    toJSON(value: ZkappCommand): Json.ZkappCommand;
    fromJSON(json: Json.ZkappCommand): ZkappCommand;
    toInput(value: ZkappCommand): {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    empty(): ZkappCommand;
};
type AccountUpdate = {
    body: {
        publicKey: PublicKey;
        tokenId: TokenId;
        update: {
            appState: {
                isSome: Bool;
                value: Field;
            }[];
            delegate: {
                isSome: Bool;
                value: PublicKey;
            };
            verificationKey: {
                isSome: Bool;
                value: {
                    data: string;
                    hash: Field;
                };
            };
            permissions: {
                isSome: Bool;
                value: {
                    editState: AuthRequired;
                    access: AuthRequired;
                    send: AuthRequired;
                    receive: AuthRequired;
                    setDelegate: AuthRequired;
                    setPermissions: AuthRequired;
                    setVerificationKey: {
                        auth: AuthRequired;
                        txnVersion: UInt32;
                    };
                    setZkappUri: AuthRequired;
                    editActionState: AuthRequired;
                    setTokenSymbol: AuthRequired;
                    incrementNonce: AuthRequired;
                    setVotingFor: AuthRequired;
                    setTiming: AuthRequired;
                };
            };
            zkappUri: {
                isSome: Bool;
                value: {
                    data: string;
                    hash: Field;
                };
            };
            tokenSymbol: {
                isSome: Bool;
                value: {
                    symbol: string;
                    field: Field;
                };
            };
            timing: {
                isSome: Bool;
                value: {
                    initialMinimumBalance: UInt64;
                    cliffTime: UInt32;
                    cliffAmount: UInt64;
                    vestingPeriod: UInt32;
                    vestingIncrement: UInt64;
                };
            };
            votingFor: {
                isSome: Bool;
                value: Field;
            };
        };
        balanceChange: BalanceChange;
        incrementNonce: Bool;
        events: {
            data: Field[][];
            hash: Field;
        };
        actions: {
            data: Field[][];
            hash: Field;
        };
        callData: Field;
        callDepth: number;
        preconditions: {
            network: {
                snarkedLedgerHash: {
                    isSome: Bool;
                    value: Field;
                };
                blockchainLength: {
                    isSome: Bool;
                    value: {
                        lower: UInt32;
                        upper: UInt32;
                    };
                };
                minWindowDensity: {
                    isSome: Bool;
                    value: {
                        lower: UInt32;
                        upper: UInt32;
                    };
                };
                totalCurrency: {
                    isSome: Bool;
                    value: {
                        lower: UInt64;
                        upper: UInt64;
                    };
                };
                globalSlotSinceGenesis: {
                    isSome: Bool;
                    value: {
                        lower: UInt32;
                        upper: UInt32;
                    };
                };
                stakingEpochData: {
                    ledger: {
                        hash: {
                            isSome: Bool;
                            value: Field;
                        };
                        totalCurrency: {
                            isSome: Bool;
                            value: {
                                lower: UInt64;
                                upper: UInt64;
                            };
                        };
                    };
                    seed: {
                        isSome: Bool;
                        value: Field;
                    };
                    startCheckpoint: {
                        isSome: Bool;
                        value: Field;
                    };
                    lockCheckpoint: {
                        isSome: Bool;
                        value: Field;
                    };
                    epochLength: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                };
                nextEpochData: {
                    ledger: {
                        hash: {
                            isSome: Bool;
                            value: Field;
                        };
                        totalCurrency: {
                            isSome: Bool;
                            value: {
                                lower: UInt64;
                                upper: UInt64;
                            };
                        };
                    };
                    seed: {
                        isSome: Bool;
                        value: Field;
                    };
                    startCheckpoint: {
                        isSome: Bool;
                        value: Field;
                    };
                    lockCheckpoint: {
                        isSome: Bool;
                        value: Field;
                    };
                    epochLength: {
                        isSome: Bool;
                        value: {
                            lower: UInt32;
                            upper: UInt32;
                        };
                    };
                };
            };
            account: {
                balance: {
                    isSome: Bool;
                    value: {
                        lower: UInt64;
                        upper: UInt64;
                    };
                };
                nonce: {
                    isSome: Bool;
                    value: {
                        lower: UInt32;
                        upper: UInt32;
                    };
                };
                receiptChainHash: {
                    isSome: Bool;
                    value: Field;
                };
                delegate: {
                    isSome: Bool;
                    value: PublicKey;
                };
                state: {
                    isSome: Bool;
                    value: Field;
                }[];
                actionState: {
                    isSome: Bool;
                    value: Field;
                };
                provedState: {
                    isSome: Bool;
                    value: Bool;
                };
                isNew: {
                    isSome: Bool;
                    value: Bool;
                };
            };
            validWhile: {
                isSome: Bool;
                value: {
                    lower: UInt32;
                    upper: UInt32;
                };
            };
        };
        useFullCommitment: Bool;
        implicitAccountCreationFee: Bool;
        mayUseToken: {
            parentsOwnToken: Bool;
            inheritFromParent: Bool;
        };
        authorizationKind: {
            isSigned: Bool;
            isProved: Bool;
            verificationKeyHash: Field;
        };
    };
    authorization: {
        proof?: string;
        signature?: string;
    };
};
declare let AccountUpdate: {
    toJSON(value: AccountUpdate): Json.AccountUpdate;
    fromJSON(json: Json.AccountUpdate): AccountUpdate;
    toInput(value: AccountUpdate): {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    empty(): AccountUpdate;
};
type Account = {
    publicKey: PublicKey;
    tokenId: TokenId;
    tokenSymbol: string;
    balance: UInt64;
    nonce: UInt32;
    receiptChainHash: Field;
    delegate?: PublicKey;
    votingFor: Field;
    timing: {
        isTimed: Bool;
        initialMinimumBalance: UInt64;
        cliffTime: UInt32;
        cliffAmount: UInt64;
        vestingPeriod: UInt32;
        vestingIncrement: UInt64;
    };
    permissions: {
        editState: AuthRequired;
        access: AuthRequired;
        send: AuthRequired;
        receive: AuthRequired;
        setDelegate: AuthRequired;
        setPermissions: AuthRequired;
        setVerificationKey: {
            auth: AuthRequired;
            txnVersion: UInt32;
        };
        setZkappUri: AuthRequired;
        editActionState: AuthRequired;
        setTokenSymbol: AuthRequired;
        incrementNonce: AuthRequired;
        setVotingFor: AuthRequired;
        setTiming: AuthRequired;
    };
    zkapp?: {
        appState: Field[];
        verificationKey?: {
            data: string;
            hash: Field;
        };
        zkappVersion: UInt32;
        actionState: Field[];
        lastActionSlot: UInt32;
        provedState: Bool;
        zkappUri: string;
    };
};
declare let Account: {
    toJSON(value: Account): Json.Account;
    fromJSON(json: Json.Account): Account;
    toInput(value: Account): {
        fields?: bigint[] | undefined;
        packed?: [bigint, number][] | undefined;
    };
    empty(): Account;
};
