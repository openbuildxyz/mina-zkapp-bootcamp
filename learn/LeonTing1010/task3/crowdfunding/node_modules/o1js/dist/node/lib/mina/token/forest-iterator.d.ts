import { AccountUpdate, AccountUpdateForest, AccountUpdateTreeBase } from '../account-update.js';
import { Field } from '../../provable/wrapped.js';
import { Provable } from '../../provable/provable.js';
import { MerkleListIterator, MerkleList } from '../../provable/merkle-list.js';
export { TokenAccountUpdateIterator };
declare const Layer_base: (new (value: {
    forest: MerkleListIterator<{
        id: number;
        accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
        children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
    }>;
    mayUseToken: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
}) => {
    forest: MerkleListIterator<{
        id: number;
        accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
        children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
    }>;
    mayUseToken: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
}) & {
    _isStruct: true;
} & Provable<{
    forest: MerkleListIterator<{
        id: number;
        accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
        children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
    }>;
    mayUseToken: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
}, {
    forest: any;
    mayUseToken: {
        parentsOwnToken: boolean;
        inheritFromParent: boolean;
    };
}> & {
    fromValue: (value: {
        forest: any;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        } | {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
    }) => {
        forest: MerkleListIterator<{
            id: number;
            accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
            children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
        }>;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    };
    toInput: (x: {
        forest: MerkleListIterator<{
            id: number;
            accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
            children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
        }>;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    }) => {
        fields?: import("../../provable/field.js").Field[] | undefined;
        packed?: [import("../../provable/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        forest: MerkleListIterator<{
            id: number;
            accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
            children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
        }>;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    }) => {
        forest: {
            prototype: {
                readonly data: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                readonly hash: string;
                currentHash: string;
                currentIndex: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                assertAtStart: {};
                isAtEnd: {};
                jumpToEnd: {};
                jumpToEndIf: {};
                assertAtEnd: {};
                isAtStart: {};
                jumpToStart: {};
                jumpToStartIf: {};
                _index: {};
                _updateIndex: {};
                previous: {};
                next: {};
                readonly Unsafe: {
                    previous: {};
                    next: {};
                };
                clone: {};
                readonly Constructor: {
                    prototype: any;
                    create: {};
                    createFromList: {};
                    _nextHash: {} | null;
                    _emptyHash: string | null;
                    _provable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    _innerProvable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    readonly emptyHash: string;
                };
                nextHash: {};
                readonly innerProvable: {
                    toFields: {};
                    toAuxiliary: {};
                    fromFields: {};
                    sizeInFields: {};
                    check: {};
                    toValue: {};
                    fromValue: {};
                    toCanonical?: {} | null | undefined;
                    toInput: {};
                    empty: {};
                };
            };
            create: {};
            createFromList: {};
            _nextHash: {} | null;
            _emptyHash: string | null;
            _provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            _innerProvable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            readonly emptyHash: string;
            from: {};
            startIterating: {};
            startIteratingFromLast: {};
            empty: {};
            provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            };
        };
        mayUseToken: {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
    };
    fromJSON: (x: {
        forest: {
            prototype: {
                readonly data: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                readonly hash: string;
                currentHash: string;
                currentIndex: {
                    get: {};
                    set: {};
                    setTo: {};
                    updateAsProver: {};
                };
                assertAtStart: {};
                isAtEnd: {};
                jumpToEnd: {};
                jumpToEndIf: {};
                assertAtEnd: {};
                isAtStart: {};
                jumpToStart: {};
                jumpToStartIf: {};
                _index: {};
                _updateIndex: {};
                previous: {};
                next: {};
                readonly Unsafe: {
                    previous: {};
                    next: {};
                };
                clone: {};
                readonly Constructor: {
                    prototype: any;
                    create: {};
                    createFromList: {};
                    _nextHash: {} | null;
                    _emptyHash: string | null;
                    _provable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    _innerProvable: {
                        toFields: {};
                        toAuxiliary: {};
                        fromFields: {};
                        sizeInFields: {};
                        check: {};
                        toValue: {};
                        fromValue: {};
                        toCanonical?: {} | null | undefined;
                        toInput: {};
                        empty: {};
                    } | null;
                    readonly emptyHash: string;
                };
                nextHash: {};
                readonly innerProvable: {
                    toFields: {};
                    toAuxiliary: {};
                    fromFields: {};
                    sizeInFields: {};
                    check: {};
                    toValue: {};
                    fromValue: {};
                    toCanonical?: {} | null | undefined;
                    toInput: {};
                    empty: {};
                };
            };
            create: {};
            createFromList: {};
            _nextHash: {} | null;
            _emptyHash: string | null;
            _provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            _innerProvable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            } | null;
            readonly emptyHash: string;
            from: {};
            startIterating: {};
            startIteratingFromLast: {};
            empty: {};
            provable: {
                toFields: {};
                toAuxiliary: {};
                fromFields: {};
                sizeInFields: {};
                check: {};
                toValue: {};
                fromValue: {};
                toCanonical?: {} | null | undefined;
                toInput: {};
                empty: {};
            };
        };
        mayUseToken: {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
    }) => {
        forest: MerkleListIterator<{
            id: number;
            accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
            children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
        }>;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    };
    empty: () => {
        forest: MerkleListIterator<{
            id: number;
            accountUpdate: import("../../provable/packed.js").Hashed<AccountUpdate>;
            children: import("../../provable/merkle-list.js").MerkleListBase<AccountUpdateTreeBase>;
        }>;
        mayUseToken: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    };
};
declare class Layer extends Layer_base {
}
type MayUseToken = AccountUpdate['body']['mayUseToken'];
declare const MayUseToken: {
    type: {
        check: ({ parentsOwnToken, inheritFromParent }: import("../../../bindings/mina-transaction/transaction-leaves.js").MayUseToken) => void;
        toFields: (x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) => import("../../provable/field.js").Field[];
        toAuxiliary: (x?: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        } | undefined) => any[];
        sizeInFields: () => number;
        toValue: (x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
        fromValue: (x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        } | {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        }) => {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
        toCanonical?: ((x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) | undefined;
        fromFields: (x: import("../../provable/field.js").Field[]) => {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
        toInput: (x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) => {
            fields?: import("../../provable/field.js").Field[] | undefined;
            packed?: [import("../../provable/field.js").Field, number][] | undefined;
        };
        toJSON: (x: {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        }) => {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        };
        fromJSON: (x: {
            parentsOwnToken: boolean;
            inheritFromParent: boolean;
        }) => {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
        empty: () => {
            parentsOwnToken: import("../../provable/bool.js").Bool;
            inheritFromParent: import("../../provable/bool.js").Bool;
        };
    };
    No: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
    ParentsOwnToken: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
    InheritFromParent: {
        parentsOwnToken: import("../../provable/bool.js").Bool;
        inheritFromParent: import("../../provable/bool.js").Bool;
    };
    isNo: ({ body: { mayUseToken: { parentsOwnToken, inheritFromParent }, }, }: AccountUpdate) => import("../../provable/bool.js").Bool;
    isParentsOwnToken: (a: AccountUpdate) => import("../../provable/bool.js").Bool;
    isInheritFromParent: (a: AccountUpdate) => import("../../provable/bool.js").Bool;
};
/**
 * Data structure to represent a forest of account updates that is being iterated over,
 * in the context of a token manager contract.
 *
 * The iteration is done in a depth-first manner.
 *
 * ```ts
 * let forest: AccountUpdateForest = ...;
 * let tokenIterator = TokenAccountUpdateIterator.create(forest, tokenId);
 *
 * // process the first 5 account updates in the tree
 * for (let i = 0; i < 5; i++) {
 *  let { accountUpdate, usesThisToken } = tokenIterator.next();
 *  // ... do something with the account update ...
 * }
 * ```
 *
 * **Important**: Since this is specifically used by token manager contracts to process their entire subtree
 * of account updates, the iterator skips subtrees that don't inherit token permissions and can therefore definitely not use the token.
 *
 * So, the assumption is that the consumer of this iterator is only interested in account updates that use the token.
 * We still can't avoid processing some account updates that don't use the token, therefore the iterator returns a boolean
 * `usesThisToken` alongside each account update.
 */
declare class TokenAccountUpdateIterator {
    currentLayer: Layer;
    unfinishedParentLayers: MerkleList<Layer>;
    selfToken: Field;
    constructor(forest: MerkleListIterator<AccountUpdateTreeBase>, mayUseToken: MayUseToken, selfToken: Field);
    static create(forest: AccountUpdateForest, selfToken: Field): TokenAccountUpdateIterator;
    /**
     * Make a single step along a tree of account updates.
     *
     * This function is guaranteed to visit each account update in the tree that uses the token
     * exactly once, when called repeatedly.
     *
     * The method makes a best effort to avoid visiting account updates that are not using the token,
     * and in particular, to avoid returning dummy updates.
     * However, neither can be ruled out. We're returning { update, usesThisToken: Bool } and let the
     * caller handle the irrelevant case where `usesThisToken` is false.
     */
    next(): {
        accountUpdate: AccountUpdate;
        usesThisToken: import("../../provable/bool.js").Bool;
    };
    assertFinished(message?: string): void;
}
