import {
    Field,
    Bool,
    ZkProgram,
    Provable,
    PublicKey,
    SelfProof,
    Poseidon,
} from 'o1js';

export const VotingProgram = ZkProgram({
    name: "voting-program",
    publicInput: Field,  // 当前计数

    methods: {
        // 初始状态（计数为0）
        baseCase: {
            privateInputs: [],
            async method(input: Field) {
                input.assertEquals(Field(0));
            }
        },

        // 投票（基于前一个证明）
        vote: {
            privateInputs: [Bool, PublicKey, Field, SelfProof],  // 添加 membershipHash
            async method(
                currentCount: Field,      // 当前计数
                choice: Bool,             // 投票选择
                voter: PublicKey,         // 投票者
                membershipHash: Field,    // 成员身份哈希
                earlierProof: SelfProof<Field, void>
            ) {
                // 1. 验证成员身份
                const voterHash = Poseidon.hash(voter.toFields());
                membershipHash.assertEquals(voterHash);  // 确保投票者是成员

                // 2. 验证前一个证明
                earlierProof.verify();

                // 3. 更新计数
                const newCount = Provable.if(
                    choice,
                    earlierProof.publicInput.add(1),
                    earlierProof.publicInput
                );

                currentCount.assertEquals(newCount);
            }
        }
    }
});