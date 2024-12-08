import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  Struct,
  PublicKey,
  Signature,
  Provable,
} from 'o1js';

// 定义投票记录结构
class VoteRecord extends Struct({
  voter: PublicKey,
  vote: Bool,
  hasVoted: Bool,
}) {
  constructor(voter: PublicKey, vote: Bool, hasVoted: Bool) {
    super({ voter, vote, hasVoted });
  }
}

export class VotingSystem extends SmartContract {
  // 状态变量
  @state(Field) numYesVotes = State<Field>();
  @state(Field) numNoVotes = State<Field>();
  @state(Bool) isVotingOpen = State<Bool>();
  @state(Field) totalVoters = State<Field>();

  // 初始化合约
  init() {
    super.init();
    this.numYesVotes.set(Field(0));
    this.numNoVotes.set(Field(0));
    this.isVotingOpen.set(Bool(false));
    this.totalVoters.set(Field(0));
  }

  // 开始投票
  @method startVoting(): Promise<void> {
    // 获取并验证当前投票状态
    const votingOpen = this.isVotingOpen.get();
    this.isVotingOpen.requireEquals(votingOpen);
    votingOpen.assertEquals(Bool(false));

    // 重置投票计数
    this.numYesVotes.set(Field(0));
    this.numNoVotes.set(Field(0));
    
    // 开启投票
    this.isVotingOpen.set(Bool(true));

    return Promise.resolve();
  }

  // 结束投票
  @method endVoting(): Promise<void> {
    const votingOpen = this.isVotingOpen.get();
    this.isVotingOpen.requireEquals(votingOpen);
    votingOpen.assertEquals(Bool(true));
    
    this.isVotingOpen.set(Bool(false));

    return Promise.resolve();
  }

  // 投票方法
  @method vote(
    voterPublicKey: PublicKey,
    signature: Signature,
    voteChoice: Bool
  ): Promise<void> {
    // 验证投票状态
    const votingOpen = this.isVotingOpen.get();
    this.isVotingOpen.requireEquals(votingOpen);
    votingOpen.assertEquals(Bool(true));

    // 验证签名
    const validSignature = signature.verify(voterPublicKey, [
      voteChoice.toField(),
    ]);
    validSignature.assertTrue();

    // 获取当前票数
    const currentYesVotes = this.numYesVotes.get();
    this.numYesVotes.requireEquals(currentYesVotes);
    const currentNoVotes = this.numNoVotes.get();
    this.numNoVotes.requireEquals(currentNoVotes);

    // 根据投票选择更新计数
    const isYesVote = voteChoice.equals(Bool(true));
    
    this.numYesVotes.set(
      Provable.if(isYesVote, currentYesVotes.add(1), currentYesVotes)
    );
    
    this.numNoVotes.set(
      Provable.if(isYesVote, currentNoVotes, currentNoVotes.add(1))
    );

    return Promise.resolve();
  }

  // 添加投票者
  @method addVoter(): Promise<void> {
    const currentTotal = this.totalVoters.get();
    this.totalVoters.requireEquals(currentTotal);
    this.totalVoters.set(currentTotal.add(1));
    
    return Promise.resolve();
  }

  // 获取投票结果 - 这是一个公共方法，不是 @method
  public async getVoteResults() {
    const yesVotes = await this.numYesVotes.get();
    const noVotes = await this.numNoVotes.get();
    return {
      yesVotes,
      noVotes,
    };
  }
}
