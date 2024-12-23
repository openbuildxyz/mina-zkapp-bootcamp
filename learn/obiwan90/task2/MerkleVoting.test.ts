import {
    Field,
    Bool,
    verify,
    PrivateKey,
    PublicKey,
    Proof,
    JsonProof,
    ZkProgram,
    Poseidon,
    MerkleTree,
} from 'o1js';
import { MerkleVotingProgram, VoteState, VoterMerkleWitness } from './MerkleVoting';

describe('Merkle 投票系统测试', () => {
    let verificationKey: any;
    let VotingProof: any;
    let merkleTree: MerkleTree;
    let members: { privateKey: PrivateKey, publicKey: PublicKey }[];
    let merkleRoot: Field;

    beforeAll(async () => {
        console.log('编译投票程序...');
        console.time('编译耗时');
        const compiled = await MerkleVotingProgram.compile();
        verificationKey = compiled.verificationKey;
        VotingProof = ZkProgram.Proof(MerkleVotingProgram);
        console.timeEnd('编译耗时');

        // 初始化成员列表和 Merkle Tree
        members = Array(3).fill(0).map(() => {
            const privateKey = PrivateKey.random();
            return {
                privateKey,
                publicKey: privateKey.toPublicKey()
            };
        });

        // 创建 Merkle Tree
        merkleTree = new MerkleTree(8);  // 深度为8

        // 添加成员到 Merkle Tree
        members.forEach((member, index) => {
            const hash = Poseidon.hash(member.publicKey.toFields());
            merkleTree.setLeaf(BigInt(index), hash);
        });

        merkleRoot = merkleTree.getRoot();
        console.log('Merkle Root:', merkleRoot.toString());
    });

    it('能完成递归投票并验证最终结果', async () => {
        // 1. 初始状态
        let state = VoteState.create(Field(0), merkleRoot);
        let proof = await MerkleVotingProgram.baseCase(state, merkleRoot);
        proof = await testJsonRoundtrip(VotingProof, proof);

        // 验证初始证明
        let ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 2. 第一次投票（赞成）
        const witness1 = new VoterMerkleWitness(merkleTree.getWitness(0n));
        state = VoteState.create(Field(1), merkleRoot);
        proof = await MerkleVotingProgram.vote(
            state,
            Bool(true),
            members[0].publicKey,
            witness1,
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 3. 第二次投票（反对）
        const witness2 = new VoterMerkleWitness(merkleTree.getWitness(1n));
        proof = await MerkleVotingProgram.vote(
            state,
            Bool(false),
            members[1].publicKey,
            witness2,
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 4. 第三次投票（赞成）
        const witness3 = new VoterMerkleWitness(merkleTree.getWitness(2n));
        state = VoteState.create(Field(2), merkleRoot);
        proof = await MerkleVotingProgram.vote(
            state,
            Bool(true),
            members[2].publicKey,
            witness3,
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);

        // 验证最终结果
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);
        expect(proof.publicInput.count.toString()).toBe('2');
        console.log('最终赞成票数:', proof.publicInput.count.toString());
    });

    it('非成员不能投票', async () => {
        // 1. 创建初始状态和证明
        let state = VoteState.create(Field(0), merkleRoot);
        let proof = await MerkleVotingProgram.baseCase(state, merkleRoot);

        // 2. 创建一个非成员
        const outsider = PrivateKey.random().toPublicKey();

        // 3. 尝试使用一个无效的 witness（比如使用索引3，而我们只有3个成员0,1,2）
        const invalidWitness = new VoterMerkleWitness(merkleTree.getWitness(3n));

        console.log('\n测试非成员投票...');
        try {
            await MerkleVotingProgram.vote(
                state,
                Bool(true),
                outsider,
                invalidWitness,
                proof
            );
            fail('应该拒绝非成员的投票');
        } catch (error) {
            console.log('成功拒绝非成员投票 ✓');
            expect(error).toBeDefined();
        }
    });

    it('不能使用其他成员的witness进行投票', async () => {
        // 1. 创建初始状态和证明
        let state = VoteState.create(Field(0), merkleRoot);
        let proof = await MerkleVotingProgram.baseCase(state, merkleRoot);

        // 2. 尝试使用成员1的witness为成员2投票
        const witness1 = new VoterMerkleWitness(merkleTree.getWitness(0n));

        console.log('\n测试witness混用...');
        try {
            await MerkleVotingProgram.vote(
                state,
                Bool(true),
                members[1].publicKey,  // 使用成员1的公钥
                witness1,              // 但使用成员0的witness
                proof
            );
            fail('应该拒绝witness混用的投票');
        } catch (error) {
            console.log('成功拒绝witness混用投票 ✓');
            expect(error).toBeDefined();
        }
    });

    // JSON序列化测试
    async function testJsonRoundtrip(MyProof: any, proof: Proof<VoteState, void>) {
        let jsonProof = proof.toJSON();
        console.log('json proof', JSON.stringify({
            ...jsonProof,
            proof: jsonProof.proof.slice(0, 10) + '..'
        }));
        return await MyProof.fromJSON(jsonProof);
    }
});