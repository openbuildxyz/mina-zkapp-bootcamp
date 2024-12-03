import { MerkleMap, PublicKey, Field, Bool, Signature } from 'o1js';
import { VoteInput, VotingZkProgram } from './VotingZkProgram';

// 测试用例
describe('VotingZkProgram Tests', () => {
  let teamMerkleMap: MerkleMap;
  let votedMerkleMap: MerkleMap;
  let teamMerkleRoot: Field;
  let votedMerkleRoot: Field;
  let publicState: Field;
  let teamMembers: PublicKey[];

  beforeEach(() => {
    // 初始化团队
    teamMerkleMap = new MerkleMap();
    teamMembers = [PublicKey.random(), PublicKey.random(), PublicKey.random()];
    teamMembers.forEach((member) => {
      teamMerkleMap.set(member.toField(), Field(1));
    });
    teamMerkleRoot = teamMerkleMap.getRoot();

    // 初始化已投票树
    votedMerkleMap = new MerkleMap();
    votedMerkleRoot = votedMerkleMap.getRoot();

    // 初始状态：0 表示无赞成票和反对票
    publicState = Field(0);
  });

  test('Valid Vote - Approve', () => {
    // 第一个成员投赞成票
    const voter = teamMembers[0];
    const voteType = Bool(true); // 赞成
    const signature = Signature.create(voter, [voteType.toField()]);

    publicState = VotingZkProgram.vote(
      publicState,
      new VoteInput(
        voter,
        voteType,
        signature,
        teamMerkleMap.getWitness(voter.toField()),
        votedMerkleMap.getWitness(voter.toField())
      ),
      teamMerkleRoot,
      votedMerkleRoot
    );

    // 验证状态：赞成票数增加
    const updatedApproveCount = Field(publicState.toBigInt() >> BigInt(32)); // 高 32 位
    const updatedRejectCount = Field(publicState.toBigInt() & BigInt(0xffffffff)); // 低 32 位

    expect(updatedApproveCount.toBigInt()).toBe(BigInt(1));
    expect(updatedRejectCount.toBigInt()).toBe(BigInt(0));
  });

  test('Valid Vote - Reject', () => {
    // 第二个成员投反对票
    const voter = teamMembers[1];
    const voteType = Bool(false); // 反对
    const signature = Signature.create(voter, [voteType.toField()]);

    publicState = VotingZkProgram.vote(
      publicState,
      new VoteInput(
        voter,
        voteType,
        signature,
        teamMerkleMap.getWitness(voter.toField()),
        votedMerkleMap.getWitness(voter.toField())
      ),
      teamMerkleRoot,
      votedMerkleRoot
    );

    // 验证状态：反对票数增加
    const updatedApproveCount = Field(publicState.toBigInt() >> BigInt(32)); // 高 32 位
    const updatedRejectCount = Field(publicState.toBigInt() & BigInt(0xffffffff)); // 低 32 位

    expect(updatedApproveCount.toBigInt()).toBe(BigInt(0));
    expect(updatedRejectCount.toBigInt()).toBe(BigInt(1));
  });

  test('Invalid Vote - Non-team Member', () => {
    // 非团队成员尝试投票
    const nonMember = PublicKey.random();
    const voteType = Bool(true); // 赞成
    const signature = Signature.create(nonMember, [voteType.toField()]);

    expect(() => {
      VotingZkProgram.vote(
        publicState,
        new VoteInput(
          nonMember,
          voteType,
          signature,
          teamMerkleMap.getWitness(nonMember.toField()),
          votedMerkleMap.getWitness(nonMember.toField())
        ),
        teamMerkleRoot,
        votedMerkleRoot
      );
    }).toThrow('Voter is not part of the team');
  });

  test('Invalid Vote - Duplicate Vote', () => {
    // 第一个成员第一次投票
    const voter = teamMembers[0];
    const voteType = Bool(true); // 赞成
    const signature = Signature.create(voter, [voteType.toField()]);

    publicState = VotingZkProgram.vote(
      publicState,
      new VoteInput(
        voter,
        voteType,
        signature,
        teamMerkleMap.getWitness(voter.toField()),
        votedMerkleMap.getWitness(voter.toField())
      ),
      teamMerkleRoot,
      votedMerkleRoot
    );

    // 尝试重复投票
    expect(() => {
      VotingZkProgram.vote(
        publicState,
        new VoteInput(
          voter,
          voteType,
          signature,
          teamMerkleMap.getWitness(voter.toField()),
          votedMerkleMap.getWitness(voter.toField())
        ),
        teamMerkleRoot,
        votedMerkleRoot
      );
    }).toThrow('Voter has already voted');
  });

  test('Multiple Votes - Mixed', () => {
    // 多成员投票
    const voter1 = teamMembers[0];
    const voter2 = teamMembers[1];
    const signature1 = Signature.create(voter1, [Bool(true).toField()]); // 赞成
    const signature2 = Signature.create(voter2, [Bool(false).toField()]); // 反对

    publicState = VotingZkProgram.vote(
      publicState,
      new VoteInput(
        voter1,
        Bool(true),
        signature1,
        teamMerkleMap.getWitness(voter1.toField()),
        votedMerkleMap.getWitness(voter1.toField())
      ),
      teamMerkleRoot,
      votedMerkleRoot
    );

    publicState = VotingZkProgram.vote(
      publicState,
      new VoteInput(
        voter2,
        Bool(false),
        signature2,
        teamMerkleMap.getWitness(voter2.toField()),
        votedMerkleMap.getWitness(voter2.toField())
      ),
      teamMerkleRoot,
      votedMerkleRoot
    );

    // 验证状态
    const updatedApproveCount = Field(publicState.toBigInt() >> BigInt(32)); // 高 32 位
    const updatedRejectCount = Field(publicState.toBigInt() & BigInt(0xffffffff)); // 低 32 位

    expect(updatedApproveCount.toBigInt()).toBe(BigInt(1));
    expect(updatedRejectCount.toBigInt()).toBe(BigInt(1));
  });
});
