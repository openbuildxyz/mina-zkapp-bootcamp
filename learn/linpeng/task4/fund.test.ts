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
    async function localDeploy(acount = owner, hardCap = 100, endTime = 100) {
        const txn = await Mina.transaction(acount, async () => {
            AccountUpdate.fundNewAccount(acount); // 重置账户吗???
            await zkApp.deploy({
                owner: acount,
                hardCap: UInt64.from(hardCap * 1e9),
                endTime: UInt32.from(endTime),
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
    // 提现
    async function withDraw(acount: TestPublicKey) {
        const txn = await Mina.transaction(acount, async () => {
            await zkApp.withdraw();
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
        Local.setBlockchainLength(UInt32.from(200));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const amount = UInt64.from(1 * 1e9);
            await contribute(user2, amount);
        }).rejects.toThrow('众筹时间已过，不能投资');
    })

    it('金额达到硬顶，不能投资', async () => {
        await localDeploy(owner);

        const amount = UInt64.from(50 * 1e9);
        await contribute(user1, amount);
        await contribute(user2, amount);

        // 设置区块链的长度为 并更新状态
        Local.setBlockchainLength(UInt32.from(5));
        Mina.setActiveInstance(Local);

        expect(async () => {
            await contribute(user2, amount);
        }).rejects.toThrow('金额达到硬顶，不能投资');
    })

    it('众筹期间，不能提取', async () => {
        await localDeploy(owner);
        const amount = UInt64.from(10 * 1e9);
        await contribute(user1, amount);
        await contribute(user2, amount);

        // 设置区块链的长度为 并更新状态
        Local.setBlockchainLength(UInt32.from(5));
        Mina.setActiveInstance(Local);

        expect(async () => {
            const txn = await Mina.transaction(owner, async () => {
                await zkApp.withdraw();
            });
            await txn.prove();
            await txn.sign([owner.key]).send();
        }).rejects.toThrow('众筹期间，不能提取');
    })

    it('zkApp.withdraw', async () => {
        await localDeploy(owner);
        const amount = UInt64.from(50 * 1e9);
        await contribute(user1, amount);
        await contribute(user2, amount);

        await Mina.transaction({
            sender: owner,
            // fee: 0.1 * 1e9,
        }, async () => {
            const update = AccountUpdate.createSigned(owner);
            // const balance = AccountUpdate.create(owner).account.balance.getAndRequireEquals() // 报错
            const balance = Mina.getBalance(owner) // 为什么上面那句代码执行失败，这句可以？？？
            update.send({
                to: user1,
                amount: balance.sub(UInt64.from(1e9))
            });
        }).sign([owner.key]).prove().send();

        let balance = AccountUpdate.create(owner).account.balance.get();

        // 确定owner账户只有：1e9
        expect(balance).toEqual(UInt64.from(1e9));


        // 下面两个一个是调整区块高度，一个是调整时间，不懂？？？
        Local.setBlockchainLength(UInt32.from(101));
        Mina.setActiveInstance(Local);
        // Local.incrementGlobalSlot(UInt32.from(300)); // 这里需要用到吗？？？

        await withDraw(owner);
        // 提取资金后，owner账户余额应是: 101e9
        balance = AccountUpdate.create(owner).account.balance.get();
        expect(balance).toEqual(UInt64.from(101e9));

        // Mina.getAccount 和直接使用 owner 有什么区别
        const account = Mina.getAccount(owner);
        console.log('Beneficiary timing after withdraw:', {
            initialMinimumBalance: account.timing.initialMinimumBalance?.toString(),
            cliffTime: account.timing.cliffTime?.toString(),
            cliffAmount: account.timing.cliffAmount?.toString(),
            vestingPeriod: account.timing.vestingPeriod?.toString(),
            vestingIncrement: account.timing.vestingIncrement?.toString()
        });
        // 区块高度101时，解锁20%，不能取出101e9
        await expect(async () => {
            await Mina.transaction({
                sender: owner,
                // fee: 0.1 * 1e9,
            }, async () => {
                const update = AccountUpdate.createSigned(owner);
                update.send({
                    to: user1,
                    amount: UInt64.from(101e9)
                });
            }).sign([owner.key]).prove().send();
        }).rejects.toThrow('Source_minimum_balance_violation');


        // 余额应该不变
        balance = AccountUpdate.create(owner).account.balance.get();
        console.log('余额:', balance.toString())
        expect(balance).toEqual(UInt64.from(101e9));


        // /////////////////////////////////////
        // 区块高度101时，解锁20%，能取出20e9
        Local.setBlockchainLength(new UInt32(101));
        Mina.setActiveInstance(Local);
        await Mina.transaction({
            sender: owner,
        }, async () => {
            const update = AccountUpdate.createSigned(owner);
            update.send({
                to: user1,
                amount: UInt64.from(20e9)
            });
        }).sign([owner.key]).prove().send();
        balance = AccountUpdate.create(owner).account.balance.get();
        expect(balance).toEqual(UInt64.from(81e9));
        console.log('余额:', balance.toString())
        // /////////////////////////////////////
        // 区块高度260时，解锁100%，能取出80e9
        Local.setBlockchainLength(new UInt32(260));
        Mina.setActiveInstance(Local);
        await Mina.transaction({
            sender: owner,
        }, async () => {
            const update = AccountUpdate.createSigned(owner);
            update.send({
                to: user1,
                amount: UInt64.from(80e9)
            });
        }).sign([owner.key]).prove().send();
        balance = AccountUpdate.create(owner).account.balance.get();
        expect(balance).toEqual(UInt64.from(1e9));
        console.log('余额:', balance.toString())

    })

})