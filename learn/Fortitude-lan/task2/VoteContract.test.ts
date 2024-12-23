import { MyProgram, VoteRecord, VoteCount } from './VoteContract';
import { PublicKey, Bool } from 'o1js';

// 模拟有效的地址（团队成员）
const validAddresses = [
    'B62qjJaXMmZgaNecUUrDZ384uDQGYAAoTRTX7CAQ1YrBT6yo3gbzCCJ',
    'B62qmWgnatsvVwkL1iGHuE2BhNF8piikGz6zssM3espTZaaAKqnVvCU',
].map(PublicKey.fromBase58);

// 模拟无效地址（非团队成员）
const invalidAddresses = [
    'B62qpdHdu7MA3B7Yh5Fg1uLjp2dKohkHcoGA7HFP3G9uuhYQBxUBZga',
].map(PublicKey.fromBase58);

// 存储已投票者地址（防止重复投票）
let votedAddresses: Set<string> = new Set();
// 辅助函数：打印当前的投票统计结果
function printVoteCount(voteCount: VoteCount) {
    console.log(`Approve count: ${voteCount.approveCount.toString()} -------  Disapprove count: ${voteCount.disapproveCount.toString()}`);
}
test('Vote contract tests', async () => {
    try {
        // Step 1: 编译程序并准备证明器
        console.log('Compiling program...');
        await MyProgram.compile();  // 确保我们先编译程序并缓存证明器

        // Step 2: 初始化投票计数器
        console.log('Running test 1: Initialize counter...');
        const initialInput = new VoteRecord({
            voterAddress: validAddresses[0],
            voteChoice: new Bool(true), // 投赞成票，使用 Bool 类型
        });
        let result = await MyProgram.resetCounter(initialInput);  // 调用 resetCounter
        let proof = result.proof;

        // 输出初始统计
        console.log('Initial vote counts:');
        printVoteCount(proof.publicOutput);


        console.log('Initial approve count:', proof.publicOutput.approveCount.toString());
        console.log('Initial disapprove count:', proof.publicOutput.disapproveCount.toString());

        // Step 3: 处理第一个有效投票
        console.log('Running test 2: Process vote from valid address 0...');
        const vote1 = new VoteRecord({
            voterAddress: validAddresses[0],
            voteChoice: new Bool(true), // 投赞成票
        });
        printVoteCount(proof.publicOutput);
        // 防止重复投票
        if (votedAddresses.has(validAddresses[0].toBase58())) {
            console.log('Error: Voter has already voted');
            return;
        }

        result = await MyProgram.count(vote1, proof);
        proof = result.proof;  // 获取 proof
        votedAddresses.add(validAddresses[0].toBase58());  // 记录投票者
        console.log('Approve count after vote 1:', proof.publicOutput.approveCount.toString());
        console.log('Disapprove count after vote 1:', proof.publicOutput.disapproveCount.toString());

        // Step 4: 处理第二个有效投票
        console.log('Running test 3: Process vote from valid address 1...');
        const vote2 = new VoteRecord({
            voterAddress: validAddresses[1],
            voteChoice: new Bool(false), // 投反对票
        });
        printVoteCount(proof.publicOutput);
        // 防止重复投票
        if (votedAddresses.has(validAddresses[1].toBase58())) {
            console.log('Error: Voter has already voted');
            return;
        }

        result = await MyProgram.count(vote2, proof);  // 调用 count 方法
        proof = result.proof;  // 获取 proof
        votedAddresses.add(validAddresses[1].toBase58());  // 记录投票者
        console.log('Approve count after vote 2:', proof.publicOutput.approveCount.toString());
        console.log('Disapprove count after vote 2:', proof.publicOutput.disapproveCount.toString());

        // Step 5: 处理无效地址投票
        console.log('Running test 4: Process vote from invalid address 0...');
        try {
            const invalidVote1 = new VoteRecord({
                voterAddress: invalidAddresses[0],
                voteChoice: new Bool(true), // 投赞成票
            });

            // 防止重复投票
            if (votedAddresses.has(invalidAddresses[0].toBase58())) {
                console.log('Error: Voter has already voted');
                return;
            }

            result = await MyProgram.count(invalidVote1, proof);  // 调用 count 方法
            proof = result.proof;  // 获取 proof

            printVoteCount(proof.publicOutput);
        } catch (error) {
            console.error('Error processing vote from invalid address 1:', error);
        }
    } catch (error) {
        console.error('Test error:', error);
    }
});
