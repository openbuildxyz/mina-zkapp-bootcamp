import 'reflect-metadata';
import { Gate, Pickles } from '../../snarky.js';
import { Field, Bool } from '../provable/wrapped.js';
import { AccountUpdate, ZkappPublicInput, AccountUpdateForest, AccountUpdateTree } from './account-update.js';
import { FlexibleProvablePure, InferProvable } from '../provable/types/struct.js';
import { Provable } from '../provable/provable.js';
import { UInt32, UInt64 } from '../provable/int.js';
import { MethodInterface } from '../proof-system/zkprogram.js';
import { Proof } from '../proof-system/proof.js';
import { PublicKey } from '../provable/crypto/signature.js';
import { Cache } from '../proof-system/cache.js';
import { SmartContractBase } from './smart-contract-base.js';
import { ProvablePure, ProvableType } from '../provable/types/provable-intf.js';
export { SmartContract, method, DeployArgs, declareMethods };
/**
 * A decorator to use in a zkApp to mark a method as provable.
 * You can use inside your zkApp class as:
 *
 * ```
 * \@method async myMethod(someArg: Field) {
 *   // your code here
 * }
 * ```
 *
 * To return a value from the method, you have to explicitly declare the return type using the {@link method.returns} decorator:
 * ```
 * \@method.returns(Field)
 * async myMethod(someArg: Field): Promise<Field> {
 *   // your code here
 * }
 * ```
 */
declare function method<K extends string, T extends SmartContract>(target: T & {
    [k in K]: (...args: any) => Promise<void>;
}, methodName: K & string & keyof T, descriptor: PropertyDescriptor, returnType?: Provable<any>): void;
declare namespace method {
    var returns: <K extends string, T extends SmartContract, R extends ProvableType>(returnType: R) => (target: T & { [k in K]: (...args: any) => Promise<InferProvable<R>>; }, methodName: K & string & keyof T, descriptor: PropertyDescriptor) => void;
}
/**
 * The main zkapp class. To write a zkapp, extend this class as such:
 *
 * ```
 * class YourSmartContract extends SmartContract {
 *   // your smart contract code here
 * }
 * ```
 *
 */
