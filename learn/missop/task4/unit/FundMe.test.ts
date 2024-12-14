import { AccountUpdate, Mina, UInt32, UInt64 } from "o1js";
import { FundMe } from "..";

const proofsEnabled = false;
const UNIT = 1e9
const ADD_NUM = 30;
const HARD_CAP = UInt64.from(ADD_NUM * UNIT);

type PromiseType<T> = T extends Promise<infer U> ? U : never;
describe('FundMe', () => {
    let deployer: Mina.TestPublicKey;
    let endTime: UInt32;
    let sender: Mina.TestPublicKey;
    let zkAppAccount: Mina.TestPublicKey;
    let fundMeContract: FundMe;
    let local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

    beforeAll(async () => {
        if (proofsEnabled) {
            await FundMe.compile();
        } else {
            await FundMe.analyzeMethods();
        }
    });

    beforeEach(async () => {
        local = await Mina.LocalBlockchain({ proofsEnabled })
        Mina.setActiveInstance(local);
        const [deployerAccount, senderAccount] = local.testAccounts;
        deployer = deployerAccount;
        sender = senderAccount;
        endTime = local.getNetworkState().globalSlotSinceGenesis.add(ADD_NUM);
        zkAppAccount = Mina.TestPublicKey.random();
        fundMeContract = new FundMe(zkAppAccount);

        const tx = await Mina.transaction({
            sender: deployer,
            fee: 1 * UNIT,
            memo: '一笔交易',
        }, async () => {
            AccountUpdate.fundNewAccount(deployer);// 需要为新账户创建而花费1MINA
            await fundMeContract.deploy({
                hardcap: HARD_CAP,
                endTime,
                receiver: deployer
            });// 部署前设置合约初始状态
        });
        await tx.prove();
        await tx.sign([deployer.key, zkAppAccount.key]).send();
    });

    it('should deploy successfully', async () => {
        const _hardcap = fundMeContract.hardcap.get();
        const _endTime = fundMeContract.endTime.get();

        expect(_hardcap).toEqual(HARD_CAP);
        expect(_endTime).toEqual(endTime);
    });

    it('should fund successfully', async () => {
        const tx = await Mina.transaction(sender, async () => {
            await fundMeContract.fund(UInt64.from(1 * UNIT));
        });
        await tx.prove();
        await tx.sign([sender.key]).send();

        expect(fundMeContract.account.balance.get()).toEqual(UInt64.from(1 * UNIT))
    })

    it('should not fund exceed hardcap', async () => {
        const tx = await Mina.transaction(sender, async () => {
            await fundMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await tx.prove();
        await tx.sign([sender.key]).send();
        expect(fundMeContract.account.balance.get()).toEqual(UInt64.from(HARD_CAP))
    })

    it('should withdraw successfully', async () => {
        const fundTx = await Mina.transaction(sender, async () => {
            await fundMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await fundTx.prove();
        await fundTx.sign([sender.key]).send();

        local.setBlockchainLength(UInt32.from(ADD_NUM + 1));

        const tx = await Mina.transaction(deployer, async () => {
            await fundMeContract.withdraw(UInt64.from(1 * UNIT));
        });
        await tx.prove();
        await tx.sign([deployer.key]).send();

        expect(fundMeContract.account.balance.get()).toEqual(UInt64.from((ADD_NUM - 1) * UNIT));
    })

    it('should withdraw 20% of the balance after cliffTime at most', async () => {
        // 先转账 30MINA
        let tx = await Mina.transaction(sender, async () => {
            await fundMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await tx.prove();
        await tx.sign([sender.key]).send();
        console.log(`current balance of zkapp: ${fundMeContract.account.balance.get().div(1e9)} MINA`, '\n');
        console.log('payout...');

        tx = await Mina.transaction(sender, async () => {
            await fundMeContract.payout();
        });
        await tx.prove();
        await tx.sign([sender.key]).send();
        console.log(`current balance of zkapp: ${fundMeContract.account.balance.get().div(1e9)} MINA`, '\n');
        console.log("withdraw...");

        // tx = await Mina.transaction(sender, async () => {
        //     await fundMeContract.withdraw(UInt64.from(1 * UNIT));
        // })
        // console.log("fund not ended, withdraw failed")

        console.log("the blockchainLength before set", `${local.getNetworkState().blockchainLength}`)
        local.setBlockchainLength(endTime.add(1));
        console.log("the blockchainLength after set", `${local.getNetworkState().blockchainLength}`, '\n')
        let withdrawAmount = UInt64.from(ADD_NUM * UNIT).div(5);
        console.log(`withdraw ${withdrawAmount.div(1e9)} MINA after endtime`)
        tx = await Mina.transaction(deployer, async () => {
            await fundMeContract.withdraw(withdrawAmount);
        })
        await tx.prove();
        await tx.sign([deployer.key]).send();
        console.log(`current balance of zkapp: ${fundMeContract.account.balance.get().div(1e9)} MINA`, '\n');
        console.log(`current balance of deployer: ${Mina.getBalance(deployer).div(1e9)} MINA`, '\n');

        local.incrementGlobalSlot(200);
        withdrawAmount = UInt64.from(ADD_NUM * UNIT).div(10);
        console.log(`withdraw ${withdrawAmount.div(1e9)} MINA after 200 slot`)
        tx = await Mina.transaction(deployer, async () => {
            await fundMeContract.withdraw(withdrawAmount);
        })
        await tx.prove();
        await tx.sign([deployer.key]).send();
        console.log(`current balance of zkapp: ${fundMeContract.account.balance.get().div(1e9)} MINA`, '\n');
        console.log(`current balance of deployer: ${Mina.getBalance(deployer).div(1e9)} MINA`, '\n');

        console.log(`withdraw ${withdrawAmount.div(1e9)} MINA within 200 slot`)
        tx = await Mina.transaction(deployer, async () => {
            await fundMeContract.withdraw(withdrawAmount);
        })
        await tx.prove();
        await tx.sign([deployer.key]).send();
        console.log("failed")
    })
})