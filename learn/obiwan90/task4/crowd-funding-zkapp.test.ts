import { CrowdfundingContract, CrowdfundingEvent, EVENT_TYPE } from './crowd-funding-zkapp';
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
    fetchAccount,
    Permissions
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

        zkappKey = PrivateKey.random();
        zkApp = new CrowdfundingContract(zkappKey.toPublicKey());

        // 获取当前区块高度
        const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;
        console.log('Current slot:', currentSlot);

        // 设置结束时间为当前时间 + 100
        const endTime = UInt32.from(currentSlot).add(UInt32.from(100));
        console.log('End time:', endTime.toString());

        // 部署合约
        const txn = await Mina.transaction({
            sender: deployer,
            fee: 0.2 * 1e9,  // 增加手续费
            memo: '众筹合约',
        }, async () => {
            AccountUpdate.fundNewAccount(deployer);
            await zkApp.deploy({
                verificationKey: undefined,
                hardCap: hardCap,
                endTime: endTime,
                beneficiary: beneficiary
            });
        });
        await txn.prove();
        // 注意签名顺序：deployer用于支付费用，beneficiary用于授权修改其账户，zkappKey用于部署合约
        await txn.sign([deployer.key, zkappKey]).send();

        // 打印受益人账户信息以便调试
        const beneficiaryAccount = Mina.getAccount(beneficiary);
        console.log('Beneficiary timing:', beneficiaryAccount.timing);
    });

    describe('contribute', () => {
        it('应该允许在结束时间前且未达硬顶���投资', async () => {
            // 投资金额：5 MINA
            const investAmount = UInt64.from(5 * 1e9);

            // 执行投资交易
            const txn = await Mina.transaction({
                sender: investor1,
                fee: 0.2 * 1e9,
                memo: '投资众筹',
            }, async () => {
                await zkApp.contribute(investAmount);
            });
            await txn.prove();
            await txn.sign([investor1.key]).send();

            // 验证合约中记录的总投资额
            console.log(`current balance of zkapp: ${zkApp.account.balance.get().div(1e9)} MINA`);
            expect(zkApp.account.balance.get().div(1e9)).toEqual(investAmount.div(1e9));
        });

        it('在结束时间后不能投资', async () => {
            // 推进区块到结束时间之后
            const endTime = zkApp.endTime.get().add(1);
            await Local.setGlobalSlot(endTime);

            // 尝试投资
            const investAmount = UInt64.from(1 * 1e9);
            await expect(async () => {
                const txn = await Mina.transaction({
                    sender: investor1.address,
                    fee: 0.2 * 1e9,
                }, async () => {
                    await zkApp.contribute(investAmount);
                });
                await txn.prove();
                await txn.sign([investor1.key]).send();
            }).rejects.toThrow();
        });

        it('投资金额超过硬顶时应该失败', async () => {
            // 尝试投资超过硬顶的额
            const investAmount = UInt64.from(11 * 1e9); // 硬顶是10 MINA
            await expect(async () => {
                const txn = await Mina.transaction({
                    sender: investor1,
                    fee: 0.2 * 1e9,
                }, async () => {
                    await zkApp.contribute(investAmount);
                });
                await txn.prove();
                await txn.sign([investor1.key]).send();
            }).rejects.toThrow();
        });
    });

    describe('withdraw and vesting', () => {
        beforeEach(async () => {
            // 先进行一笔投资
            const investAmount = UInt64.from(10 * 1e9); // 投资10 MINA
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
                    sender: beneficiary,
                    fee: 0.2 * 1e9,
                }, async () => {
                    await zkApp.withdraw();
                });
                await txn.prove();
                await txn.sign([beneficiary.key]).send();
            }).rejects.toThrow('众筹未结束');
        });

        it('非受益人不能提现', async () => {
            Local.setBlockchainLength(UInt32.from(101));
            await expect(async () => {
                const txn = await Mina.transaction({
                    sender: investor1,
                    fee: 0.2 * 1e9,
                }, async () => {
                    await zkApp.withdraw();
                });
                await txn.prove();
                await txn.sign([investor1.key]).send();
            }).rejects.toThrow('只有受益人可以提现');
        });

        it('应该按计划逐步释放资金', async () => {
            // 清空受益人余额，保留20 MINA用于手续费和最小余额要求
            const beneficiaryBalance = Mina.getBalance(beneficiary);
            console.log('Initial beneficiary balance:', beneficiaryBalance.div(1e9).toString(), 'MINA');

            if (beneficiaryBalance.greaterThan(UInt64.from(20e9))) {
                await Mina.transaction({
                    sender: beneficiary,
                    fee: 0.1 * 1e9,
                }, async () => {
                    const acctUpdate = AccountUpdate.createSigned(beneficiary);
                    acctUpdate.send({
                        to: investor2,
                        amount: beneficiaryBalance.sub(UInt64.from(20e9))
                    });
                }).sign([beneficiary.key]).prove().send();
            }

            console.log('Beneficiary balance after clearing:',
                Mina.getBalance(beneficiary).div(1e9).toString(), 'MINA');

            // 推进到众筹结束时间并提现
            Local.setBlockchainLength(UInt32.from(101));
            console.log('Contract balance before withdraw:',
                Mina.getBalance(zkApp.address).div(1e9).toString(), 'MINA');

            // 执行提现
            await Mina.transaction({
                sender: beneficiary,
                fee: 0.1 * 1e9,
            }, async () => {
                await zkApp.withdraw();
            }).sign([beneficiary.key]).prove().send();

            console.log('Beneficiary balance after withdraw:',
                Mina.getBalance(beneficiary).div(1e9).toString(), 'MINA');
            console.log('Contract balance after withdraw:',
                Mina.getBalance(zkApp.address).div(1e9).toString(), 'MINA');

            // 打印益人账户的 timing 设置
            const beneficiaryAccount = Mina.getAccount(beneficiary);
            console.log('Beneficiary timing after withdraw:', {
                initialMinimumBalance: beneficiaryAccount.timing.initialMinimumBalance?.toString(),
                cliffTime: beneficiaryAccount.timing.cliffTime?.toString(),
                cliffAmount: beneficiaryAccount.timing.cliffAmount?.toString(),
                vestingPeriod: beneficiaryAccount.timing.vestingPeriod?.toString(),
                vestingIncrement: beneficiaryAccount.timing.vestingIncrement?.toString()
            });
            console.log(
                Mina.getBalance(beneficiary).div(1e9).toString(), 'MINA'
            );
            console.log(
                Mina.getBalance(investor2).div(1e9).toString(), 'MINA'
            );
            // 尝试转出一个大金额（应该失败）
            await expect(async () => {
                await Mina.transaction({
                    sender: beneficiary,
                    fee: 0.1 * 1e9,
                }, async () => {
                    const acctUpdate = AccountUpdate.createSigned(beneficiary);
                    acctUpdate.send({
                        to: investor2,
                        amount: UInt64.from(25e9) // 尝试转出25 MINA
                    });
                }).sign([beneficiary.key]).prove().send();
            }).rejects.toThrow('Source_minimum_balance_violation');

            // 尝试出允许的金额（应该成功）
            await Mina.transaction({
                sender: beneficiary,
                fee: 0.1 * 1e9,
            }, async () => {
                const acctUpdate = AccountUpdate.createSigned(beneficiary);
                acctUpdate.send({
                    to: investor2,
                    amount: UInt64.from(2e9) // 只转出2 MINA（cliff amount）
                });
            }).sign([beneficiary.key]).prove().send();

            console.log('Balances after transfers:');
            console.log('Beneficiary:', Mina.getBalance(beneficiary).div(1e9).toString(), 'MINA');
            console.log('Investor2:', Mina.getBalance(investor2).div(1e9).toString(), 'MINA');
        });
    });

    describe('events', () => {
        it('应该正确发出投资事件', async () => {
            const investAmount = UInt64.from(5 * 1e9);
            const currentBlock = Local.getNetworkState().blockchainLength;

            const txn = await Mina.transaction({
                sender: investor1,
                fee: 0.2 * 1e9,
            }, async () => {
                await zkApp.contribute(investAmount);
            });
            await txn.prove();
            await txn.sign([investor1.key]).send();

            const events = await zkApp.fetchEvents();
            const eventData = events[0].event.data as unknown as CrowdfundingEvent;

            expect(events.length).toBe(1);
            expect(eventData.type).toEqual(EVENT_TYPE.CONTRIBUTE);
            expect(eventData.amount).toEqual(investAmount);
            expect(eventData.timestamp).toEqual(UInt32.from(currentBlock));

            // 打印事件内容以便调试
            console.log('Event data:', {
                type: eventData.type.toString(),
                sender: eventData.sender.toBase58(),
                amount: eventData.amount.div(1e9).toString(),
                timestamp: eventData.timestamp.toString()
            });
        });

        it('应该正确发出提现事件', async () => {
            // 先进行投资
            const investAmount = UInt64.from(10 * 1e9);
            await Mina.transaction({
                sender: investor1,
                fee: 0.2 * 1e9,
            }, async () => {
                await zkApp.contribute(investAmount);
            }).sign([investor1.key]).prove().send();

            // 推进到结束时间
            Local.setBlockchainLength(UInt32.from(101));
            const currentBlock = Local.getNetworkState().blockchainLength;

            // 执行提现
            const withdrawTx = await Mina.transaction({
                sender: beneficiary,
                fee: 0.1 * 1e9,
            }, async () => {
                await zkApp.withdraw();
            });
            await withdrawTx.prove();
            await withdrawTx.sign([beneficiary.key]).send();

            // 验证提现事件
            const events = await zkApp.fetchEvents();
            expect(events.length).toBe(2); // 1个投资事件 + 1个提现事件

            // 找到提现事件
            const withdrawEvent = events
                .map(e => e.event.data as unknown as CrowdfundingEvent)
                .find(e => e.type.equals(EVENT_TYPE.WITHDRAW));

            // 验证提现事件
            expect(withdrawEvent).toBeDefined();
            expect(withdrawEvent!.amount).toEqual(investAmount);
            expect(withdrawEvent!.timestamp).toEqual(UInt32.from(currentBlock));

            // 打印事件内容以便调试
            console.log('Withdraw event:', {
                type: withdrawEvent!.type.toString(),
                sender: withdrawEvent!.sender.toBase58(),
                amount: withdrawEvent!.amount.div(1e9).toString(),
                timestamp: withdrawEvent!.timestamp.toString()
            });
        });


    });

});
