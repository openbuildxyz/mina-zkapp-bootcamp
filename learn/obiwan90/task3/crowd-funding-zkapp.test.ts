import { CrowdfundingContract } from './crowd-funding-zkapp';
import { getProfiler } from './utils/profiler.js';

import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    UInt64,
    UInt32,
    Provable,
} from 'o1js';
const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');


describe('CrowdfundingContract', () => {
    let Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>,
        deployer: any,
        beneficiary: any,
        investor1: any,
        investor2: any,
        zkappKey: PrivateKey,
        zkApp: CrowdfundingContract;

    const hardCap = UInt64.from(10 * 1e9);

    beforeAll(async () => {
        await CrowdfundingContract.compile();
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled: true });
        Mina.setActiveInstance(Local);


        [deployer, beneficiary, investor1, investor2] = Local.testAccounts;

        // 创建合约密钥对
        zkappKey = PrivateKey.random();
        zkApp = new CrowdfundingContract(zkappKey.toPublicKey());
        const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

        const txn = await Mina.transaction({
            sender: deployer,
            fee: 0.1 * 1e9,
            memo: '众筹合约',
        }, async () => {
            AccountUpdate.fundNewAccount(deployer);
            await zkApp.deploy({
                verificationKey: undefined,
                beneficiary: beneficiary,
                hardCap: hardCap, // 硬顶：10 MINA
                endTime: UInt32.from(currentSlot.add(100))
            });
        });
        await txn.prove();
        await txn.sign([deployer.key, zkappKey]).send();
    });

    describe('contribute()', () => {
        it('应该允许在窗口期内且未达到硬顶时投资', async () => {
            const amount = UInt64.from(100);

            const tx = await Mina.transaction({
                sender: investor1,
                fee: 0.1 * 1e9,
                memo: '投资'
            }, async () => {
                await zkApp.contribute(amount);
            });
            await tx.prove();
            await tx.sign([investor1.key]).send();

            let balance: string = '';
            Provable.asProver(() => {
                balance = Mina.getBalance(zkApp.address).toString();
            });
            expect(balance).toBe('100');
        });

        it('当投资金额为0时应该失败', async () => {
            const amount = UInt64.from(0);
            await expect(async () => {
                const tx = await Mina.transaction({
                    sender: investor1,
                    fee: 0.1 * 1e9,
                    memo: '投资0'
                }, async () => {
                    await zkApp.contribute(amount);
                });
                await tx.prove();
                await tx.sign([investor1.key]).send();
            }).rejects.toThrow();
        });

        it('当超过硬顶时应该失败', async () => {
            // 先投资到达硬顶
            const tx1 = await Mina.transaction({ sender: investor1, fee: 1e9 }, async () => {
                await zkApp.contribute(hardCap);
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 再次尝试投资应该失败
            await expect(async () => {
                const tx2 = await Mina.transaction({ sender: investor1, fee: 1e9 }, async () => {
                    await zkApp.contribute(UInt64.from(1));
                });
                await tx2.prove();
                await tx2.sign([investor1.key]).send();
            }).rejects.toThrow();
        });

        it('当超过结束时间时应该失败', async () => {
            // 模拟时间流逝
            Local.setBlockchainLength(UInt32.from(101));
            await expect(async () => {
                const tx = await Mina.transaction({ sender: investor1, fee: 1e9 }, async () => {
                    await zkApp.contribute(UInt64.from(100));
                });
                await tx.prove();
                await tx.sign([investor1.key]).send();
            }).rejects.toThrow();
        });
    });

    describe('withdraw()', () => {
        it('当达到硬顶时受益人应该能够提现', async () => {
            // 先投资到达硬顶
            const tx1 = await Mina.transaction({
                sender: investor1,
                fee: 0.1 * 1e9,
                memo: '投资到达硬顶'
            }, async () => {
                await zkApp.contribute(hardCap);
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 受益人提现
            const tx2 = await Mina.transaction({
                sender: beneficiary,
                fee: 0.1 * 1e9,
                memo: '受益人提现'
            }, async () => {
                await zkApp.withdraw();
            });
            await tx2.prove();
            await tx2.sign([beneficiary.key]).send();

            let balance: string = '';
            Provable.asProver(() => {
                balance = Mina.getBalance(zkApp.address).toString();
            });
            expect(balance).toBe('0');
        });

        it('当超过结束时间时受益人应该能够提现', async () => {
            // 先进行一些投资
            const tx1 = await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(500));
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 模拟时间流逝
            Local.setBlockchainLength(UInt32.from(101));
            // 受益人提现
            const tx2 = await Mina.transaction(beneficiary, async () => {
                await zkApp.withdraw();
            });
            await tx2.prove();
            await tx2.sign([beneficiary.key]).send();

            let balance: string = '';
            Provable.asProver(() => {
                balance = Mina.getBalance(zkApp.address).toString();
            });
            expect(balance).toBe('0');
        });

        it('非受益人不应该能够提现', async () => {
            // 先进行一些投资
            const tx1 = await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(500));
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 模拟时间流逝
            Local.setBlockchainLength(UInt32.from(101));

            // 非受益人尝试提现
            await expect(async () => {
                const tx2 = await Mina.transaction(investor1, async () => {
                    await zkApp.withdraw();
                });
                await tx2.prove();
                await tx2.sign([investor1.key]).send();
            }).rejects.toThrow();
        });

        it('在未达到硬顶且在窗口期内时不应该能够提现', async () => {
            // 进行一些投资
            const tx1 = await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(500));
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 尝试提现
            await expect(async () => {
                const tx2 = await Mina.transaction(beneficiary, async () => {
                    await zkApp.withdraw();
                });
                await tx2.prove();
                await tx2.sign([beneficiary.key]).send();
            }).rejects.toThrow();
        });
    });
});