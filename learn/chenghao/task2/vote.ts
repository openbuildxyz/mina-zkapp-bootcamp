import {
  Field,
  ZkProgram,
  Struct,
  Bool,
} from 'o1js';

// 投票状态结构
class VoteState extends Struct({
  approveCount: Field,  // 赞成票数
  rejectCount: Field    // 反对票数
}) {
  // 创建初始状态
  static empty(): VoteState {
    return new VoteState({
      approveCount: Field(0),
      rejectCount: Field(0)
    });
  }
}

// 投票动作结构
class VoteAction extends Struct({
  isApprove: Bool,  // true表示赞成，false表示反对
}) {}

// 定义投票程序
const VoteProgram = ZkProgram({
  name: 'vote',
  publicInput: VoteState,
  publicOutput: VoteState,

  methods: {
    // 初始化方法
    init: {
      privateInputs: [],
      method(state: VoteState): VoteState {
        return VoteState.empty();
      },
    },

    // 投票方法
    vote: {
      privateInputs: [VoteAction],
      method(
        currentState: VoteState,
        action: VoteAction
      ): VoteState {
        // 根据投票类型更新计数
        const newApproveCount = Provable.if(
          action.isApprove,
          currentState.approveCount.add(1),
          currentState.approveCount
        );

        const newRejectCount = Provable.if(
          action.isApprove,
          currentState.rejectCount,
          currentState.rejectCount.add(1)
        );

        // 返回新状态
        return new VoteState({
          approveCount: newApproveCount,
          rejectCount: newRejectCount
        });
      },
    }
  },
});

