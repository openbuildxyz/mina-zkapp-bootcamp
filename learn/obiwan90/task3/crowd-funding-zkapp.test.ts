import { CrowdfundingContract, AmountEvent } from './crowd-funding-zkapp';
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
        it('测试投资: 当金额大于0且在上限内 --> 应该接受投资', async () => {
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

        it('测试投资: 当金额为0 --> 应该失败', async () => {
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

        it('测试投资: 当金额超过剩余额度 --> 应该只接受剩余额度并退回多余金额', async () => {
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

        it('测试投资: 当超过结束时间 --> 应该失败', async () => {
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
        it('测试投资: 当金额刚好等于剩余额度 --> 应该接受全部金额', async () => {
            // 先投资8 MINA
            await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(8 * 1e9));
            }).prove().sign([investor1.key]).send();

            // 再投资剩余的2 MINA
            const remainingAmount = UInt64.from(2 * 1e9);
            await Mina.transaction(investor2, async () => {
                await zkApp.contribute(remainingAmount);
            }).prove().sign([investor2.key]).send();

            const balance = Mina.getBalance(zkApp.address);
            expect(balance.toString()).toBe(hardCap.toString());
        });

        it('测试投资: 当同一投资者多次投资 --> 正确累加金额', async () => {
            const amount1 = UInt64.from(2 * 1e9);
            const amount2 = UInt64.from(3 * 1e9);

            await Mina.transaction(investor1, async () => {
                await zkApp.contribute(amount1);
            }).prove().sign([investor1.key]).send();

            await Mina.transaction(investor1, async () => {
                await zkApp.contribute(amount2);
            }).prove().sign([investor1.key]).send();

            const balance = Mina.getBalance(zkApp.address);
            expect(balance.toString()).toBe(amount1.add(amount2).toString());
        });

    });

    describe('withdraw()', () => {
        it('测试提现: 当达到硬顶且调用者是受益人 --> 应该允许提现', async () => {
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

        it('测试提现: 当合约余额为0 --> 应该失败', async () => {
            Local.setBlockchainLength(UInt32.from(1001));

            await expect(async () => {
                const tx = await Mina.transaction(beneficiary, async () => {
                    await zkApp.withdraw();
                });
                await tx.prove();
                await tx.sign([beneficiary.key]).send();
            }).rejects.toThrow();
        });

        it('测试提现: 当时间刚好结束（边界条件） --> 应该允许提现', async () => {
            // 投资一些资金
            await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(5 * 1e9));
            }).prove().sign([investor1.key]).send();

            // 设置时间刚好结束
            Local.setBlockchainLength(UInt32.from(1000));

            const tx = await Mina.transaction(beneficiary, async () => {
                await zkApp.withdraw();
            });
            await tx.prove();
            await tx.sign([beneficiary.key]).send();

            const balance = Mina.getBalance(zkApp.address);
            expect(balance.toString()).toBe('0');
        });

        it('测试提现: 当刚好达到硬顶（边界条件） --> 应该允许提现', async () => {
            // 刚好达到硬顶
            await Mina.transaction(investor1, async () => {
                await zkApp.contribute(hardCap);
            }).prove().sign([investor1.key]).send();

            const tx = await Mina.transaction(beneficiary, async () => {
                await zkApp.withdraw();
            });
            await tx.prove();
            await tx.sign([beneficiary.key]).send();

            const balance = Mina.getBalance(zkApp.address);
            expect(balance.toString()).toBe('0');
        });

        it('测试提现: 当调用者不是受益人 --> 应该失败', async () => {
            // 先进行一些投资
            const tx1 = await Mina.transaction(investor1, async () => {
                await zkApp.contribute(UInt64.from(500));
            });
            await tx1.prove();
            await tx1.sign([investor1.key]).send();

            // 模拟时间流逝
            Local.setBlockchainLength(UInt32.from(101));

            // 非受益��尝试提现
            await expect(async () => {
                const tx2 = await Mina.transaction(investor1, async () => {
                    await zkApp.withdraw();
                });
                await tx2.prove();
                await tx2.sign([investor1.key]).send();
            }).rejects.toThrow();
        });

        it('测试提现: 当未达到硬顶且未结束 --> 应该失败', async () => {
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

    describe('Events', () => {
        it('测试事件: 当投资超额时 --> 应该发出正确的投资和退款事件', async () => {
            const overAmount = UInt64.from(12 * 1e9); // 超过硬顶

            const tx = await Mina.transaction(investor1, async () => {
                zkApp.contribute(overAmount);
            });
            await tx.prove();
            await tx.sign([investor1.key]).send();

            const events = await zkApp.fetchEvents();

            // 需要找到正确的事件
            // 投资事件应该是第一个事件
            const contributeEvent = events.find(e => {
                const data = e.event.data as unknown as AmountEvent;
                return data.type.toString() === '1';  // 投资事件type为1
            });
            const eventData = contributeEvent?.event.data as unknown as AmountEvent;
            expect(eventData.amount.toString()).toBe(hardCap.toString());

            // 退款事件应该是第二个事件
            const refundEvent = events.find(e => {
                const data = e.event.data as unknown as AmountEvent;
                return data.type.toString() === '3';  // 退款事件type为3
            });
            const refundData = refundEvent?.event.data as unknown as AmountEvent;
            const expectedRefund = overAmount.sub(hardCap);
            expect(refundData.amount.toString()).toBe(expectedRefund.toString());
        });

        it('测试事件: 当提现时 --> 应该发出正确的提现事件', async () => {
            // 投资并等待时间结束
            await Mina.transaction(investor1, async () => {
                zkApp.contribute(UInt64.from(5 * 1e9));
            }).prove().sign([investor1.key]).send();

            Local.setBlockchainLength(UInt32.from(1001));

            await Mina.transaction(beneficiary, async () => {
                await zkApp.withdraw();
            }).prove().sign([beneficiary.key]).send();

            const events = await zkApp.fetchEvents();
            const withdrawEvent = events.find(e => e.type === 'amount');
            const withdrawData = withdrawEvent?.event.data as unknown as AmountEvent;
            expect(withdrawData.amount.toString()).toBe(UInt64.from(5 * 1e9).toString());
        });
    });
});