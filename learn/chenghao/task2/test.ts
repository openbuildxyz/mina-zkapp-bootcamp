async function testVoting() {
  await VoteProgram.compile();

  // 创建初始状态
  const initialState = VoteState.empty();

  // 生成初始证明
  const initProof = await VoteProgram.init(initialState);

  // 投赞成票
  const approveProof = await VoteProgram.vote(
    initProof.publicOutput, 
    new VoteAction({ isApprove: Bool(true) })
  );

  // 投反对票
  const finalProof = await VoteProgram.vote(
    approveProof.publicOutput, 
    new VoteAction({ isApprove: Bool(false) })
  );
  // 打印结果
  console.log('赞成票：', finalProof.publicOutput.approveCount.toString());
  console.log('反对票：', finalProof.publicOutput.rejectCount.toString());
}

// 运行测试
testVoting().catch(console.error);