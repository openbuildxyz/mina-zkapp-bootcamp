import { Field, method, SmartContract, State, state } from 'o1js';

export class Vote extends SmartContract {
  @state(Field) agreedCount = State<Field>(Field(0));
  @state(Field) rejectedCount = State<Field>(Field(0));

  @method async agree() {
    const agreedCount = this.agreedCount.getAndRequireEquals();
    this.agreedCount.set(agreedCount.add(1));
  }

  @method async reject() {
    const rejectedCount = this.rejectedCount.getAndRequireEquals();
    this.rejectedCount.set(rejectedCount.add(1));
  }
}
