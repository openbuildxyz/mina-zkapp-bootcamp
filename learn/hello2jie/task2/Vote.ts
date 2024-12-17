import { Field, SmartContract, state, State, method, MerkleMapWitness, Bool, MerkleMap, Provable } from 'o1js';

export class Vote extends SmartContract {
  @state(Field) memberRoot = State<Field>();
  @state(Field) approveVotes = State<Field>();
  @state(Field) rejectVotes = State<Field>();

  init() {
    super.init();
    this.approveVotes.set(Field(0));
    this.rejectVotes.set(Field(0));

    const initialMemberMap = new MerkleMap();
    this.memberRoot.set(initialMemberMap.getRoot());
  }

  /**
   * Adds a new member to the voting system
   * @param path MerkleMapWitness for the member
   */
  @method async addMember(path: MerkleMapWitness) {
    const [newRoot, memberKey] = path.computeRootAndKey(Field(6));
    this.memberRoot.set(newRoot);
  }

  /**
   * Submits a vote after verifying membership
   * @param voteType True for approve, False for reject
   * @param memberAddress Address of the voting member
   * @param path MerkleMapWitness proving membership
   */
  @method async submitVote(voteType: Bool, memberAddress: Field, path: MerkleMapWitness) {
    // 验证成员身份
    this.verifyMembership(memberAddress, path);

    // 更新投票计数
    this.updateVoteCounts(voteType);
  }

  /**
   * Private helper to verify member's voting eligibility
   */
  private verifyMembership(memberAddress: Field, path: MerkleMapWitness) {
    const memberRoot = this.memberRoot.getAndRequireEquals();
    const [computedRoot, key] = path.computeRootAndKey(Field(6));

    computedRoot.assertEquals(memberRoot, 'Non-member cannot vote');
    key.assertEquals(memberAddress, 'Member address mismatch');
  }

  /**
   * Private helper to update vote counts
   */
  private updateVoteCounts(voteType: Bool) {
    const approveVotes = this.approveVotes.getAndRequireEquals();
    const rejectVotes = this.rejectVotes.getAndRequireEquals();

    this.approveVotes.set(
      Provable.if(voteType, approveVotes.add(Field(1)), approveVotes)
    );
    this.rejectVotes.set(
      Provable.if(voteType, rejectVotes, rejectVotes.add(Field(1)))
    );
  }
}


