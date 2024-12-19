import { Mina, AccountUpdate, UInt32, UInt64 } from 'o1js';
import { FundingContract } from './fundingContract';

describe('Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
    other: Mina.TestPublicKey,
    zkapp: FundingContract,
    hardCap: number,
    endTime: number,
    UNIT: number;
  beforeAll(async () => {
    UNIT = 1e9;
    hardCap = 20 * UNIT;
    endTime = 3;
    await FundingContract.compile();
  });

  beforeEach(async () => {
    local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(local);
    [deployer, sender, other] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();
    zkapp = new FundingContract(zkappAccount);

    // console.log(hardCap, endTime);
    const tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 0.2 * UNIT,
        memo: 'deploy',
      },
      async () => {
        AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: deployer,
        });
      }
    );
    await tx.prove();
    await tx.sign([deployer.key, zkappAccount.key]).send();
  });

  it('should deploy sucessfully', async () => {
    const getHardCap = zkapp.hardCap.get();
    const getEndTime = zkapp.endTime.get();

    expect(getHardCap).toEqual(UInt64.from(hardCap));
    expect(getEndTime).toEqual(UInt32.from(endTime));
  });

  it('should deposit sucessfully', async () => {
    const tx = await Mina.transaction(sender, async () => {
      await zkapp.deposit(UInt64.from(1 * UNIT));
    });

    await tx.prove();
    await tx.sign([sender.key]).send();
    expect(zkapp.account.balance.get()).toEqual(UInt64.from(1 * UNIT));
  });

  it('should not exceed hardcap', async () => {
    const tx = await Mina.transaction(sender, async () => {
      await zkapp.deposit(UInt64.from(21 * UNIT));
    });

    await tx.prove();
    await tx.sign([sender.key]).send();
    expect(zkapp.account.balance.get()).toEqual(UInt64.from(hardCap));
  });

  it('should withdraw sucessfully', async () => {
    const depositTX = await Mina.transaction(sender, async () => {
      await zkapp.deposit(UInt64.from(UInt64.from(20 * UNIT)));
    });
    await depositTX.prove();
    await depositTX.sign([sender.key]).send();

    local.setBlockchainLength(UInt32.from(endTime + 1));

    const tx = await Mina.transaction(
      { sender: deployer, fee: 1 * UNIT },
      async () => {
        await zkapp.withdraw();
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();

    const amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(0)));
  });

  it('should withdraw 10% of balance after 200 block', async () => {
    const depositNum = 20 * UNIT;
    let tx = await Mina.transaction({ sender, memo: 'Deposit' }, async () => {
      await zkapp.deposit(UInt64.from(depositNum));
    });
    await tx.prove();
    await tx.sign([sender.key]).send();

    console.log('tx:', zkapp.account.balance.get().div(UNIT).toBigInt());

    local.setBlockchainLength(UInt32.from(endTime + 1));
    let amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(depositNum)));

    let deployerNum = Mina.getBalance(deployer);
    tx = await Mina.transaction(
      { sender: deployer, fee: 0.1 * 10 ** 9, memo: 'withdraw' },
      async () => {
        const acctUpdate = AccountUpdate.createSigned(deployer);
        acctUpdate.send({
          to: other,
          amount: deployerNum.sub(UInt64.from(6 * UNIT)),
        });
      }
    );
    await tx.sign([deployer.key]).send();

    tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 0.1 * UNIT,
        memo: 'withdraw',
      },
      async () => {
        await zkapp.withdraw();
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();

    amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(0)));

    console.log('dep:', Mina.getBalance(deployer).div(UNIT).toBigInt());
    // slot 0
    tx = await Mina.transaction(deployer, async () => {
      const acctUpdate = AccountUpdate.createSigned(deployer);
      acctUpdate.send({
        to: other,
        amount: UInt64.from(4 * UNIT),
      });
    });
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());

    try {
      tx = await Mina.transaction(deployer, async () => {
        const acctUpdate = AccountUpdate.createSigned(deployer);
        acctUpdate.send({
          to: other,
          amount: UInt64.from(10 * UNIT), // 尝试转账
        });
      });
      await tx.prove();
      await tx.sign([deployer.key]).send();
      expect(true).toBe(false); // 不应执行到这里
    } catch (e) {
      console.log(e);
    }
    console.log('dep2:', Mina.getBalance(deployer).div(UNIT).toBigInt());

    local.incrementGlobalSlot(UInt32.from(200));
    tx = await Mina.transaction(deployer, async () => {
      const acctUpdate = AccountUpdate.createSigned(deployer);
      acctUpdate.send({
        to: other,
        amount: UInt64.from(2 * UNIT),
      });
    });
    await tx.prove();
    await tx.sign([deployer.key]).send();

    console.log('dep3:', Mina.getBalance(deployer).div(UNIT).toBigInt());
  });
});
