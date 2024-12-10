// voteCounter.test.ts
import { Field, Bool, Provable } from 'o1js';
import { voteCounter } from './VoteCounter';

describe('VoteCounter ZkProgram', () => {

  it('should add an approval vote', async () => {
    const approvalVotes = new Field(0);
    const disapprovalVotes = new Field(0);
    const voterId = new Field(1);
    const isApproval = Bool(true);
    const teamMembers = [new Field(1), new Field(2), new Field(3)];
    const votedVoters: Field[] = [];

    // 调用 addVote 方法
    const newPublicInputs = await voteCounter.addVote(
      [approvalVotes, disapprovalVotes], // publicInput
      voterId,                           // privateInput: voterId
      isApproval,                       // privateInput: isApproval
      teamMembers,                      // privateInput: teamMembers
      votedVoters                       // privateInput: votedVoters
    )

    // 解构新的公共输入
    const [newApprovalVotes, newDisapprovalVotes] = newPublicInputs.output;

    expect(newApprovalVotes.toString()).toBe('1');
    expect(newDisapprovalVotes.toString()).toBe('0');
  });

  it('should add a disapproval vote', async () => {
    const approvalVotes = new Field(1);
    const disapprovalVotes = new Field(0);
    const voterId = new Field(2);
    const isApproval = Bool(false);
    const teamMembers = [new Field(1), new Field(2), new Field(3)];
    const votedVoters: Field[] = [new Field(1)];

    // 调用 addVote 方法
    const newPublicInputs = await voteCounter.addVote(
      [approvalVotes, disapprovalVotes], // publicInput
      voterId,                           // privateInput: voterId
      isApproval,                       // privateInput: isApproval
      teamMembers,                      // privateInput: teamMembers
      votedVoters                       // privateInput: votedVoters
    )

    // 解构新的公共输入
    const [newApprovalVotes, newDisapprovalVotes] = newPublicInputs.output;

    expect(newApprovalVotes.toString()).toBe('1');
    expect(newDisapprovalVotes.toString()).toBe('1');
  });

  it('should prevent non-team members from voting', async () => {
    const approvalVotes = new Field(1);
    const disapprovalVotes = new Field(1);
    const voterId = new Field(4); // 非团队成员
    const isApproval = Bool(true);
    const teamMembers = [new Field(1), new Field(2), new Field(3)];
    const votedVoters: Field[] = [new Field(1), new Field(2)];

    // 期望抛出错误
    await expect(
      voteCounter.addVote(
        [approvalVotes, disapprovalVotes], // publicInput
        voterId,                           // privateInput: voterId
        isApproval,                       // privateInput: isApproval
        teamMembers,                      // privateInput: teamMembers
        votedVoters                       // privateInput: votedVoters
      )
    ).rejects.toThrow("Voter is not a team member");
  });

  it('should prevent duplicate voting', async () => {
    const approvalVotes = new Field(1);
    const disapprovalVotes = new Field(1);
    const voterId = new Field(1); // 已投票的成员
    const isApproval = Bool(false);
    const teamMembers = [new Field(1), new Field(2), new Field(3)];
    const votedVoters: Field[] = [new Field(1), new Field(2)];

    // 期望抛出错误
    await expect(
      voteCounter.addVote(
        [approvalVotes, disapprovalVotes], // publicInput
        voterId,                           // privateInput: voterId
        isApproval,                       // privateInput: isApproval
        teamMembers,                      // privateInput: teamMembers
        votedVoters                       // privateInput: votedVoters
      )
    ).rejects.toThrow("Voter has already voted");
  });
});