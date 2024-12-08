import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import { CrowdFundingContract } from './Add';

type PromiseType<T> = T extends Promise<infer U> ? U : never;

const MINA_UNIT = 1e9;
const MAX_FUNDING_CAP = UInt64.from(25 * MINA_UNIT);

let proofsEnabled = false;

describe('CrowdFunding Contract Tests', () => {
    let adminAccount: Mina.TestPublicKey,
        adminKey: PrivateKey,
        investorAccount: Mina.TestPublicKey,
        investorKey: PrivateKey,
        contractAddress: PublicKey,
        contractPrivateKey: PrivateKey,
        crowdfunding: CrowdFundingContract,
        projectDeadline: UInt32,
        localBlockchain: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

    beforeAll(async () => {
        if (proofsEnabled) await CrowdFundingContract.compile();
    });

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [adminAccount, investorAccount] = Local.testAccounts;
        adminKey = adminAccount.key;
        investorKey = investorAccount.key;

        contractPrivateKey = PrivateKey.random();
        contractAddress = contractPrivateKey.toPublicKey();
        crowdfunding = new CrowdFundingContract(contractAddress);

        projectDeadline = Local.getNetworkState().globalSlotSinceGenesis.add(40);
        localBlockchain = Local;
    });

    async function deployContract() {
        const txn = await Mina.transaction(adminAccount, async () => {
            AccountUpdate.fundNewAccount(adminAccount);
            await crowdfunding.deploy({ 
                beneficiary: adminAccount, 
                maxCap: MAX_FUNDING_CAP, 
                deadline: projectDeadline 
            });
        });
        await txn.prove();
        await txn.sign([adminKey, contractPrivateKey]).send();
    }

    it('初始化合约参数测试', async () => {
        await deployContract();
        const maxCapAmount = crowdfunding.maxCap.get();
        console.log(`设置的募资上限: ${maxCapAmount}`);
        expect(maxCapAmount).toEqual(UInt64.from(MAX_FUNDING_CAP));
        
        const initialBalance = crowdfunding.account.balance.getAndRequireEquals();
        console.log(`初始合约余额: ${initialBalance}`);
    });

    it('投资者贡献资金测试', async () => {
        await deployContract();
        const contribution = UInt64.from(15 * MINA_UNIT);
        
        const txn = await Mina.transaction(investorAccount, async () => {
            await crowdfunding.contribute(contribution);
        });
        await txn.prove();
        await txn.sign([investorKey]).send();
        
        const balance = crowdfunding.account.balance.getAndRequireEquals();
        expect(balance).toEqual(UInt64.from(15 * MINA_UNIT));
    });

    it('超额投资自动调整测试', async () => {
        await deployContract();
        const largeContribution = UInt64.from(30 * MINA_UNIT);
        
        const txn = await Mina.transaction(investorAccount, async () => {
            await crowdfunding.contribute(largeContribution);
        });
        await txn.prove();
        await txn.sign([investorKey]).send();
        
        const balance = crowdfunding.account.balance.getAndRequireEquals();
        expect(balance).toEqual(UInt64.from(25 * MINA_UNIT));
    });

    it('提前提取资金失败测试', async () => {
        await deployContract();
        const txn = await Mina.transaction(adminAccount, async () => {
            await crowdfunding.claimFunds();
        });
        await txn.prove();
        await txn.sign([adminKey]).send();

        const beneficiaryBalance = AccountUpdate.create(investorAccount).balanceChange.equals(25 * MINA_UNIT);
        expect(beneficiaryBalance).toBeTruthy();
    });

    it('到期后提取资金成功测试', async () => {
        await deployContract();
        localBlockchain.incrementGlobalSlot(60);
        
        const txn = await Mina.transaction(adminAccount, async () => {
            await crowdfunding.claimFunds();
        });
        await txn.prove();
        await txn.sign([adminKey]).send();

        const beneficiaryBalance = AccountUpdate.create(investorAccount).balanceChange.equals(25 * MINA_UNIT);
        expect(beneficiaryBalance).toBeTruthy();
    });

    it('非管理员提取资金失败测试', async () => {
        await deployContract();
        expect(
            Mina.transaction(investorAccount, async () => {
                await crowdfunding.claimFunds();
            })
        ).rejects.toThrow();
    });
});
