import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import { Add } from './Add';

type PromiseType<T> = T extends Promise<infer U> 
  ? U 
  : never;
const MINA = 1e9;
const hardtopSlot = UInt64.from(20 * MINA);

let proofsEnabled = false;

describe('Add', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        senderAccount: Mina.TestPublicKey,
        senderKey: PrivateKey,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey,
        zkApp: Add,
        endtimeSlot: UInt32,
        local: PromiseType<ReturnType<typeof Mina.LocalBlockchain>>;

    beforeAll(async () => {
        if (proofsEnabled) await Add.compile();
    });

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [deployerAccount, senderAccount] = Local.testAccounts;
        deployerKey = deployerAccount.key;
        senderKey = senderAccount.key;

        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new Add(zkAppAddress);

        endtimeSlot = Local.getNetworkState().globalSlotSinceGenesis.add(30);
        local = Local;
    });

	async function localDeploy() {
		const txn = await Mina.transaction(deployerAccount, async () => {
			AccountUpdate.fundNewAccount(deployerAccount);
			await zkApp.deploy({ receiver: deployerAccount, hardtop: hardtopSlot, endtime: endtimeSlot });
		});
		await txn.prove();
		(await txn.sign([deployerKey, zkAppPrivateKey]).send());
	}

	it('部署合约', async () => {
		await localDeploy();
		const targetAmount = zkApp.hardtop.get();
        console.log(`now hardtop: ${targetAmount}`)
		expect(targetAmount).toEqual(UInt64.from(hardtopSlot));
		const curBalance = zkApp.account.balance.getAndRequireEquals();
		console.log(`int curBalance: ${curBalance}`)
	});

	it('正常投资操作', async () => {
        //正常投资金额小于可投资金额
		await localDeploy();
        //转账操作10个mina
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(10 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();
		const amount = zkApp.account.balance.getAndRequireEquals();
        //余额等于投资金额
		expect(amount).toEqual(UInt64.from(10 * MINA));
	});

    it('超过硬顶投资适应', async () => {
        //投资金额超过可投资金额
		await localDeploy();
		const txn = await Mina.transaction(senderAccount, async () => {
			await zkApp.fund(UInt64.from(20 * MINA));
		});
		await txn.prove();
		await txn.sign([senderKey]).send();
		const amount = zkApp.account.balance.getAndRequireEquals();
        //余额是等于硬顶
		expect(amount).toEqual(UInt64.from(20 * MINA));
	});

    it('未到期提款失败', async () => {
        //未到期提款失败
		await localDeploy();
		const withdrawTxn = await Mina.transaction(deployerAccount, async () => {
			await zkApp.withdraw();
		})
		await withdrawTxn.prove();
		await withdrawTxn.sign([deployerKey]).send();

		const receiverBalance = AccountUpdate.create(senderAccount).balanceChange.equals(20 * MINA);
		expect(receiverBalance).toBeTruthy();
	});

    it('正常提款操作', async () => {
        //正常到期提款
		await localDeploy();
        //加速
		local.incrementGlobalSlot(50);
		const curSlot = local.getNetworkState().globalSlotSinceGenesis;

		const withdrawTxn = await Mina.transaction(deployerAccount, async () => {
			await zkApp.withdraw();
		})
		await withdrawTxn.prove();
		await withdrawTxn.sign([deployerKey]).send();

		const receiverBalance = AccountUpdate.create(senderAccount).balanceChange.equals(20 * MINA);
		expect(receiverBalance).toBeTruthy();
	});

	it('非法提款操作失败', async () => {
        //非法账户提款
		await localDeploy();
		expect(
			Mina.transaction(senderAccount, async () => {
				await zkApp.withdraw();
			})
		).rejects.toThrow();
	});
});
