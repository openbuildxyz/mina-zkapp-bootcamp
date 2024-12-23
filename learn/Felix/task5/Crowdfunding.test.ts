import {
  Mina,
  UInt64,
  UInt32,
  PrivateKey,
  PublicKey,
  AccountUpdate,
} from "o1js";

import { Crowdfunding, FundEvent, RefundEvent } from "./Crowdfunding.js";

let proofsEnabled = false;

describe("Crowdfunding 智能合约测试", () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Crowdfunding,
    dappAccount: Mina.TestPublicKey,
    dappKey: PrivateKey,
    accounts: Mina.TestPublicKey[],
    Local: any,
    targetAmounts: UInt64,
    endTime: UInt32;

  beforeAll(async () => {
    if (proofsEnabled) await Crowdfunding.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    accounts = Local.testAccounts;

    deployerAccount = accounts[8];
    dappAccount = accounts[9];

    deployerKey = deployerAccount.key;
    dappKey = dappAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Crowdfunding(zkAppAddress);

    // 目标金额为100
    // 结束时间为区块高度的100
    targetAmounts = UInt64.from(100);
    endTime = UInt32.from(100);

    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy({
        targetAmounts: targetAmounts,
        endTime: endTime,
      });
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send().wait();
  });

  async function insufficientFund() {
    const amounts: UInt64[] = [
      UInt64.from(1),
      UInt64.from(2),
      UInt64.from(3),
      UInt64.from(4),
      UInt64.from(5),
      UInt64.from(6),
      UInt64.from(7),
      UInt64.from(8),
    ];

    let expectedBalance = UInt64.from(0);
    let count = 0;

    for (let amount of amounts) {
      let txn = await Mina.transaction(accounts[count], async () => {
        await zkApp.fund(amount);
      });
      await txn.prove();
      await txn.sign([accounts[count].key]).send().wait();

      expectedBalance = expectedBalance.add(amount);
      expect(zkApp.account.balance.get()).toEqual(expectedBalance);
      count++;
    }
  }

  async function sufficientFund() {
    const amount = UInt64.from(targetAmounts);
    let txn = await Mina.transaction(accounts[1], async () => {
      await zkApp.fund(amount);
    });
    await txn.prove();
    await txn.sign([accounts[1].key]).send().wait();

    expect(zkApp.account.balance.get()).toEqual(amount);
  }

  async function allRefund(events: any[]) {
    for (let e of events) {
      if (e.type === "Funded") {
        const data = e.event.data as unknown as FundEvent;

        const num = data.num;
        const funder = data.funder;
        const amount = data.amount;
        const oldHash = data.oldHash;

        let txn = await Mina.transaction(dappAccount, async () => {
          await zkApp.refund(num, funder, amount, oldHash);
        });
        await txn.prove();
        await txn.sign([dappKey]).send().wait();
      }
    }

    expect(zkApp.account.balance.get()).toEqual(UInt64.zero);
  }

  it("多位户参与众筹", async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    await insufficientFund();
  });

  /*
  it("众筹成功,项目方提款", async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    await sufficientFund();

    Local.setBlockchainLength(endTime);
    Mina.setActiveInstance(Local);

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.ownerWithdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey]).send().wait();

    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
  });
*/

  it.only("众筹成功, 按vesting计划释放资金", async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));

    const testReceiver = accounts[1];

    // 余额清零
    let txn = await Mina.transaction(deployerAccount, async () => {
      const payer = AccountUpdate.createSigned(deployerAccount);
      const balance = Mina.getBalance(deployerAccount);
      payer.send({ to: accounts[2], amount: balance });
    });
    await txn.prove();
    await txn.sign([deployerKey]).send().wait();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(0));

    txn = await Mina.transaction(testReceiver, async () => {
      const payer = AccountUpdate.createSigned(testReceiver);
      const balance = Mina.getBalance(testReceiver);
      payer.send({ to: accounts[2], amount: balance });
    });
    await txn.prove();
    await txn.sign([testReceiver.key]).send().wait();
    expect(Mina.getBalance(testReceiver)).toEqual(UInt64.from(0));

    // 筹款, accounts[0]
    await sufficientFund();

    Local.setBlockchainLength(endTime);
    Mina.setActiveInstance(Local);

    // 提款
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.ownerWithdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();
    expect(Mina.getBalance(deployerAccount)).toEqual(UInt64.from(100));

    const transferAmounts = [20, 10, 10, 10, 10, 10, 10, 10, 10];
    let deployerBalance = 100;
    let receiverBalance = 0;

    for (let i = 0; i < transferAmounts.length; i++) {
      if (i > 0) {
        Local.incrementGlobalSlot(UInt32.from(200));
      }

      const amount = UInt64.from(transferAmounts[i]);
      txn = await Mina.transaction(deployerAccount, async () => {
        const payer = AccountUpdate.createSigned(deployerAccount);
        payer.send({ to: testReceiver, amount });
      });
      await txn.prove();
      (await txn.sign([deployerKey]).send()).wait();

      deployerBalance -= transferAmounts[i];
      receiverBalance += transferAmounts[i];

      expect(Mina.getBalance(deployerAccount)).toEqual(
        UInt64.from(deployerBalance)
      );
      expect(Mina.getBalance(testReceiver)).toEqual(
        UInt64.from(receiverBalance)
      );
    }
  });
  it("众筹失败, 退款", async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    await insufficientFund();

    Local.setBlockchainLength(UInt32.from(110));
    Mina.setActiveInstance(Local);

    let events = await zkApp.fetchEvents();
    await allRefund(events);

    events = await zkApp.fetchEvents();
    let count = 8;
    for (let e of events) {
      if (e.type === "Refunded") {
        const data = e.event.data as unknown as RefundEvent;
        const receiver = data.receiver.x.toString;
        const expectedReceiver = accounts[count].x.toString;
        expect(receiver).toEqual(expectedReceiver);
        count--;
      }
    }
  });

  it("众筹成功,调用退款失败", async () => {
    expect(zkApp.account.balance.get()).toEqual(UInt64.from(0));
    await sufficientFund();

    Local.setBlockchainLength(endTime);
    Mina.setActiveInstance(Local);

    let events = await zkApp.fetchEvents();
    expect(allRefund(events)).rejects.toThrow("众筹成功, 无需退款");
  });
});
