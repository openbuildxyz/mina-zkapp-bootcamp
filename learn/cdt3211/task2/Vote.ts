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

  //添加成员
  @method async addMember(path: MerkleMapWitness) {
    const [computedRoot, key] = path.computeRootAndKey(Field(6));
    this.memberRoot.set(computedRoot);
  }

  @method async submitVote(voteType: Bool, memberAddress: Field, path: MerkleMapWitness) {

    // 检查是否是团队成员
    const memberRoot = this.memberRoot.getAndRequireEquals();
    const [computedRoot, key] = path.computeRootAndKey(Field(6));
    computedRoot.assertEquals(memberRoot, '非成员无法投票');
    key.assertEquals(memberAddress, '成员地址不匹配');

    const approveVotes = this.approveVotes.getAndRequireEquals();
    const rejectVotes = this.rejectVotes.getAndRequireEquals();

    const newApproveVotes = Provable.if(voteType, approveVotes.add(Field(1)), approveVotes);

    const newRejectVotes = Provable.if(voteType, rejectVotes, rejectVotes.add(Field(1)));

    this.approveVotes.set(newApproveVotes);
    this.rejectVotes.set(newRejectVotes);
  }


}