import { PublicKey, Bool, Struct, UInt32, Provable, ZkProgram, SelfProof } from 'o1js';


// 定义投票记录类
class VoteRecord extends Struct({
    voterAddress: PublicKey,
    voteChoice: Bool,
}) { }

// 定义投票计数类
class VoteCount extends Struct({
    approveCount: UInt32,
    disapproveCount: UInt32,
}) { }

// 定义零知识证明投票程序
let MyProgram = ZkProgram({
    name: 'vote-counter',
    publicInput: VoteRecord,
    publicOutput: VoteCount,

    methods: {
        resetCounter: {
            privateInputs: [],
            async method() {
                // 初始化并返回一个包含 publicOutput 的对象
                const result = {
                    publicOutput: new VoteCount({
                        approveCount: new UInt32(0),
                        disapproveCount: new UInt32(0),
                    }),
                };
                return result;
            },
        },

        count: {
            privateInputs: [SelfProof],
            async method(publicInput: VoteRecord, earlierProof: SelfProof<VoteCount, VoteCount>) {
                earlierProof.verify();

                // 获取当前的审批和反对计数
                const approveCount = earlierProof.publicOutput.approveCount;
                const disapproveCount = earlierProof.publicOutput.disapproveCount;

                // 更新计数
                const newApproveCount = Provable.if(publicInput.voteChoice, approveCount.add(1), approveCount);
                const newDisapproveCount = Provable.if(publicInput.voteChoice, disapproveCount, disapproveCount.add(1));

                // 返回一个包含 publicOutput 的对象
                return {
                    publicOutput: new VoteCount({
                        approveCount: newApproveCount,
                        disapproveCount: newDisapproveCount,
                    }),
                };
            },
        },
    },
});


export { MyProgram, VoteRecord, VoteCount };
