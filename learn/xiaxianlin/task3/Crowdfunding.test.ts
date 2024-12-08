import { AccountUpdate, Bool, Mina, PrivateKey, UInt32, UInt64 } from 'o1js';
import { Crowdfunding, MINA } from './Crowdfunding';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type LocalBlockchain = UnwrapPromise<ReturnType<typeof Mina.LocalBlockchain>>;

describe('Crowdfunding Local Net', () => {
  let Local: LocalBlockchain,
    deployer: Mina.TestPublicKey,
    investor: Mina.TestPublicKey,
    receiver: Mina.TestPublicKey,
    zkAppAccount: PrivateKey,
    zkApp: Crowdfunding;

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    [deployer, investor, receiver] = Local.testAccounts;

    zkAppAccount = PrivateKey.random();
    zkApp = new Crowdfunding(zkAppAccount.toPublicKey());
  });

  async function localDeploy(target = 100, duration = 10) {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy({
        receiver,
        target: UInt64.from(target * MINA),
        endBlockHeight: UInt32.from(duration),
      });
    });
    await txn.prove();
    await txn.sign([deployer.key, zkAppAccount]).send();
  }

  async function invest(amount: UInt64) {
    const txn = await Mina.transaction(investor, async () => {
      await zkApp.invest(amount);
    });
    await txn.prove();
    await txn.sign([investor.key]).send();
    return txn;
  }

  it('正常投资', async () => {
    await localDeploy();
    const amount = UInt64.from(10 * MINA);
    await invest(amount);
    expect(zkApp.raised.get()).toEqual(amount);

    const update = AccountUpdate.create(zkAppAccount.toPublicKey());
    expect(update.account.balance.get()).toEqual(amount);
  });

  it('账户余额不足', async () => {
    await localDeploy();
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.invest(UInt64.from(10000 * MINA));
      });
    }).rejects;
  });

  it('投资额超出剩余筹集额度', async () => {
    await localDeploy(2);
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.invest(UInt64.from(10 * MINA));
      });
    }).rejects;
  });

  it('众筹窗口期已过投资失败', async () => {
    await localDeploy();
    Local.setBlockchainLength(UInt32.from(100));
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.invest(UInt64.from(10 * MINA));
      });
    }).rejects;
  });

  it('取款', async () => {
    await localDeploy(20);
    const amount = UInt64.from(20 * MINA);
    await invest(amount);
    // 窗口期内取款失败
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
    }).rejects;

    Local.setBlockchainLength(UInt32.from(100));

    // 非接收人提取失败
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
    }).rejects;

    // 正常提取
    const beforeBalance = AccountUpdate.create(receiver).account.balance.get();
    const txn = await Mina.transaction(receiver, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([receiver.key]).send();
    expect(zkApp.closed.get()).toEqual(Bool(true));
    expect(AccountUpdate.create(receiver).account.balance.get()).toEqual(beforeBalance.add(amount));

    // 提取后再次提取失败
    expect(async () => {
      const txn = await Mina.transaction(investor, async () => {
        await zkApp.withdraw();
      });
    }).rejects;
  });
});
