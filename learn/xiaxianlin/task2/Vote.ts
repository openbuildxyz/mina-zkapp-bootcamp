import { Bool, Field, MerkleWitness, Poseidon, Provable, PublicKey, SelfProof, Struct, ZkProgram } from 'o1js';

export class MerkleWitness20 extends MerkleWitness(20) {}
export class VoteState extends Struct({
  agree: Field,
  reject: Field,
  /** 团队根节点，递归传入，用来验证成员 */
  memberTreeRoot: Field,
}) {
  /** 初始化投票状态 */
  static init(memberTreeRoot: Field) {
    return new VoteState({
      agree: Field(0),
      reject: Field(0),
      memberTreeRoot,
    });
  }

  /**
   * 创建一个新投票状态
   * @param state 上一次投票状态
   * @param result 投票结果
   * @param publicKey 投票人
   * @param memberTreeWitness 投票人证据
   * @returns 下一个投票状态
   */
  static create(state: VoteState, result: Bool, publicKey: PublicKey, memberTreeWitness: MerkleWitness20) {
    // 根据 MerkleTree 计算出当前投票人是否在团队中
    const root = memberTreeWitness.calculateRoot(Poseidon.hash(publicKey.toFields()));
    root.assertEquals(state.memberTreeRoot);

    // 返回当前投票状态
    return new VoteState({
      agree: state.agree.add(Provable.if(result, Field(1), Field(0))),
      reject: state.reject.add(Provable.if(result, Field(0), Field(1))),
      memberTreeRoot: state.memberTreeRoot,
    });
  }

  static assertInitialState(state: VoteState) {
    state.agree.assertEquals(Field(0));
    state.reject.assertEquals(Field(0));
  }

  static assertEquals(state1: VoteState, state2: VoteState) {
    state1.agree.assertEquals(state2.agree);
    state1.reject.assertEquals(state2.reject);
    state1.memberTreeRoot.assertEquals(state2.memberTreeRoot);
  }
}

export const Vote = ZkProgram({
  name: 'vote',
  publicInput: VoteState,
  methods: {
    init: {
      privateInputs: [],
      async method(state: VoteState) {
        VoteState.assertInitialState(state);
      },
    },

    vote: {
      privateInputs: [SelfProof, Bool, PublicKey, MerkleWitness20],
      async method(
        state: VoteState,
        lastProof: SelfProof<VoteState, void>,
        result: Bool,
        member: PublicKey,
        memberWitness: MerkleWitness20
      ) {
        lastProof.verify();
        const nextState = VoteState.create(lastProof.publicInput, result, member, memberWitness);
        VoteState.assertEquals(nextState, state);
      },
    },
  },
});
