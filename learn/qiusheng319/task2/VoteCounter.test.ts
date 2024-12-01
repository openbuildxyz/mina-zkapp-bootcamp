import { AccountUpdate, MerkleMap, Field, Mina, PrivateKey, PublicKey, Bool, Poseidon, Signature, MerkleTree } from 'o1js';
import { VoteCounter } from './VoteCounter';

let proofsEnabled = false;

const TEAM_SIZE = 3;

function initializeMerkleMap(members: PublicKey[]) {
    const merkleMap = new MerkleMap();
    members.forEach((member, index) => {
        merkleMap.set(Field(index), Poseidon.hash(member.toFields()));
    });
    return merkleMap;
}

describe('VoteCounter', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        senderAccount: Mina.TestPublicKey,
        senderKey: PrivateKey,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey,
        zkApp: VoteCounter,
        teamMembers: PrivateKey[],
        merkleMap: MerkleMap,
        memberRoot: Field;

    beforeAll(async () => {
        if (proofsEnabled) await VoteCounter.compile();
    });

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);
        ({ privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]);
        ({ privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]);

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();

        teamMembers = Array(TEAM_SIZE).fill(0).map(() => PrivateKey.random());
        merkleMap = initializeMerkleMap(teamMembers.map(key => key.toPublicKey()));
        memberRoot = merkleMap.getRoot();

        zkApp = new VoteCounter(zkAppAddress);
    });

    async function localDeploy() {
        try {
            const txn = await Mina.transaction(deployerAccount, async () => {
                AccountUpdate.fundNewAccount(deployerAccount);
                await zkApp.deploy();
                await zkApp.init(memberRoot);
            });
            await txn.prove();
            await txn.sign([deployerKey, zkAppPrivateKey]).send();
        } catch (error) {
            console.error('部署失败:', error);
            throw error;
        }
    }

    async function submitVote(
        voter: PrivateKey,
        vote: Bool,
        voterIndex: number
    ): Promise<void> {
        try {
            const signature = Signature.create(voter, [vote.toField()]);
            const witness = merkleMap.getWitness(Field(voterIndex));

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.submitVote(
                    voter.toPublicKey(),
                    vote,
                    signature,
                    witness
                );
            });
            await txn.prove();
            await txn.sign([senderKey]).send();
        } catch (error) {
            console.error(`投票失败 (index ${voterIndex}):`, error);
            throw error;
        }
    }

    it('generates and deploys the VoteCounter smart contract', async () => {
        await localDeploy();
        const results = await zkApp.getResults();
        expect(results.approve).toEqual(Field(0));
        expect(results.reject).toEqual(Field(0));
    });

    it('correctly processes votes from team members', async () => {
        await localDeploy();

        const voter1 = teamMembers[0];
        const voter2 = teamMembers[1];
        const vote1 = Bool(true);
        const vote2 = Bool(false);

        // 第一次投票交易
        await submitVote(voter1, vote1, 0);

        // 第二次投票交易
        await submitVote(voter2, vote2, 1);

        // 获取并验证结果
        const results = await zkApp.getResults();
        expect(results.approve).toEqual(Field(1));
        expect(results.reject).toEqual(Field(1));
    });

    it('should not allow votes from non-members', async () => {
        await localDeploy();

        // 创建一个不在团队成员列表中的投票者
        const nonMember = PrivateKey.random();
        const vote = Bool(true);

        // 尝试投票应该失败
        await expect(async () => {
            await submitVote(nonMember, vote, 99);
        }).rejects.toThrow();
    });

    it('should correctly handle multiple votes from different members', async () => {
        await localDeploy();

        // 使用 Promise.all 并行处理多个投票
        await Promise.all(
            teamMembers.map((member, index) =>
                submitVote(member, Bool(true), index)
            )
        );

        const results = await zkApp.getResults();
        expect(results.approve).toEqual(Field(TEAM_SIZE));
        expect(results.reject).toEqual(Field(0));
    });

    it('should maintain correct vote counts for mixed votes', async () => {
        await localDeploy();

        // 第一个成员投赞成票
        await submitVote(teamMembers[0], Bool(true), 0);

        // 第二个成员投反对票
        await submitVote(teamMembers[1], Bool(false), 1);

        // 第三个成员投赞成票
        await submitVote(teamMembers[2], Bool(true), 2);

        // 验证最终结果
        const results = await zkApp.getResults();
        expect(results.approve).toEqual(Field(2));
        expect(results.reject).toEqual(Field(1));
    });

    it('should handle invalid witness gracefully', async () => {
        await localDeploy();

        const invalidIndex = TEAM_SIZE + 1;
        await expect(
            submitVote(teamMembers[0], Bool(true), invalidIndex)
        ).rejects.toThrow();
    });
});
