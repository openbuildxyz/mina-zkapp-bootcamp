import { AccountUpdate, Mina, PrivateKey, Provable, UInt32, UInt64 } from "o1js";
import { CrowdFunding } from "./CrowdFunding.js";
import { getProfiler } from "./profiler.js";
import { sender } from "o1js/dist/node/lib/mina/mina.js";

const CrowdfundingProfiler = getProfiler('Crowdfunding zkApp');
CrowdfundingProfiler.start('Crowdfunding zkApp test flow');

describe('CrowdFunding.js', () => {
    let Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>,
        deployer: any,
        owner: any,
        investor1: any,
        investor2: any,
        zkappKey: PrivateKey,
        zkApp: CrowdFunding;

    const hardCap = UInt64.from(100 * 1e9);

    beforeAll(async () => {
        await CrowdFunding.compile();
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);


        [deployer, owner, investor1, investor2] = Local.testAccounts;

        // 创建合约密钥对
        zkappKey = PrivateKey.random();
        zkApp = new CrowdFunding(zkappKey.toPublicKey());
        const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

        const txn = await Mina.transaction({
            sender: deployer,
            fee: 0.1 * 1e9,
            memo: '众筹合约',
        }, async () => {
            AccountUpdate.fundNewAccount(deployer);
            await zkApp.deploy({
                verificationKey: undefined,
                owner: owner,
                hardCap: hardCap, // 硬顶：100 MINA
                deadline: UInt32.from(Local.getNetworkState().globalSlotSinceGenesis.add(100))
            });
            //await zkApp.initState(hardCap, UInt32.from(currentSlot.add(100)));

        });
        await txn.prove();
        await txn.sign([deployer.key, zkappKey]).send();
    });


    describe('withdraw and vesting', () => {
        beforeEach(async () => {
            // 先进行一笔投资
            const investAmount = UInt64.from(100 * 1e9); // 投资100 MINA
            const txn = await Mina.transaction({
                sender: investor1,
                fee: 0.2 * 1e9,
            }, async () => {
                await zkApp.contribute(investAmount);
            });
            await txn.prove();
            await txn.sign([investor1.key]).send();
        });

        it('众筹结束前不能提现', async () => {
            await expect(async () => {
                const txn = await Mina.transaction({
                    sender: owner,
                    fee: 0.2 * 1e9,
                }, async () => {
                    await zkApp.withdraw();
                });
                await txn.prove();
                await txn.sign([owner.key]).send();
            }).rejects.toThrow('众筹还未结束');
        });


        it('应该按计划逐步释放资金', async () => {

            // 推进到众筹结束时间并提现
            Local.setBlockchainLength(UInt32.from(101));
            console.log('提现前合约余额:',
                Mina.getBalance(zkApp.address).div(1e9).toString(), 'MINA');
            console.log('提现前受益人账户余额:',
                Mina.getBalance(owner).div(1e9).toString(), 'MINA');
            const before = Mina.getBalance(owner);

            // 执行提现
            await Mina.transaction({
                sender: owner,
                fee: 0.1 * 1e9,
            }, async () => {
                await zkApp.withdraw();
            }).sign([owner.key]).prove().send();
            console.log('提现后合约余额:',
                Mina.getBalance(zkApp.address).div(1e9).toString(), 'MINA');
            console.log('提现后受益人账户余额:',
                Mina.getBalance(owner).div(1e9).toString(), 'MINA');

            // 打印受益人账户的 timing 设置
            const beneficiaryAccount = Mina.getAccount(owner);
            console.log('Beneficiary timing after withdraw:', {
                initialMinimumBalance: beneficiaryAccount.timing.initialMinimumBalance?.toString(),
                cliffTime: beneficiaryAccount.timing.cliffTime?.toString(),
                cliffAmount: beneficiaryAccount.timing.cliffAmount?.toString(),
                vestingPeriod: beneficiaryAccount.timing.vestingPeriod?.toString(),
                vestingIncrement: beneficiaryAccount.timing.vestingIncrement?.toString()
            });
           
            // 尝试转出超过锁定金额
            await expect(async () => {
                await Mina.transaction({
                    sender: owner,
                    fee: 0.1 * 1e9,
                }, async () => {
                    const acctUpdate = AccountUpdate.createSigned(owner);
                    acctUpdate.send({
                        to: investor2,
                        amount: UInt64.from(before.add(20e9)) // 尝试转出21 MINA
                    });
                }).sign([owner.key]).prove().send();
            }).rejects.toThrow();

            //模拟经过一个vestingPeriod时间
           // Local.setBlockchainLength(UInt32.from(101 + 450));
            Local.incrementGlobalSlot(UInt32.from(101 + 250))
            console.log('转账前受益人余额:',Mina.getBalance(owner).div(1e9).toString(), 'MINA');
            // 尝试转出允许金额
            await Mina.transaction({
                sender: owner,
                fee: 0.1 * 1e9,
            }, async () => {
                const acctUpdate = AccountUpdate.createSigned(owner);
                acctUpdate.send({
                    to: investor2,
                    amount: UInt64.from(before.add(22e9)) // 转出超出20 MINA（cliff amount）
                });
            }).sign([owner.key]).prove().send();
            console.log('转账后:');
            console.log('受益人账户余额:', Mina.getBalance(owner).div(1e9).toString(), 'MINA');
        });
    });

    // describe('withdraw()', () => {

    //     it('当超过结束时间时受益人应该能够提现', async () => {
    //         // 先进行一些投资
    //         const tx1 = await Mina.transaction(investor1, async () => {
    //             await zkApp.contribute(UInt64.from(500));
    //         });
    //         await tx1.prove();
    //         await tx1.sign([investor1.key]).send();

    //         // 模拟时间流逝
    //         Local.setBlockchainLength(UInt32.from(101));
    //         // 受益人提现
    //         const tx2 = await Mina.transaction(owner, async () => {
    //             await zkApp.withdraw();
    //         });
    //         await tx2.prove();
    //         await tx2.sign([owner.key]).send();

    //         let balance: string = '';
    //         Provable.asProver(() => {
    //             balance = Mina.getBalance(zkApp.address).toString();
    //         });
    //         expect(balance).toBe('0');
    //     });

    //     it('非受益人不应该能够提现', async () => {
    //         // 先进行一些投资
    //         const tx1 = await Mina.transaction(investor1, async () => {
    //             await zkApp.contribute(UInt64.from(500));
    //         });
    //         await tx1.prove();
    //         await tx1.sign([investor1.key]).send();

    //         // 模拟时间流逝
    //         Local.setBlockchainLength(UInt32.from(101));

    //         // 非受益人尝试提现
    //         await expect(async () => {
    //             const tx2 = await Mina.transaction(investor1, async () => {
    //                 await zkApp.withdraw();
    //             });
    //             await tx2.prove();
    //             await tx2.sign([investor1.key]).send();
    //         }).rejects.toThrow();
    //     });

    //     it('在未达到硬顶且在窗口期内时不应该能够提现', async () => {
    //         // 进行一些投资
    //         const tx1 = await Mina.transaction(investor1, async () => {
    //             await zkApp.contribute(UInt64.from(500));
    //         });
    //         await tx1.prove();
    //         await tx1.sign([investor1.key]).send();

    //         // 尝试提现
    //         await expect(async () => {
    //             const tx2 = await Mina.transaction(owner, async () => {
    //                 await zkApp.withdraw();
    //             });
    //             await tx2.prove();
    //             await tx2.sign([owner.key]).send();
    //         }).rejects.toThrow();
    //     });
    // });

    // describe('contribute()', () => {
    //     it('应该允许在窗口期内且未达到硬顶时投资', async () => {
    //         const amount = UInt64.from(100);

    //         const tx = await Mina.transaction({
    //             sender: investor1,
    //             fee: 0.1 * 1e9,
    //             memo: '投资'
    //         }, async () => {
    //             await zkApp.contribute(amount);
    //         });
    //         await tx.prove();
    //         await tx.sign([investor1.key]).send();

    //         let balance: string = '';
    //         Provable.asProver(() => {
    //             balance = Mina.getBalance(zkApp.address).toString();
    //         });
    //         expect(balance).toBe('100');
    //     });

    //     it('当投资金额为0时应该失败', async () => {
    //         const amount = UInt64.from(0);
    //         await expect(async () => {
    //             const tx = await Mina.transaction({
    //                 sender: investor1,
    //                 fee: 0.1 * 1e9,
    //                 memo: '投资0'
    //             }, async () => {
    //                 await zkApp.contribute(amount);
    //             });
    //             await tx.prove();
    //             await tx.sign([investor1.key]).send();
    //         }).rejects.toThrow();
    //     });


    //     it('当超过结束时间时应该失败', async () => {
    //         // 模拟时间流逝
    //         Local.setBlockchainLength(UInt32.from(101));
    //         await expect(async () => {
    //             const tx = await Mina.transaction({ sender: investor1, fee: 1e9 }, async () => {
    //                 await zkApp.contribute(UInt64.from(100));
    //             });
    //             await tx.prove();
    //             await tx.sign([investor1.key]).send();
    //         }).rejects.toThrow();
    //     });
    // });
});