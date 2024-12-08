import { AccountUpdate, Field, Mina, PublicKey, UInt32, UInt64 } from "o1js";
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
    let funeMeContract: FundMe;
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
        funeMeContract = new FundMe(zkAppAccount);

        const tx = await Mina.transaction({
            sender: deployer,
            fee: 1 * UNIT,
            memo: '一笔交易',
        }, async () => {
            AccountUpdate.fundNewAccount(deployer);// 需要为新账户创建而花费1MINA
            await funeMeContract.deploy({
                hardcap: HARD_CAP,
                endTime,
                receiver: deployer
            });// 部署前设置合约初始状态
        });
        await tx.prove();
        await tx.sign([deployer.key, zkAppAccount.key]).send();
    });

    it('should deploy successfully', async () => {
        const _hardcap = funeMeContract.hardcap.get();
        const _endTime = funeMeContract.endTime.get();

        expect(_hardcap).toEqual(HARD_CAP);
        expect(_endTime).toEqual(endTime);
    });

    it('should fund successfully', async () => {
        console.log('fund');
        const tx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(1 * UNIT));
        });
        await tx.prove();
        await tx.sign([sender.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(UInt64.from(1 * UNIT))
    })

    it('should not fund exceed hardcap', async () => {
        const tx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await tx.prove();
        await tx.sign([sender.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(UInt64.from(HARD_CAP))
    })

    it('should withdraw successfully', async () => {
        const fundTx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await fundTx.prove();
        await fundTx.sign([sender.key]).send();

        local.setBlockchainLength(UInt32.from(ADD_NUM + 1));

        const tx = await Mina.transaction(deployer, async () => {
            await funeMeContract.withdraw(UInt64.from(1 * UNIT));
        });
        await tx.prove();
        await tx.sign([deployer.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(UInt64.from((ADD_NUM - 1) * UNIT));
    })

    it('should payout successfully with right preimage after deadline 200 blocks', async () => {
        const fundTx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(UInt64.from(ADD_NUM * UNIT)));
        });
        await fundTx.prove();
        await fundTx.sign([sender.key]).send();
        const allBalance = funeMeContract.account.balance.get();

        local.setBlockchainLength(endTime.add(1));

        const tx = await Mina.transaction(deployer, async () => {
            await funeMeContract.payout(Field(1234567), deployer);
        });
        await tx.prove();
        await tx.sign([deployer.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(allBalance.mul(4).div(5));

        local.setBlockchainLength(endTime.add(203));
        const tx2 = await Mina.transaction(deployer, async () => {
            await funeMeContract.payout(Field(1234567), deployer);
        });
        await tx2.prove();
        await tx2.sign([deployer.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(allBalance.mul(7).div(10));

        local.setBlockchainLength(endTime.add(405));
        const tx3 = await Mina.transaction(deployer, async () => {
            await funeMeContract.payout(Field(1234567), deployer);
        });
        await tx3.prove();
        await tx3.sign([deployer.key]).send();
        expect(funeMeContract.account.balance.get()).toEqual(allBalance.mul(3).div(5));
    })
})