import { Field, SmartContract, state, State, method } from 'o1js';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class Vote extends SmartContract {
  @state(Field) num = State<Field>();
  @state(Field) yesVotes = State<Field>();
  @state(Field) noVotes = State<Field>();

  init() {
    super.init();
    this.num.set(Field(1));
    this.yesVotes.set(Field(0));
    this.noVotes.set(Field(0));
  }

  @method async update() {
    const currentState = this.num.getAndRequireEquals();
    const newState = currentState.add(2);
    this.num.set(newState);
  }
}
