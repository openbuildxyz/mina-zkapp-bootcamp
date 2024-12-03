import {
    Field,
    Bool,
    ZkProgram,
    Provable,
    PublicKey,
    SelfProof,
    MerkleWitness,
    Poseidon,
    Struct
} from 'o1js';

// 定义 Merkle Tree 深度为 8 (最大 256 )
export class VoterMerkleWitness extends MerkleWitness(8) { }

// 投票状态结构
export class VoteState extends Struct({
    count: Field,        // 当前计数
    merkleRoot: Field,   // 成员 Merkle Tree 的根
}) {
    static create(count: Field, merkleRoot: Field) {
        return new VoteState({ count, merkleRoot });
    }
}

export const MerkleVotingProgram = ZkProgram({
    name: "merkle-voting-program",
    publicInput: VoteState,

    methods: {
        // 初始状态
        baseCase: {
            privateInputs: [Field],  // merkleRoot
            async method(state: VoteState, merkleRoot: Field) {
                // 验证初始状态
                state.count.assertEquals(Field(0));
                state.merkleRoot.assertEquals(merkleRoot);
            }
        },

        // 投票
        vote: {
            privateInputs: [
                Bool,               // 投票选择
                PublicKey,          // 投票者
                VoterMerkleWitness, // Merkle 证明
                SelfProof           // 前一个证明
            ],
            async method(
                state: VoteState,           // 当前状态
                choice: Bool,               // 投票选择
                voter: PublicKey,           // 投票者
                membershipWitness: VoterMerkleWitness,  // 成员证明
                earlierProof: SelfProof<VoteState, void>
            ) {
                // 1. 验证前一个证明
                earlierProof.verify();

                // 2. 验证状态继承
                state.merkleRoot.assertEquals(earlierProof.publicInput.merkleRoot);

                // 3. 验证成员身份
                const voterHash = Poseidon.hash(voter.toFields());
                const calculatedRoot = membershipWitness.calculateRoot(voterHash);
                calculatedRoot.assertEquals(state.merkleRoot);

                // 4. 更新计数
                const newCount = Provable.if(
                    choice,
                    earlierProof.publicInput.count.add(1),
                    earlierProof.publicInput.count
                );
                state.count.assertEquals(newCount);
            }
        }
    }
});