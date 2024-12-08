import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, MerkleMap, Bool } from 'o1js';
import { Vote } from './Vote';

describe('Vote', () => {
    let deployerAccount: PublicKey,
        deployerKey: PrivateKey,
        memberAccount1: PublicKey,
        memberKey1: PrivateKey,
        memberAccount2: PublicKey,
        memberKey2: PrivateKey,
        nonMemberAccount: PublicKey,
        nonMemberKey: PrivateKey,
        zkApp: Vote,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey;

    let memberMap: MerkleMap;

    beforeAll(async () => {
        // 编译合约
        await Vote.compile();
    });

    beforeEach(async () => {
        // 设置本地测试链
        const Local = await Mina.LocalBlockchain();
        Mina.setActiveInstance(Local);

        ({ privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]);
        ({ privateKey: memberKey1, publicKey: memberAccount1 } = Local.testAccounts[1]);
        ({ privateKey: memberKey2, publicKey: memberAccount2 } = Local.testAccounts[2]);
        ({ privateKey: nonMemberKey, publicKey: nonMemberAccount } = Local.testAccounts[3]);

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new Vote(zkAppAddress);

        // 初始化成员MerkleMap
        memberMap = new MerkleMap();
    });

    async function localDeploy() {
        const txn = await Mina.transaction(deployerAccount, () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            zkApp.deploy();
        });
        await txn.prove();
        await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    it('正确部署Vote合约', async () => {
        await localDeploy();

        const deployerPublicKey = zkApp.deployer.get();
        expect(deployerPublicKey).toEqual(deployerAccount);

        const approveCount = zkApp.approveCount.get();
        expect(approveCount).toEqual(Field(0));

        const opposeCount = zkApp.opposeCount.get();
        expect(opposeCount).toEqual(Field(0));
    });

    it('成功添加团队成员', async () => {
        await localDeploy();

        // 添加两个成员
        memberMap.set(memberAccount1.toFields()[0], Field(1));
        memberMap.set(memberAccount2.toFields()[0], Field(1));

        const txn = await Mina.transaction(deployerAccount, () => {
            zkApp.addMember(memberMap.getRoot());
        });
        await txn.prove();
        await txn.sign([deployerKey]).send();

        const memberRoot = zkApp.memberRoot.get();
        expect(memberRoot).toEqual(memberMap.getRoot());
    });

    it('非部署者不能添加成员', async () => {
        await localDeploy();

        memberMap.set(memberAccount1.toFields()[0], Field(1));

        await expect(async () => {
            const txn = await Mina.transaction(memberAccount1, () => {
                zkApp.addMember(memberMap.getRoot());
            });
            await txn.prove();
            await txn.sign([memberKey1]).send();
        }).rejects.toThrow();
    });

    it('成员可以成功投票', async () => {
        await localDeploy();

        // 添加成员
        memberMap.set(memberAccount1.toFields()[0], Field(1));
        let txn = await Mina.transaction(deployerAccount, () => {
            zkApp.addMember(memberMap.getRoot());
        });
        await txn.prove();
        await txn.sign([deployerKey]).send();

        // 成员1投赞成票
        const witness = memberMap.getWitness(memberAccount1.toFields()[0]);
        txn = await Mina.transaction(memberAccount1, () => {
            zkApp.vote(Bool(true), witness);
        });
        await txn.prove();
        await txn.sign([memberKey1]).send();

        const approveCount = zkApp.approveCount.get();
        expect(approveCount).toEqual(Field(1));
    });

    it('非成员不能投票', async () => {
        await localDeploy();

        // 添加成员（但不包括nonMemberAccount）
        memberMap.set(memberAccount1.toFields()[0], Field(1));
        let txn = await Mina.transaction(deployerAccount, () => {
            zkApp.addMember(memberMap.getRoot());
        });
        await txn.prove();
        await txn.sign([deployerKey]).send();

        // 尝试用非成员账户投票
        const witness = memberMap.getWitness(nonMemberAccount.toFields()[0]);
        await expect(async () => {
            txn = await Mina.transaction(nonMemberAccount, () => {
                zkApp.vote(Bool(true), witness);
            });
            await txn.prove();
            await txn.sign([nonMemberKey]).send();
        }).rejects.toThrow();
    });
});