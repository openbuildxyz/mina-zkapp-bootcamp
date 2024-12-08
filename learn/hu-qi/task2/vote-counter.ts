import {
    Struct,
    SelfProof,
    Bool,
    UInt32,
    ZkProgram,
    verify,
    Proof,
    JsonProof,
    Provable,
    PublicKey,
} from 'o1js';

// 定义有效地址列表（使用真实的 Mina 地址格式）
const validAddresses = [
    'B62qptnAmR3kckbRKnzd9oMaoTp7gofw6fz8ytiRnjSXXngtsazafBh', // 投票者1
    'B62qjoDym4qSu5YYLvmPTKePePpkGeXmPZAwwjHUpQNeP1hoFVJoB7a', // 投票者2
    'B62qphjuHHaPY37THFRMYRQsVCf1JgEE6k512cV3S4RmkmdutMhzZmr', // 投票者3
    'B62qrx22PmRx6jXfvrS4amPCGR22KX6SB7NXvFLTuw9eDZYgVtymid2', // 投票者4
].map(PublicKey.fromBase58);

// 无效地址示例
const invalidAddress = PublicKey.fromBase58(
    'B62qptnAmR3kckbRKnzd9oMaoTp7gofw6fz8ytiRnjSXXngtsazafBh'
);

/**
 * 投票记录结构
 * - voterAddress: 投票者地址
 * - voteChoice: true 表示赞成，false 表示反对
 */
class VoteRecord extends Struct({
    voterAddress: PublicKey,
    voteChoice: Bool,
}) { }

/**
 * 投票计数结构
 */
class VoteCount extends Struct({
    approveCount: UInt32,
    disapproveCount: UInt32,
}) { }

/**
 * 投票计数程序
 */
const MyProgram = ZkProgram({
    name: 'vote-counter',
    publicInput: VoteRecord,
    publicOutput: VoteCount,

    methods: {
        resetCounter: {
            privateInputs: [],
            async method() {
                return new VoteCount({
                    approveCount: UInt32.from(0),
                    disapproveCount: UInt32.from(0)
                });
            },
        },

        count: {
            privateInputs: [SelfProof],
            async method(
                publicInput: VoteRecord,
                earlierProof: SelfProof<VoteCount, VoteCount>
            ) {
                earlierProof.verify();

                // 验证投票者地址是否有效
                const isValidAddress = validAddresses.reduce(
                    (acc, addr) => acc.or(publicInput.voterAddress.equals(addr)),
                    Bool(false)
                );
                isValidAddress.assertTrue('投票者地址不在允许列表中');

                const { approveCount, disapproveCount } = earlierProof.publicOutput;

                // 根据投票选择更新计数
                const newApproveCount = Provable.if(
                    publicInput.voteChoice,
                    approveCount.add(1),
                    approveCount
                );

                const newDisapproveCount = Provable.if(
                    publicInput.voteChoice,
                    disapproveCount,
                    disapproveCount.add(1)
                );

                // 调试日志
                Provable.asProver(() => {
                    console.log('投票选择:', publicInput.voteChoice.toBoolean());
                    console.log('新的赞成票数:', newApproveCount.toString());
                    console.log('新的反对票数:', newDisapproveCount.toString());
                });

                return new VoteCount({
                    approveCount: newApproveCount,
                    disapproveCount: newDisapproveCount,
                });
            },
        },
    },
});

/**
 * 验证投票结果
 * @param proof 证明
 * @param verificationKey 验证密钥
 * @param expectedApprove 预期赞成票数
 * @param expectedDisapprove 预期反对票数
 */
async function verifyVoteResult(
    proof: Proof<VoteRecord, VoteCount>,
    verificationKey: any,
    expectedApprove: number,
    expectedDisapprove: number
): Promise<boolean> {
    const ok = await verify(proof.toJSON(), verificationKey);
    const actualApprove = proof.publicOutput.approveCount.toString();
    const actualDisapprove = proof.publicOutput.disapproveCount.toString();

    return ok &&
        actualApprove === expectedApprove.toString() &&
        actualDisapprove === expectedDisapprove.toString();
}

/**
 * 创建投票记录
 */
function createVoteRecord(address: PublicKey, choice: boolean): VoteRecord {
    return new VoteRecord({
        voterAddress: address,
        voteChoice: Bool(choice),
    });
}

// 类型检查
MyProgram.publicInputType satisfies typeof VoteRecord;
MyProgram.publicOutputType satisfies typeof VoteCount;

const MyProof = ZkProgram.Proof(MyProgram);

// 主程序执行
async function main() {
    console.log('程序摘要', await MyProgram.digest());

    // 编译程序
    console.log('正在编译程序...');
    console.time('编译时间');
    const { verificationKey } = await MyProgram.compile();
    console.timeEnd('编译时间');

    // 初始化状态
    let proof = await MyProgram.resetCounter(createVoteRecord(validAddresses[0], true));
    proof = await testJsonRoundtrip(MyProof, proof);

    // 执行投票测试
    const voteTests = [
        { address: validAddresses[0], choice: true, expectedApprove: 1, expectedDisapprove: 0 },
        { address: validAddresses[1], choice: false, expectedApprove: 1, expectedDisapprove: 1 },
        { address: validAddresses[2], choice: true, expectedApprove: 2, expectedDisapprove: 1 },
        { address: validAddresses[3], choice: true, expectedApprove: 3, expectedDisapprove: 1 },
    ];

    for (let i = 0; i < voteTests.length; i++) {
        const test = voteTests[i];
        console.log(`执行第 ${i + 1} 步投票...`);
        proof = await MyProgram.count(createVoteRecord(test.address, test.choice), proof);
        const result = await verifyVoteResult(
            proof,
            verificationKey,
            test.expectedApprove,
            test.expectedDisapprove
        );
        console.log(`第 ${i + 1} 步验证结果:`, result);
    }

    // 测试无效地址
    try {
        await MyProgram.count(createVoteRecord(invalidAddress, true), proof);
        throw new Error('投票者地址不在允许列表中');
    } catch (error) {
        if (error instanceof Error && error.message.includes('投票者地址不在允许列表中')) {
            console.log('无效地址测试通过');
        } else {
            console.error('意外错误:', error);
        }
    }
}

/**
 * JSON序列化测试辅助函数
 */
function testJsonRoundtrip<
    P extends Proof<any, any>,
    MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
    const jsonProof = proof.toJSON();
    return MyProof.fromJSON(jsonProof);
}

// 执行主程序
main().catch(console.error);