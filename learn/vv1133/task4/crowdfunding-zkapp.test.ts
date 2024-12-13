import { Field, Mina, AccountUpdate, UInt32, UInt64 } from 'o1js';
import { CrowdfundingZkapp } from './crowdfunding-zkapp.js';

describe('Crowdfunding Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    anotherGuy: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
    zkapp: CrowdfundingZkapp,
    hardCap: number,
    endTime: number;

  beforeAll(async () => {
    hardCap = 1000 * 10 ** 9;
    endTime = 3;
    await CrowdfundingZkapp.compile();
  });

  beforeEach(async () => {
    local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(local);
    local.setBlockchainLength(UInt32.from(1));

    [deployer, sender, anotherGuy] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();
    zkapp = new CrowdfundingZkapp(zkappAccount);
  });

  async function deploy() {
    console.log(hardCap, endTime);
    let tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 0.1 * 10e9,
        memo: 'deploy',
      },
      async () => {
        AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: deployer,
        }); // 部署前设置合约初始状态
      }
    );
    await tx.prove();
    await tx.sign([deployer.key, zkappAccount.key]).send();
    console.log(tx.toPretty());
  }

  it('unlock crowdfunding deposit', async () => {
    await deploy();

    const depositAmount = 3 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10e9, memo: 'deposit' },
      async () => {
        await zkapp.deposit(UInt64.from(depositAmount));
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    const amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(depositAmount)));
  });

  it('unlock crowdfunding deposit hardcap', async () => {
    await deploy();

    const depositAmount = 12 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10e9, memo: 'deposit' },
      async () => {
        await zkapp.deposit(UInt64.from(depositAmount));
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    const amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(hardCap)));
  });

  it('unlock crowdfunding withdraw', async () => {
    await deploy();

    const depositAmount = 100 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10 ** 9, memo: 'deposit' },
      async () => {
        await zkapp.deposit(UInt64.from(depositAmount));
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    local.setBlockchainLength(UInt32.from(endTime + 1));

    let amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(depositAmount)));

    // 先将deployer的余额转移给另一个地址
    let deployerAmount = Mina.getBalance(deployer);
    tx = await Mina.transaction(
      { sender: deployer, fee: 0.1 * 10 ** 9, memo: 'withdraw' },
      async () => {
        const acctUpdate = AccountUpdate.createSigned(deployer);
        acctUpdate.send({
          to: anotherGuy,
          amount: deployerAmount.sub(UInt64.from(5 * 10 ** 9)),
        });
      }
    );
    await tx.sign([deployer.key]).send();

    // withdraw
    tx = await Mina.transaction(
      { sender: deployer, fee: 0.1 * 10 ** 9, memo: 'withdraw' },
      async () => {
        await zkapp.withdraw();
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());

    amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(0)));

    amount = zkapp.account.balance.getAndRequireEquals();
    console.log('zkapp deposit balance: ' + amount);
    // slot 0
    tx = await Mina.transaction(deployer, async () => {
      const acctUpdate = AccountUpdate.createSigned(deployer);
      acctUpdate.send({
        to: anotherGuy,
        amount: UInt64.from(15 * 10 ** 9),
      });
    });
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());

    // 再转10个mina，期望失败
    try {
      tx = await Mina.transaction(deployer, async () => {
        const acctUpdate = AccountUpdate.createSigned(deployer);
        acctUpdate.send({
          to: anotherGuy,
          amount: UInt64.from(10 * 10 ** 9),
        });
      });
      await tx.prove();
      await tx.sign([deployer.key]).send();
      expect(true).toBe(false); // 不应执行到这里
    } catch (e) {
      console.log(e);
    }

    // 200个slot后再转，期望成功
    local.incrementGlobalSlot(UInt32.from(200));
    tx = await Mina.transaction(deployer, async () => {
      const acctUpdate = AccountUpdate.createSigned(deployer);
      acctUpdate.send({
        to: anotherGuy,
        amount: UInt64.from(10 * 10 ** 9),
      });
    });
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());
  });
});
