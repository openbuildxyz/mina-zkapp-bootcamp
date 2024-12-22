import { Fund } from './fund';

import {
    AccountUpdate,
    Mina,
    PrivateKey,
    UInt32,
    UInt64
} from 'o1js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/mina';

describe('fund contract', () => {
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
    async function localDeploy(acount = owner, hardCap = 100, endTime = 10, totalFunds = 0) {
        const txn = await Mina.transaction(acount, async () => {
            AccountUpdate.fundNewAccount(acount); // 重置账户吗???
            await zkApp.deploy({
                owner: acount,
                hardCap: UInt64.from(hardCap * 1e9),
                endTime: UInt32.from(endTime),
                totalFunds: UInt64.from(totalFunds)
            });
        });
        await txn.prove();
        await txn.sign([acount.key, zkAppAccount]).send();
    }

    // 众筹
    async function contribute(acount: TestPublicKey, amount: UInt64) {
        const txn = await Mina.transaction(acount, async () => {
            await zkApp.contribute(amount);
        });
        await txn.prove();
        await txn.sign([acount.key]).send();
        return txn;
    }

    it('zkApp.contribute', async () => {
        await localDeploy();
        const amount = UInt64.from(10 * 1e9);
        await contribute(user1, amount);
        expect(zkApp.account.balance.get()).toEqual(amount);

        const update = AccountUpdate.create(zkAppAccount.toPublicKey());
        expect(update.account.balance.get()).toEqual(amount);
    })

    it('非发起方无法提取', async () => {
        await localDeploy(user1);
        const amount = UInt64.from(10 * 1e9);
        await contribute(user1, amount);

        // 设置区块链的长度为 100 并更新状态
        Local.setBlockchainLength(UInt32.from(100));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const txn = await Mina.transaction(user2, async () => {
                await zkApp.withdraw();
            });
            await txn.prove();
            await txn.sign([user2.key]).send();
        }).rejects.toThrow('不是发起方，不能提取');
    })

    it('众筹时间已过，不能投资', async () => {
        await localDeploy(user2);

        // 设置区块链的长度为 并更新状态
        Local.setBlockchainLength(UInt32.from(20));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const amount = UInt64.from(1 * 1e9);
            await contribute(user2, amount);
        }).rejects.toThrow('众筹时间已过，不能投资');
    })

    it('金额达到硬顶，不能投资', async () => {
        await localDeploy(owner);
        // const amount = UInt64.from(10 * 1e9);
        // await contribute(user2, amount);

        // 设置区块链的长度为 并更新状态
        Local.setBlockchainLength(UInt32.from(2));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const amount = UInt64.from(55 * 1e9);
            await contribute(user1, amount);
            await contribute(user2, amount);
            await contribute(user2, amount);
        }).rejects.toThrow('金额达到硬顶，不能投资');
    })

    it('zkApp.withdraw', async () => {
        await localDeploy(owner);
        const amount = UInt64.from(55 * 1e9);
        await contribute(user1, amount);
        await contribute(user2, amount);

        Local.setBlockchainLength(UInt32.from(10));
        Mina.setActiveInstance(Local);
        const before = AccountUpdate.create(owner).account.balance.get();
        const fundMoney = zkApp.account.balance.get();

        const txn = await Mina.transaction(owner, async () => {
            await zkApp.withdraw();
        });
        await txn.prove();
        await txn.sign([owner.key]).send();

        expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
        expect(AccountUpdate.create(owner).account.balance.get()).toEqual(before.add(fundMoney));
    })

})