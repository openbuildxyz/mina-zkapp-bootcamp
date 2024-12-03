import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    Poseidon,
    MerkleMap,
    MerkleMapWitness,
} from 'o1js';
import { VoteSystem } from './Vote';

describe('投票系统合约', () => {
    let administrator: PrivateKey,
        participant1: PrivateKey,
        participant2: PrivateKey;

    let contractAddress: PublicKey,
        contractPrivateKey: PrivateKey;

    let voteSystem: VoteSystem;
    let participantRegistry: MerkleMap;

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);

        const accounts = Local.testAccounts;
        administrator = accounts[0].key;
        participant1 = accounts[1].key;
        participant2 = accounts[2].key;

        contractPrivateKey = PrivateKey.random();
        contractAddress = contractPrivateKey.toPublicKey();

        voteSystem = new VoteSystem(contractAddress);
        participantRegistry = new MerkleMap();
    });

    async function deployContract() {
        const txn = await Mina.transaction(administrator.toPublicKey(), async () => {
            AccountUpdate.fundNewAccount(administrator.toPublicKey());
            await voteSystem.deploy();
        });
        await txn.prove();
        await txn.sign([administrator, contractPrivateKey]).send();
    }

    it('使用正确的初始状态初始化合约', async () => {
        await deployContract();

        const approvals = await voteSystem.approvalCount.get();
        const rejections = await voteSystem.rejectionCount.get();
        const registryRoot = await voteSystem.participantTreeRoot.get();

        expect(approvals).toEqual(Field(0));
        expect(rejections).toEqual(Field(0));
        expect(registryRoot).toEqual(participantRegistry.getRoot());
    });

    it('仅允许管理员注册参与者', async () => {
        await deployContract();

        const participant1Hash = Poseidon.hash(participant1.toPublicKey().toFields());
        const registryWitness = participantRegistry.getWitness(participant1Hash);

        // 非管理员注册尝试应该失败
        await expect(async () => {
            const txn = await Mina.transaction(participant1.toPublicKey(), async () => {
                await voteSystem.registerParticipant(registryWitness);
            });
            await txn.prove();
            await txn.sign([participant1]).send();
        }).rejects.toThrow('Only administrator can register participants');

        // 管理员注册应该成功
        const txn = await Mina.transaction(administrator.toPublicKey(), async () => {
            await voteSystem.registerParticipant(registryWitness);
        });
        await txn.prove();
        await txn.sign([administrator]).send();

        participantRegistry.set(participant1Hash, Field(1));
        const updatedRoot = await voteSystem.participantTreeRoot.get();
        expect(participantRegistry.getRoot()).toEqual(updatedRoot);
    });

    it('正确统计赞成票和反对票', async () => {
        await deployContract();

        // 注册两个参与者
        const participant1Hash = Poseidon.hash(participant1.toPublicKey().toFields());
        const participant2Hash = Poseidon.hash(participant2.toPublicKey().toFields());
        const witness1 = participantRegistry.getWitness(participant1Hash);
        const witness2 = participantRegistry.getWitness(participant2Hash);

        // 注册第一个参与者
        let txn = await Mina.transaction(administrator.toPublicKey(), async () => {
            await voteSystem.registerParticipant(witness1);
        });
        await txn.prove();
        await txn.sign([administrator]).send();

        // 更新本地注册表并获取新的见证
        participantRegistry.set(participant1Hash, Field(1));
        const updatedWitness2 = participantRegistry.getWitness(participant2Hash);

        // 使用更新后的见证注册第二个参与者
        txn = await Mina.transaction(administrator.toPublicKey(), async () => {
            await voteSystem.registerParticipant(updatedWitness2);
        });
        await txn.prove();
        await txn.sign([administrator]).send();

        // 更新本地注册表
        participantRegistry.set(participant2Hash, Field(1));

        // 获取所有注册完成后的新见证用于投票
        const votingWitness1 = participantRegistry.getWitness(participant1Hash);
        const votingWitness2 = participantRegistry.getWitness(participant2Hash);

        // 参与者1提交赞成票
        txn = await Mina.transaction(participant1.toPublicKey(), async () => {
            await voteSystem.submitVote(Field(1), votingWitness1);
        });
        await txn.prove();
        await txn.sign([participant1]).send();

        // 参与者2提交反对票
        txn = await Mina.transaction(participant2.toPublicKey(), async () => {
            await voteSystem.submitVote(Field(0), votingWitness2);
        });
        await txn.prove();
        await txn.sign([participant2]).send();

        const approvals = await voteSystem.approvalCount.get();
        const rejections = await voteSystem.rejectionCount.get();

        expect(approvals).toEqual(Field(1));
        expect(rejections).toEqual(Field(1));
    });

    it('防止未注册的参与者投票', async () => {
        await deployContract();

        const nonParticipantHash = Poseidon.hash(Field(99).toFields());
        const invalidWitness = participantRegistry.getWitness(nonParticipantHash);

        await expect(async () => {
            const txn = await Mina.transaction(participant1.toPublicKey(), async () => {
                await voteSystem.submitVote(Field(1), invalidWitness);
            });
            await txn.prove();
            await txn.sign([participant1]).send();
        }).rejects.toThrow('Only registered participants can vote');

        const approvals = await voteSystem.approvalCount.get();
        expect(approvals).toEqual(Field(0));
    });

    it('验证投票选择必须是二元的', async () => {
        await deployContract();

        const participantHash = Poseidon.hash(participant1.toPublicKey().toFields());
        // @ts-ignore: MerkleMapWitness is used in subsequent function calls
        const witness = participantRegistry.getWitness(participantHash);
        
        let txn = await Mina.transaction(administrator.toPublicKey(), async () => {
            await voteSystem.registerParticipant(witness);
        });
        await txn.prove();
        await txn.sign([administrator]).send();

        participantRegistry.set(participantHash, Field(1));

        await expect(async () => {
            txn = await Mina.transaction(participant1.toPublicKey(), async () => {
                await voteSystem.submitVote(Field(2), witness);
            });
            await txn.prove();
            await txn.sign([participant1]).send();
        }).rejects.toThrow('Vote choice must be 0 or 1');
    });
});