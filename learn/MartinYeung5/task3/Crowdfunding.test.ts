import { AccountUpdate, Bool, Mina, PrivateKey, UInt32, UInt64 } from 'o1js';
import { Crowdfunding, MINA } from './Crowdfunding';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type LocalBlockchain = UnwrapPromise<ReturnType<typeof Mina.LocalBlockchain>>;

// 使用 JEST 測試
describe('Crowdfunding Local Net', () => {
  let Local: LocalBlockchain,
    deployer: Mina.TestPublicKey,
    investor: Mina.TestPublicKey,
    fundingReceiver: Mina.TestPublicKey,
    crowdfundingAccount: PrivateKey,
    crowdfundingProgram: Crowdfunding;

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    [deployer, investor, fundingReceiver] = Local.testAccounts;

    crowdfundingAccount = PrivateKey.random();
    crowdfundingProgram = new Crowdfunding(crowdfundingAccount.toPublicKey());
  });

  // 本地 deploy
  async function localDeploy(target = 100, duration = 10) {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await crowdfundingProgram.deploy({
        fundingReceiver,
        targetedFunding: UInt64.from(target * MINA),
        endTime: UInt32.from(duration),
      });
    });
    await txn.prove();
    await txn.sign([deployer.key, crowdfundingAccount]).send();
  }

  async function invest(amount: UInt64) {
    const txn = await Mina.transaction(investor, async () => {
      await crowdfundingProgram.invest(amount);
    });
    await txn.prove();
    await txn.sign([investor.key]).send();
    return txn;
  }

  it('invest correctly', async () => {
    await localDeploy();
    const amount = UInt64.from(1 * MINA);
    await invest(amount);
    expect(crowdfundingProgram.currentFunding.get()).toEqual(amount);

    const update = AccountUpdate.create(crowdfundingAccount.toPublicKey());
    expect(update.account.balance.get()).toEqual(amount);
  });

  it('lack of balance', async () => {
    await localDeploy();
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.invest(UInt64.from(10000 * MINA));
      });
    }).rejects;
  });

  it('over investment', async () => {
    await localDeploy(2);
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.invest(UInt64.from(10 * MINA));
      });
    }).rejects;
  });

  it('crowdfunding is closed', async () => {
    await localDeploy();
    Local.setBlockchainLength(UInt32.from(100));
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.invest(UInt64.from(10 * MINA));
      });
    }).rejects;
  });

  it('withdraw', async () => {
    await localDeploy(20);
    const amount = UInt64.from(20 * MINA);
    await invest(amount);
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.withdraw();
      });
    }).rejects;

    Local.setBlockchainLength(UInt32.from(100));

    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.withdraw();
      });
    }).rejects;


    const beforeBalance = AccountUpdate.create(fundingReceiver).account.balance.get();
    const txn = await Mina.transaction(fundingReceiver, async () => {
      await crowdfundingProgram.withdraw();
    });
    await txn.prove();
    await txn.sign([fundingReceiver.key]).send();
    expect(crowdfundingProgram.closed.get()).toEqual(Bool(true));
    expect(AccountUpdate.create(fundingReceiver).account.balance.get()).toEqual(beforeBalance.add(amount));

    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await crowdfundingProgram.withdraw();
      });
    }).rejects;
  });
});