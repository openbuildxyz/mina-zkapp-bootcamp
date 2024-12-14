import Fund from './Fund';

import {
    AccountUpdate,
    Mina,
    PrivateKey,
    PublicKey,
    UInt32,
    UInt64
} from 'o1js';

describe('FundContract', () => {
    let owner: Mina.TestPublicKey;
    let user1: Mina.TestPublicKey;
    let user2: Mina.TestPublicKey;
    let receiver: Mina.TestPublicKey;
    let zkApp: Fund;
    let zkAppAccount: PrivateKey;
    let Local: any;

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);

        [owner, user1, user2, receiver] = Local.testAccounts;
        zkAppAccount = PrivateKey.random();
        zkApp = new Fund(zkAppAccount.toPublicKey());
    });

    // 部署
    async function localDeploy(targetAmount = 100, endTime = 10) {
        const txn = await Mina.transaction(owner, async () => {
            AccountUpdate.fundNewAccount(owner);
            await zkApp.deploy({
                owner,
                targetAmount: UInt64.from(targetAmount),
                endTime: UInt32.from(endTime),
            });
        });
        await txn.prove();
        await txn.sign([owner.key, zkAppAccount]).send();
    }

    it('众筹', async () => {
        await localDeploy();
        const amount = UInt64.from(10);
        await fund(amount);
        expect(zkApp.account.balance.get()).toEqual(amount);

        const update = AccountUpdate.create(zkAppAccount.toPublicKey());
        expect(update.account.balance.get()).toEqual(amount);
    })


    it('非 owner 无法提取', async () => {
        await localDeploy();
        const amount = UInt64.from(100);
        await fund(amount);

        Local.setBlockchainLength(UInt32.from(100));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const txn = await Mina.transaction(user2, async () => {
                await zkApp.withdraw();
            });
            await txn.prove();
            await txn.sign([user2.key]).send();
        }).rejects;
    })

    it('提取', async () => {
        await localDeploy();
        const amount = UInt64.from(100);
        await fund(amount);

        Local.setBlockchainLength(UInt32.from(100));
        Mina.setActiveInstance(Local);

        const before = AccountUpdate.create(owner).account.balance.get();

        const txn = await Mina.transaction(owner, async () => {
            await zkApp.withdraw();
        });
        await txn.prove();
        await txn.sign([owner.key]).send();

        expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
        expect(AccountUpdate.create(owner).account.balance.get()).toEqual(before.add(amount));
    })

    it("释放", async () => {
        await localDeploy();
        const amount = UInt64.from(100);
        await fund(amount);

        const balance = Mina.getBalance(owner);
        // 清空账号
        await calim(user2, balance);
        expect(Mina.getBalance(owner)).toEqual(UInt64.from(0));

        // 结束
        Local.setBlockchainLength(UInt32.from(100));
        Mina.setActiveInstance(Local);

        // 提取
        const txn = await Mina.transaction(owner, async () => {
            await zkApp.claim();
        });
        await txn.prove();
        await txn.sign([owner.key, zkAppAccount]).send();

        printBalance(1);
        expect(Mina.getBalance(owner)).toEqual(UInt64.from(100));

        // 每一份
        const amount_10 = Number(amount) / 10;

        await calim(receiver, UInt64.from(amount_10 * 2));

        printBalance(2);
        expect(Mina.getBalance(owner)).toEqual(UInt64.from(80));

        try {
            // 没有到释放时间 会报错
            await calim(receiver, UInt64.from(amount_10));
        } catch (error: any) {
            expect(error.message).toContain('Transaction failed with errors');
        }

        Local.incrementGlobalSlot(200);
        printBalance(3);
        await calim(receiver, UInt64.from(amount_10));
        expect(Mina.getBalance(owner)).toEqual(UInt64.from(70));

        Local.incrementGlobalSlot(1600);
        printBalance(4);
        await calim(receiver, UInt64.from(amount_10 * 7));
        expect(Mina.getBalance(owner)).toEqual(UInt64.from(0));
    })

    function printBalance(flag: Number) {
        let balance = Mina.getBalance(owner);
        console.log(flag + "-balance=" + balance);
    }

    // owner 给其他账户转账
    async function calim(receiver: PublicKey, balance: UInt64) {
        const txn = await Mina.transaction(owner, async () => {
            const ownerAccUpt = AccountUpdate.createSigned(owner);
            ownerAccUpt.send({ to: receiver, amount: balance });
        });
        await txn.prove();
        await txn.sign([owner.key, zkAppAccount]).send();
    }

    // 众筹方法
    async function fund(amount: UInt64) {
        const txn = await Mina.transaction(user1, async () => {
            await zkApp.fund(amount);
        });
        await txn.prove();
        await txn.sign([user1.key]).send();
        return txn;
    }

})
