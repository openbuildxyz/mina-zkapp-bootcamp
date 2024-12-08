import Fund from './Fund';

import {
    AccountUpdate,
    Mina,
    PrivateKey,
    UInt32,
    UInt64
} from 'o1js';

describe('FundContract', () => {
    let owner: Mina.TestPublicKey;
    let user1: Mina.TestPublicKey;
    let user2: Mina.TestPublicKey;
    let zkApp: Fund;
    let zkAppAccount: PrivateKey;
    let Local: any;

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);

        [owner, user1, user2] = Local.testAccounts;
        zkAppAccount = PrivateKey.random();
        zkApp = new Fund(zkAppAccount.toPublicKey());
    });

    // 部署
    async function localDeploy(targetAmount = 100, endTime = 10) {
        const txn = await Mina.transaction(owner, async () => {
            AccountUpdate.fundNewAccount(owner);
            await zkApp.deploy({
                owner,
                targetAmount: UInt64.from(targetAmount * 1e9),
                endTime: UInt32.from(endTime),
            });
        });
        await txn.prove();
        await txn.sign([owner.key, zkAppAccount]).send();
    }

    it('众筹', async () => {
        await localDeploy();
        const amount = UInt64.from(10 * 1e9);
        await fund(amount);
        expect(zkApp.account.balance.get()).toEqual(amount);

        const update = AccountUpdate.create(zkAppAccount.toPublicKey());
        expect(update.account.balance.get()).toEqual(amount);
    })


    it('非 owner 无法提取', async () => {
        await localDeploy();
        const amount = UInt64.from(100 * 1e9);
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
        const amount = UInt64.from(100 * 1e9);
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
