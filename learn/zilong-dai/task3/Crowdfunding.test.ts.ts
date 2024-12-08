import { Field, Mina, AccountUpdate, UInt32, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding.js';

describe('Crowdfunding Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
    zkapp: Crowdfunding,
    hardCap: number,
    endTime: number;

  beforeAll(async () => {
    hardCap = 10 * 10 ** 9;
    endTime = 3;
    await Crowdfunding.compile();
  });

  beforeEach(async () => {
    local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(local);
    local.setBlockchainLength(UInt32.from(1));

    [deployer, sender] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();
    zkapp = new Crowdfunding(zkappAccount);
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
        AccountUpdate.fundNewAccount(deployer); 
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: deployer,
        }); 
      }
    );
    await tx.prove();
    await tx.sign([deployer.key, zkappAccount.key]).send();
    console.log(tx.toPretty());
  }

  it('crowdfunding deposit', async () => {
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

  it('crowdfunding deposit hardcap', async () => {
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

  it('crowdfunding withdraw', async () => {
    await deploy();

    const depositAmount = 2 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10e9, memo: 'deposit' },
      async () => {
        await zkapp.deposit(UInt64.from(depositAmount));
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    local.setBlockchainLength(UInt32.from(endTime + 1));

    tx = await Mina.transaction(
      { sender: deployer, fee: 0.1 * 10e9, memo: 'withdraw' },
      async () => {
        await zkapp.withdraw();
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());

    const amount = zkapp.account.balance.getAndRequireEquals();
    expect(amount.equals(UInt64.from(0)));
  });
});