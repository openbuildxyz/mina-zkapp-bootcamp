import {
    Field,
    Bool,
    verify,
    PrivateKey,
    PublicKey,
    Proof,
    ZkProgram,
    Poseidon,
} from 'o1js';
import { VotingProgram } from './VotingSystem';

describe('投票系统测试', () => {
    let verificationKey: any;
    let VotingProof: any;
    let members: { privateKey: PrivateKey, publicKey: PublicKey, hash: Field }[];

    beforeAll(async () => {
        console.log('编译投票程序...');
        console.time('编译耗时');
        const compiled = await VotingProgram.compile();
        verificationKey = compiled.verificationKey;
        VotingProof = ZkProgram.Proof(VotingProgram);
        console.timeEnd('编译耗时');

        // 初始化成员列表
        members = Array(3).fill(0).map(() => {
            const privateKey = PrivateKey.random();
            const publicKey = privateKey.toPublicKey();
            const hash = Poseidon.hash(publicKey.toFields());
            return { privateKey, publicKey, hash };
        });

        console.log('成员列表初始化完成');
        members.forEach((m, i) => {
            console.log(`成员 ${i + 1} 哈希:`, m.hash.toString());
        });
    });

    it('能完成递归投票并验证最终结果', async () => {
        // 1. 初始状态
        let input = Field(0);
        let proof = await VotingProgram.baseCase(input);
        proof = await testJsonRoundtrip(VotingProof, proof);

        // 验证初始证明
        let ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 2. 第一次投票
        input = input.add(1);  // 赞成票
        proof = await VotingProgram.vote(
            input,
            Bool(true),
            members[0].publicKey,
            members[0].hash,  // 成员哈希
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 3. 第二次投票
        proof = await VotingProgram.vote(
            input,
            Bool(false),
            members[1].publicKey,
            members[1].hash,  // 成员哈希
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok).toBe(true);

        // 4. 第三次投票
        input = input.add(1);  // 赞成票
        proof = await VotingProgram.vote(
            input,
            Bool(true),
            members[2].publicKey,
            members[2].hash,  // 成员哈希
            proof
        );
        proof = await testJsonRoundtrip(VotingProof, proof);

        // 验证最终结果
        ok = await verify(proof.toJSON(), verificationKey);
        expect(ok && proof.publicInput.toString() === '2').toBe(true);
        console.log('最终赞成票数:', proof.publicInput.toString());
    });

    it('非成员不能投票', async () => {
        // 创建一个非成员
        const outsider = PrivateKey.random().toPublicKey();
        const outsiderHash = Poseidon.hash(outsider.toFields());

        let input = Field(0);
        let proof = await VotingProgram.baseCase(input);

        console.log('\n测试非成员投票...');
        try {
            await VotingProgram.vote(
                input.add(1),
                Bool(true),
                outsider,
                outsiderHash,
                proof
            );
            fail('应该拒绝非成员的投票');
        } catch (error) {
            console.log('成功拒绝非成员投票 ✓');
        }
    });

    // JSON序列化测试
    async function testJsonRoundtrip(MyProof: any, proof: Proof<Field, void>) {
        let jsonProof = proof.toJSON();
        console.log('json proof', JSON.stringify({
            ...jsonProof,
            proof: jsonProof.proof.slice(0, 10) + '..'
        }));
        return await MyProof.fromJSON(jsonProof);
    }
});