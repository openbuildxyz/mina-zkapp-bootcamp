import {
    Field,
    Bool,
    verify,
    PrivateKey,
    Poseidon,
} from 'o1js';
import { VotingProgram } from './VotingSystem';

// 简单的日志函数
const log = (...args: any[]) => {
    console.log(...args);
};

describe('投票系统测试', () => {
    let verificationKey: any;

    beforeAll(async () => {
        log('开始编译投票程序...');
        const compiled = await VotingProgram.compile();
        verificationKey = compiled.verificationKey;
    });

    it('能完成多人投票并统计结果', async () => {
        // 1. 创建成员列表
        const members = Array(3).fill(0).map(() => {
            const privateKey = PrivateKey.random();
            return {
                privateKey,
                publicKey: privateKey.toPublicKey(),
            };
        });

        // 2. 计算每个成员的公钥哈希
        const memberHashes = members.map(m =>
            Poseidon.hash(m.publicKey.toFields())
        );

        log('\n===== 成员信息 =====');
        memberHashes.forEach((hash, i) => {
            log(`成员 ${i + 1} 哈希: ${hash.toString()}`);
        });

        let approveCount = Field(0);

        // 3. 进行投票
        log('\n===== 开始投票 =====');
        for (let i = 0; i < members.length; i++) {
            const choice = i % 2 === 0; // 第1、3个成员投赞成，第2个成员投反对
            log(`成员 ${i + 1} 投票: ${choice ? '赞成' : '反对'}`);

            const proof = await VotingProgram.vote(
                memberHashes[i],
                approveCount,
                Bool(choice),
                members[i].publicKey
            );

            const ok = await verify(proof.toJSON(), verificationKey);
            expect(ok).toBe(true);

            if (choice) {
                approveCount = approveCount.add(1);
            }
        }

        // 4. 输出结果
        const finalApproveCount = Number(approveCount.toString());
        log('\n===== 投票结果 =====');
        log('总票数:', members.length);
        log('赞成票:', finalApproveCount);
        log('反对票:', members.length - finalApproveCount);
        log('===================\n');

        // 验证结果
        expect(finalApproveCount).toBe(2); // 应该有2票赞成
        expect(members.length - finalApproveCount).toBe(1); // 应该有1票反对
    });

    it('非成员不能投票', async () => {
        const member = PrivateKey.random().toPublicKey();
        const memberHash = Poseidon.hash(member.toFields());
        const outsider = PrivateKey.random().toPublicKey();

        log('\n测试非成员投票...');
        await expect(async () => {
            await VotingProgram.vote(
                memberHash,
                Field(0),
                Bool(true),
                outsider
            );
        }).rejects.toThrow();
        log('成功拒绝非成员投票 ✓\n');
    });
});