declare class SmartContract extends SmartContractBase {
    #private;
    address: PublicKey;
    tokenId: Field;
    static _methods?: MethodInterface[];
    static _methodMetadata?: Record<string, {
        actions: number;
        rows: number;
        digest: string;
        gates: Gate[];
    }>;
    static _provers?: Pickles.Prover[];
    static _maxProofsVerified?: 0 | 1 | 2;
    static _verificationKey?: {
        data: string;
        hash: Field;
    };
    /**
     * Returns a Proof type that belongs to this {@link SmartContract}.
     */
    static Proof(): {
        new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
            proof: unknown;
            publicInput: ZkappPublicInput;
            publicOutput: undefined;
            maxProofsVerified: 0 | 2 | 1;
        }): {
            verify(): void;
            verifyIf(condition: import("../provable/bool.js").Bool): void;
            publicInput: ZkappPublicInput;
            publicOutput: undefined;
            proof: unknown;
            maxProofsVerified: 0 | 2 | 1;
            shouldVerify: import("../provable/bool.js").Bool;
            toJSON(): import("../proof-system/zkprogram.js").JsonProof;
            publicFields(): {
                input: import("../provable/field.js").Field[];
                output: import("../provable/field.js").Field[];
            };
        };
        publicInputType: Omit<import("../provable/types/provable-intf.js").Provable<{
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
        publicOutputType: import("../provable/types/struct.js").ProvablePureExtended<undefined, undefined, null>;
        tag: () => typeof SmartContract;
        fromJSON<S extends import("../util/types.js").Subclass<typeof Proof>>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("../proof-system/zkprogram.js").JsonProof): Promise<Proof<InferProvable<S["publicInputType"]>, InferProvable<S["publicOutputType"]>>>;
        dummy<Input, OutPut>(publicInput: Input, publicOutput: OutPut, maxProofsVerified: 0 | 2 | 1, domainLog2?: number): Promise<Proof<Input, OutPut>>;
        readonly provable: {
            toFields: (value: Proof<any, any>) => import("../provable/field.js").Field[];
            toAuxiliary: (value?: Proof<any, any> | undefined) => any[];
            fromFields: (fields: import("../provable/field.js").Field[], aux: any[]) => Proof<any, any>;
            sizeInFields(): number;
            check: (value: Proof<any, any>) => void;
            toValue: (x: Proof<any, any>) => import("../proof-system/proof.js").ProofValue<any, any>;
            fromValue: (x: Proof<any, any> | import("../proof-system/proof.js").ProofValue<any, any>) => Proof<any, any>;
            toCanonical?: ((x: Proof<any, any>) => Proof<any, any>) | undefined;
        };
        publicFields(value: import("../proof-system/proof.js").ProofBase<any, any>): {
            input: import("../provable/field.js").Field[];
            output: import("../provable/field.js").Field[];
        };
    };
    constructor(address: PublicKey, tokenId?: Field);
    /**
     * Compile your smart contract.
     *
     * This generates both the prover functions, needed to create proofs for running `@method`s,
     * and the verification key, needed to deploy your zkApp.
     *
     * Although provers and verification key are returned by this method, they are also cached internally and used when needed,
     * so you don't actually have to use the return value of this function.
     *
     * Under the hood, "compiling" means calling into the lower-level [Pickles and Kimchi libraries](https://o1-labs.github.io/proof-systems/kimchi/overview.html) to
     * create multiple prover & verifier indices (one for each smart contract method as part of a "step circuit" and one for the "wrap circuit" which recursively wraps
     * it so that proofs end up in the original finite field). These are fairly expensive operations, so **expect compiling to take at least 20 seconds**,
     * up to several minutes if your circuit is large or your hardware is not optimal for these operations.
     */
    static compile({ cache, forceRecompile, }?: {
        cache?: Cache | undefined;
        forceRecompile?: boolean | undefined;
    }): Promise<{
        verificationKey: {
            data: string;
            hash: import("../provable/field.js").Field;
        };
        provers: Pickles.Prover[];
        verify: (statement: Pickles.Statement<import("../provable/core/fieldvar.js").FieldConst>, proof: unknown) => Promise<boolean>;
    }>;
    /**
     * Computes a hash of your smart contract, which will reliably change _whenever one of your method circuits changes_.
     * This digest is quick to compute. it is designed to help with deciding whether a contract should be re-compiled or
     * a cached verification key can be used.
     * @returns the digest, as a hex string
     */
    static digest(): Promise<string>;
    /**
     * Deploys a {@link SmartContract}.
     *
     * ```ts
     * let tx = await Mina.transaction(sender, async () => {
     *   AccountUpdate.fundNewAccount(sender);
     *   await zkapp.deploy();
     * });
     * tx.sign([senderKey, zkAppKey]);
     * ```
     */
    deploy({ verificationKey, }?: {
        verificationKey?: {
            data: string;
            hash: Field | string;
        };
    }): Promise<void>;
    /**
     * `SmartContract.init()` will be called only when a {@link SmartContract} will be first deployed, not for redeployment.
     * This method can be overridden as follows
     * ```
     * class MyContract extends SmartContract {
     *  init() {
     *    super.init();
     *    this.account.permissions.set(...);
     *    this.x.set(Field(1));
     *  }
     * }
     * ```
     */
    init(): void;
    /**
     * Use this command if the account update created by this SmartContract should be signed by the account owner,
     * instead of authorized with a proof.
     *
     * Note that the smart contract's {@link Permissions} determine which updates have to be (can be) authorized by a signature.
     *
     * If you only want to avoid creating proofs for quicker testing, we advise you to
     * use `LocalBlockchain({ proofsEnabled: false })` instead of `requireSignature()`. Setting
     * `proofsEnabled` to `false` allows you to test your transactions with the same authorization flow as in production,
     * with the only difference being that quick mock proofs are filled in instead of real proofs.
     */
    requireSignature(): void;
    /**
     * Use this command if the account update created by this SmartContract should have no authorization on it,
     * instead of being authorized with a proof.
     *
     * WARNING: This is a method that should rarely be useful. If you want to disable proofs for quicker testing, take a look
     * at `LocalBlockchain({ proofsEnabled: false })`, which causes mock proofs to be created and doesn't require changing the
     * authorization flow.
     */
    skipAuthorization(): void;
    /**
     * Returns the current {@link AccountUpdate} associated to this {@link SmartContract}.
     */
    get self(): AccountUpdate;
    /**
     * Same as `SmartContract.self` but explicitly creates a new {@link AccountUpdate}.
     */
    newSelf(methodName?: string): AccountUpdate;
    sender: {
        self: SmartContract;
        /**
         * The public key of the current transaction's sender account.
         *
         * Throws an error if not inside a transaction, or the sender wasn't passed in.
         *
         * **Warning**: The fact that this public key equals the current sender is not part of the proof.
         * A malicious prover could use any other public key without affecting the validity of the proof.
         *
         * Consider using `this.sender.getAndRequireSignature()` if you need to prove that the sender controls this account.
         */
        getUnconstrained(): PublicKey;
        /**
         * Return a public key that is forced to sign this transaction.
         *
         * Note: This doesn't prove that the return value is the transaction sender, but it proves that whoever created
         * the transaction controls the private key associated with the returned public key.
         */
        getAndRequireSignature(): PublicKey;
    };
    /**
     * Current account of the {@link SmartContract}.
     */
    get account(): import("./precondition.js").Account;
    /**
     * Current network state of the {@link SmartContract}.
     */
    get network(): import("./precondition.js").Network;
    /**
     * Current global slot on the network. This is the slot at which this transaction is included in a block. Since we cannot know this value
     * at the time of transaction construction, this only has the `assertBetween()` method but no `get()` (impossible to implement)
     * or `assertEquals()` (confusing, because the developer can't know the exact slot at which this will be included either)
     */
    get currentSlot(): import("./precondition.js").CurrentSlot;
    /**
     * Approve an account update or tree / forest of updates. Doing this means you include the account update in the zkApp's public input,
     * which allows you to read and use its content in a proof, make assertions about it, and modify it.
     *
     * ```ts
     * `@method` myApprovingMethod(update: AccountUpdate) {
     *   this.approve(update);
     *
     *   // read balance on the account (for example)
     *   let balance = update.account.balance.getAndRequireEquals();
     * }
     * ```
     *
     * Under the hood, "approving" just means that the account update is made a child of the zkApp in the
     * tree of account updates that forms the transaction. Similarly, if you pass in an {@link AccountUpdateTree},
     * the entire tree will become a subtree of the zkApp's account update.
     *
     * Passing in a forest is a bit different, because it means you set the entire children of the zkApp's account update
     * at once. `approve()` will fail if the zkApp's account update already has children, to prevent you from accidentally
     * excluding important information from the public input.
     */
    approve(update: AccountUpdate | AccountUpdateTree | AccountUpdateForest): void;
    send(args: {
        to: PublicKey | AccountUpdate | SmartContract;
        amount: number | bigint | UInt64;
    }): AccountUpdate;
    /**
     * Balance of this {@link SmartContract}.
     */
    get balance(): {
        addInPlace(x: string | number | bigint | UInt64 | UInt32 | import("../provable/int.js").Int64): void;
        subInPlace(x: string | number | bigint | UInt64 | UInt32 | import("../provable/int.js").Int64): void;
    };
    /**
     * A list of event types that can be emitted using this.emitEvent()`.
     */
    events: {
        [key: string]: FlexibleProvablePure<any>;
    };
    /**
     * Conditionally emits an event.
     *
     * Events will be emitted as a part of the transaction and can be collected by archive nodes.
     */
    emitEventIf<K extends keyof this['events']>(condition: Bool, type: K, event: any): void;
    /**
     * Emits an event. Events will be emitted as a part of the transaction and can be collected by archive nodes.
     */
    emitEvent<K extends keyof this['events']>(type: K, event: any): void;
    /**
     * Asynchronously fetches events emitted by this {@link SmartContract} and returns an array of events with their corresponding types.
     * @async
     * @param [start=UInt32.from(0)] - The start height of the events to fetch.
     * @param end - The end height of the events to fetch. If not provided, fetches events up to the latest height.
     * @returns A promise that resolves to an array of objects, each containing the event type and event data for the specified range.
     * @throws If there is an error fetching events from the Mina network.
     * @example
     * const startHeight = UInt32.from(1000);
     * const endHeight = UInt32.from(2000);
     * const events = await myZkapp.fetchEvents(startHeight, endHeight);
     * console.log(events);
     */
    fetchEvents(start?: UInt32, end?: UInt32): Promise<{
        type: string;
        event: {
            data: ProvablePure<any>;
            transactionInfo: {
                transactionHash: string;
                transactionStatus: string;
                transactionMemo: string;
            };
        };
        blockHeight: UInt32;
        blockHash: string;
        parentBlockHash: string;
        globalSlot: UInt32;
        chainStatus: string;
    }[]>;
    static runOutsideCircuit(run: () => void): void;
    /**
     * This function is run internally before compiling a smart contract, to collect metadata about what each of your
     * smart contract methods does.
     *
     * For external usage, this function can be handy because calling it involves running all methods in the same "mode" as `compile()` does,
     * so it serves as a quick-to-run check for whether your contract can be compiled without errors, which can greatly speed up iterating.
     *
     * `analyzeMethods()` will also return the number of `rows` of each of your method circuits (i.e., the number of constraints in the underlying proof system),
     * which is a good indicator for circuit size and the time it will take to create proofs.
     * To inspect the created circuit in detail, you can look at the returned `gates`.
     *
     * Note: If this function was already called before, it will short-circuit and just return the metadata collected the first time.
     *
     * @returns an object, keyed by method name, each entry containing:
     *  - `rows` the size of the constraint system created by this method
     *  - `digest` a digest of the method circuit
     *  - `actions` the number of actions the method dispatches
     *  - `gates` the constraint system, represented as an array of gates
     */
    static analyzeMethods({ printSummary }?: {
        printSummary?: boolean | undefined;
    }): Promise<Record<string, {
        actions: number;
        rows: number;
        digest: string;
        gates: Gate[];
    }>>;
}
type DeployArgs = {
    verificationKey?: {
        data: string;
        hash: string | Field;
    };
} | undefined;
/**
 * `declareMethods` can be used in place of the `@method` decorator
 * to declare SmartContract methods along with their list of arguments.
 * It should be placed _after_ the class declaration.
 * Here is an example of declaring a method `update`, which takes a single argument of type `Field`:
 * ```ts
 * class MyContract extends SmartContract {
 *   // ...
 *   update(x: Field) {
 *     // ...
 *   }
 * }
 * declareMethods(MyContract, { update: [Field] }); // `[Field]` is the list of arguments!
 * ```
 * Note that a method of the same name must still be defined on the class, just without the decorator.
 */
declare function declareMethods<T extends typeof SmartContract>(SmartContract: T, methodArguments: Record<string, Provable<unknown>[]>): void;
