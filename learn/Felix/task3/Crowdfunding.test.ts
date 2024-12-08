import {
  Mina,
  UInt64,
  UInt32,
  PrivateKey,
  PublicKey,
  AccountUpdate,
} from 'o1js';

import { Crowdfunding } from './Crowdfunding.js';

let proofsEnabled = false;

describe('Crowdfunding 智能合约测试', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Crowdfunding,
    user1: Mina.TestPublicKey,
    user1Key: PrivateKey,
    user2: Mina.TestPublicKey,
    user2Key: PrivateKey,
    user3: Mina.TestPublicKey,
    user3Key: PrivateKey;

  let Local: any;

  beforeAll(async () => {
    if (proofsEnabled) await Crowdfunding.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployerAccount, user1, user2, user3] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    user1Key = user1.key;
    user2Key = user2.key;
    user3Key = user3.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Crowdfunding(zkAppAddress);

    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy({
        targetAmounts: UInt64.from(100),
        endTime: UInt32.from(100),
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send().wait();
  });

  it('参与众筹', async () => {
    const amount1 = UInt64.from(5);

    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    let txn = await Mina.transaction(user1, async () => {
      await zkApp.fund(amount1);
    });
    await txn.prove();
    await txn.sign([user1Key]).send().wait();

    let forecastBalance = amount1;
    expect(zkApp.account.balance.get()).toEqual(forecastBalance);

    const amount2 = amount1.add(2);
    txn = await Mina.transaction(user2, async () => {
      await zkApp.fund(amount2);
    });
    await txn.prove();
    await txn.sign([user2Key]).send().wait();

    forecastBalance = forecastBalance.add(amount2);
    expect(zkApp.account.balance.get()).toEqual(forecastBalance);

    const amount3 = amount1.add(3);
    txn = await Mina.transaction(user3, async () => {
      await zkApp.fund(amount3);
    });
    await txn.prove();
    await txn.sign([user3Key]).send().wait();

    forecastBalance = forecastBalance.add(amount3);
    expect(zkApp.account.balance.get()).toEqual(forecastBalance);
  });

  it('众筹成功,项目方提款', async () => {
    const amount = UInt64.from(100);

    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    let txn = await Mina.transaction(user1, async () => {
      await zkApp.fund(amount);
    });
    await txn.prove();
    await txn.sign([user1Key, zkAppPrivateKey]).send();

    Local.setBlockchainLength(UInt32.from(110));
    Mina.setActiveInstance(Local);

    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.ownerWithdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
  });
});
