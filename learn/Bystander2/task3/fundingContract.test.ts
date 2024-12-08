import { Mina, AccountUpdate, UInt32, UInt64 } from 'o1js';
import { FundingContract } from './fundingContract';

describe('Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
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
    [deployer, sender] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();
    zkapp = new FundingContract(zkappAccount);

    // console.log(hardCap, endTime);
    const tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 1 * UNIT,
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
      await zkapp.deposit(UInt64.from(20 * UNIT));
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
});
