import { Field } from '../../provable/wrapped.js';
import { FlexibleProvablePure, InferProvable } from '../../provable/types/struct.js';
import { Provable } from '../../provable/provable.js';
import { MerkleList } from '../../provable/merkle-list.js';
import type { SmartContract } from '../zkapp.js';
export { Reducer, getReducer };
declare const Reducer: (<T extends FlexibleProvablePure<any>, A extends InferProvable<T> = InferProvable<T>>(reducer: {
    actionType: T;
}) => ReducerReturn<A>) & {
    initialActionState: Field;
};
type Reducer<Action> = {
    actionType: FlexibleProvablePure<Action>;
};
type ReducerReturn<Action> = {
    /**
     * Dispatches an {@link Action}. Similar to normal {@link Event}s,
     * {@link Action}s can be stored by archive nodes and later reduced within a {@link SmartContract} method
     * to change the state of the contract accordingly
     *
     * ```ts
     * this.reducer.dispatch(Field(1)); // emits one action
     * ```
     *
     * */
    dispatch(action: Action): void;
    /**
     * Reduces a list of {@link Action}s, similar to `Array.reduce()`.
     *
     * ```ts
     *  let pendingActions = this.reducer.getActions({
     *    fromActionState: actionState,
     *  });
     *
     *  let newState = this.reducer.reduce(
     *    pendingActions,
     *    Field, // the state type
     *    (state: Field, _action: Field) => {
     *      return state.add(1);
     *    },
     *    initialState // initial state
     * );
     * ```
     *
     * Warning: The reducer API in o1js is currently not safe to use in production applications. The `reduce()`
     * method breaks if more than the hard-coded number (default: 32) of actions are pending. Work is actively
     * in progress to mitigate this limitation.
     */
    reduce<State>(actions: MerkleList<MerkleList<Action>>, stateType: Provable<State>, reduce: (state: State, action: Action) => State, initial: State, options?: {
        maxUpdatesWithActions?: number;
        maxActionsPerUpdate?: number;
        skipActionStatePrecondition?: boolean;
    }): State;
    /**
     * Perform circuit logic for every {@link Action} in the list.
     *
     * This is a wrapper around {@link reduce} for when you don't need `state`.
     */
    forEach(actions: MerkleList<MerkleList<Action>>, reduce: (action: Action) => void, options?: {
        maxUpdatesWithActions?: number;
        maxActionsPerUpdate?: number;
        skipActionStatePrecondition?: boolean;
    }): void;
    /**
     * Fetches the list of previously emitted {@link Action}s by this {@link SmartContract}.
     * ```ts
     * let pendingActions = this.reducer.getActions({
     *    fromActionState: actionState,
     * });
     * ```
     *
     * The final action state can be accessed on `pendingActions.hash`.
     * ```ts
     * let endActionState = pendingActions.hash;
     * ```
     *
     * If the optional `endActionState` is provided, the list of actions will be fetched up to that state.
     * In that case, `pendingActions.hash` is guaranteed to equal `endActionState`.
     */
    getActions({ fromActionState, endActionState, }?: {
        fromActionState?: Field;
        endActionState?: Field;
    }): MerkleList<MerkleList<Action>>;
    /**
     * Fetches the list of previously emitted {@link Action}s by zkapp {@link SmartContract}.
     * ```ts
     * let pendingActions = await zkapp.reducer.fetchActions({
     *    fromActionState: actionState,
     * });
     * ```
     */
    fetchActions({ fromActionState, endActionState, }?: {
        fromActionState?: Field;
        endActionState?: Field;
    }): Promise<Action[][]>;
};
declare function getReducer<A>(contract: SmartContract): ReducerReturn<A>;
