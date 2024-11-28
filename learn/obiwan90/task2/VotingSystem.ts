import {
    Field,
    Bool,
    ZkProgram,
    Provable,
    Poseidon,
    PublicKey,
} from 'o1js';

export const VotingProgram = ZkProgram({
    name: "voting-program",
    publicInput: Field,

    methods: {
        vote: {
            privateInputs: [Field, Bool, PublicKey],
            async method(
                membersHash: Field,    // 成员哈希
                prevCount: Field,      // 当前计数
                choice: Bool,          // 投票选择
                voter: PublicKey       // 投票者的公钥
            ) {
                // 1. 验证投票者身份
                const voterHash = Poseidon.hash(voter.toFields());
                membersHash.assertEquals(voterHash);

                // 2. 更新计数
                Provable.if(
                    choice,
                    prevCount.add(1),  // 赞成票 +1
                    prevCount          // 反对票不变
                );
            }
        }
    }
});
