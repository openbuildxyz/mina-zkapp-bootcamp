import { VoteProgram, TotalClass, VoterClass, Field, Bool, SelfProof, verify } from 'o1js';

describe('Vote Program Tests', () => {
  let verificationKey;
  let totalDataI;
  let proofInit;

  beforeAll(async () => {
    // 编译程序并生成验证密钥
    const { verificationKey: vk } = await VoteProgram.compile();
    verificationKey = vk;

    // 初始化数据
    totalDataI = new TotalClass({
      yesTotal: Field(0),
      noTotal: Field(0),
    });

    // 生成初始证明
    proofInit = await VoteProgram.init(totalDataI);
  });

  test('Initial vote state', async () => {
    const ok = await verify(proofInit.toJSON(), verificationKey);
    expect(ok).toBe(true);
  });

  test('Member 0 votes', async () => {
    // 模拟成员 0 投赞成票
    const voter0 = new VoterClass({
      memberId: Field(0),
      voteItem: Bool(true),
    });
    const totalData0 = new TotalClass({
      yesTotal: Field(1),
      noTotal: Field(0),
    });

    // 生成证明
    const proof0 = await VoteProgram.vote(totalData0, voter0, proofInit);
    const ok0 = await verify(proof0.toJSON(), verificationKey);
    expect(ok0).toBe(true);
  });

  test('Member 1 votes', async () => {
    // 模拟成员 1 投反对票
    const voter1 = new VoterClass({
      memberId: Field(1),
      voteItem: Bool(false),
    });
    const totalData1 = new TotalClass({
      yesTotal: Field(1),
      noTotal: Field(1),
    });

    // 生成证明
    const proof1 = await VoteProgram.vote(totalData1, voter1, proofInit);
    const ok1 = await verify(proof1.toJSON(), verificationKey);
    expect(ok1).toBe(true);
  });

  test('Member 2 votes, invalid member', async () => {
    // 模拟一个无效的成员投票（成员 5 不在名单中）
    const voter2 = new VoterClass({
      memberId: Field(5),  // 非法成员 ID
      voteItem: Bool(true),
    });
    const totalData2 = new TotalClass({
      yesTotal: Field(2),
      noTotal: Field(1),
    });

    // 生成证明
    try {
      await VoteProgram.vote(totalData2, voter2, proofInit);
    } catch (error) {
      expect(error.message).toMatch(/AssertionError/);
    }
  });

  test('Invalid vote after previous vote', async () => {
    // 模拟非法的投票顺序（例如，成员不能重复投票）
    const voter0Again = new VoterClass({
      memberId: Field(0),
      voteItem: Bool(true),
    });
    const totalData0Again = new TotalClass({
      yesTotal: Field(1),
      noTotal: Field(0),
    });

    // 尝试生成新证明，应该失败
    try {
      await VoteProgram.vote(totalData0Again, voter0Again, proofInit);
    } catch (error) {
      expect(error.message).toMatch(/AssertionError/);
    }
  });
});
