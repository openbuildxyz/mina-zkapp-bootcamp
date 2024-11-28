import {
  Field,
  ZkProgram,
  state,
  State,
  method,
  Provable,
  Bool,
  SmartContract,
} from 'o1js';
// const Vote = ZkProgram({
//   name: 'Vote',
//   publicInput: Field,

//   methods: {
//     count: {
//       privateInputs: [],

//       async method(publicInput: Field) {
//         publicInput.assertEquals(Field(0));
//       },
//     },
//   },
// });
export class Vote extends SmartContract {
  // 赞成票
  @state(Field) approveNum = State<Field>();
  // 返回票
  @state(Field) opposeNum = State<Field>();

  init() {
    super.init();
    this.approveNum.set(Field(0));
    this.opposeNum.set(Field(0));
  }

  @method async count(result: Bool) {
    const currentApprove = this.approveNum.getAndRequireEquals();
    const newApproveState = Provable.if(
      new Bool(result),
      currentApprove.add(1),
      currentApprove
    );
    this.approveNum.set(newApproveState);

    const currentOppose = this.opposeNum.getAndRequireEquals();
    const newOpposeState = Provable.if(
      new Bool(result),
      currentOppose,
      currentOppose.add(1)
    );
    this.opposeNum.set(newOpposeState);
  }
}
