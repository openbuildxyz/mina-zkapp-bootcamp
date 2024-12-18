import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './crowd-funding';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe('CrowdFunding', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    sender1: Mina.TestPublicKey,
    sender2: Mina.TestPublicKey,
    withdrawer: Mina.TestPublicKey,
    sender1Key: PrivateKey,
    sender2Key: PrivateKey,
    withdrawerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: CrowdFunding,
    currentSlot: UInt32,
    Local: any,
    zeroAccount: PrivateKey


  beforeAll(async () => {
    if (proofsEnabled) await CrowdFunding.compile();
    zeroAccount = PrivateKey.random();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Local.setBlockchainLength(UInt32.from(0));
    Mina.setActiveInstance(Local);
    currentSlot = Local.getNetworkState().blockchainLength;

    [deployerAccount, sender1, sender2, withdrawer] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    sender1Key = sender1.key;
    sender2Key = sender2.key;
    withdrawerKey = withdrawer.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new CrowdFunding(zkAppAddress);
  });

  async function localDeploy(privileged: PublicKey, hardCap: number, endTime: number) {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy({
        privileged: privileged,
        hardCap: UInt64.from(hardCap),
        endTime: UInt32.from(endTime),
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys CrowdFunding smart contract', async () => {
    await localDeploy(withdrawer, 2e9, 1);
    const balance = zkApp.account.balance.get();
    expect(Number(balance)).toEqual(0);
  });

  it('correctly sender1 fund 1 Mina', async () => {
    await localDeploy(withdrawer, 2e9, 1);

    const senderBalance = Mina.getBalance(sender1);
    // update transaction
    const txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    const updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(1e9);

    expect(Mina.getBalance(sender1)).toEqual(senderBalance.sub(1e9));
  });

  it('correctly sender2 fund 100 Mina but actually sub 1 Mina', async () => {
    await localDeploy(withdrawer, 2e9, 1);

    const senderBalance = Mina.getBalance(sender1);
    // update transaction
    const txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(100 * 1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    const updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(1e9);

    expect(Mina.getBalance(sender1)).toEqual(senderBalance.sub(1e9));
  });

  it('withdrawer withdraw by plan', async () => {
    // pass this test, change hardCap to 2 Mina first
    const randomWithdrawer = PrivateKey.random();
    const randomwithdrawerKey = randomWithdrawer.toPublicKey();
    await localDeploy(randomwithdrawerKey, 2e9, 1);

    const sender1Balance = Mina.getBalance(sender1);
    const sender2Balance = Mina.getBalance(sender2);
    // sender2 fund 1 Mina
    let txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    // sender2 fund 1 Mina
    txn = await Mina.transaction(sender2, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender2Key, zkAppPrivateKey]).send().wait();

    let updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(2 * 1e9);
    expect(Mina.getBalance(sender1)).toEqual(sender1Balance.sub(1e9));
    expect(Mina.getBalance(sender2)).toEqual(sender2Balance.sub(1e9));

    // set blockchainLength
    Local.setBlockchainLength(UInt32.from(1e9));
    Mina.setActiveInstance(Local);

    // withdraw
    txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.withdraw(randomWithdrawer);
    });
    await txn.prove();
    await txn.sign([randomWithdrawer, deployerKey]).send().wait();

    console.log(`\n==== 未达第一个vestingPeriod时,测试转账20%(应成功),balance => 0 ====`);

    await Local.incrementGlobalSlot(1);
    console.log(`currentSlot: ${Local.getNetworkState().globalSlotSinceGenesis}`);

    try {
      const anotherGuyAddr = PrivateKey.random().toPublicKey();
      txn = await Mina.transaction(randomwithdrawerKey, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        const acctUpdate = AccountUpdate.createSigned(randomwithdrawerKey);
        acctUpdate.send({ to: anotherGuyAddr, amount: 2e9 * 0.2 });
      });
      await txn.prove();
      await txn.sign([randomWithdrawer, deployerKey]).send().wait();

      console.log(`transfer successfully!`);
    } catch (error) {
      console.log(`transfer failed!`);
      console.log(error);
      expect(1).toBe(0);
    }

    console.log(`\n==== 未达第一个vestingPeriod时,测试转账1(应失败) ====`);

    await Local.incrementGlobalSlot(0);
    console.log(`currentSlot: ${Local.getNetworkState().globalSlotSinceGenesis}`);

    try {
      const anotherGuyAddr = PrivateKey.random().toPublicKey();
      txn = await Mina.transaction(randomwithdrawerKey, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        const acctUpdate = AccountUpdate.createSigned(randomwithdrawerKey);
        acctUpdate.send({ to: anotherGuyAddr, amount: 1 });
      });
      await txn.prove();
      await txn.sign([randomWithdrawer, deployerKey]).send().wait();

      console.log(`transfer successfully!`);
      expect(1).toBe(0);
    } catch (error) {
      console.log(`transfer failed!`);
      console.log(error);
    }

    console.log(`\n==== 达第一个vestingPeriod后,测试转账2e8 + 1(应失败) ====`);

    await Local.incrementGlobalSlot(200);
    console.log(`currentSlot: ${Local.getNetworkState().globalSlotSinceGenesis}`);

    try {
      const anotherGuyAddr = PrivateKey.random().toPublicKey();
      txn = await Mina.transaction(randomwithdrawerKey, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        const acctUpdate = AccountUpdate.createSigned(randomwithdrawerKey);
        acctUpdate.send({ to: anotherGuyAddr, amount: 2e8 + 1 });
      });
      await txn.prove();
      await txn.sign([randomWithdrawer, deployerKey]).send().wait();

      console.log(`transfer successfully!`);
      expect(1).toBe(0);
    } catch (error) {
      console.log(`transfer failed!`);
      console.log(error);
    }

    console.log(`\n==== 达第一个vestingPeriod后,测试转账2e8(应成功) ====`);

    await Local.incrementGlobalSlot(0);
    console.log(`currentSlot: ${Local.getNetworkState().globalSlotSinceGenesis}`);

    try {
      const anotherGuyAddr = PrivateKey.random().toPublicKey();
      txn = await Mina.transaction(randomwithdrawerKey, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        const acctUpdate = AccountUpdate.createSigned(randomwithdrawerKey);
        acctUpdate.send({ to: anotherGuyAddr, amount: 2e8 });
      });
      await txn.prove();
      await txn.sign([randomWithdrawer, deployerKey]).send().wait();

      console.log(`transfer successfully!`);
    } catch (error) {
      console.log(`transfer failed!`);
      console.log(error);
      expect(1).toBe(0);
    }
  });

  it('error when time is not in range', async () => {
    Local.setBlockchainLength(UInt32.from(100));
    Mina.setActiveInstance(Local);

    await localDeploy(withdrawer, 2e9, 1);
    await expect(
      Mina.transaction(sender1, async () => {
        await zkApp.fund(UInt64.from(1e9));
      })
    ).rejects.toThrow();
  })

  it('error when hardCap is 1 Mina and has received 1 Mina', async () => {
    await localDeploy(withdrawer, 1e9, 1);

    // fund 1 Mina
    let txn = await Mina.transaction(sender1, async () => {
      await zkApp.fund(UInt64.from(1e9));
    });
    await txn.prove();
    await txn.sign([sender1Key, zkAppPrivateKey]).send().wait();

    const updatedBalance = zkApp.account.balance.get();
    expect(Number(updatedBalance)).toEqual(1e9);

    await expect(
      Mina.transaction(sender2, async () => {
        await zkApp.fund(UInt64.from(1e9));
      })
    ).rejects.toThrow();
  })

  it('error when withdrawer is not true withdrawer', async () => {
    await localDeploy(sender1, 2e9, 1);
    await expect(
      Mina.transaction(sender1, async () => {
        await zkApp.withdraw(withdrawerKey);
      })
    ).rejects.toThrow();
  })
});
