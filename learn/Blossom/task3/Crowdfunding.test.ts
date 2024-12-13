import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding';

const proofsEnabled = false;

describe('Crowdfunding', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,

    senderAccount: PublicKey,
    senderKey: PrivateKey,

    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Crowdfunding;

  let startTime: UInt64,
    endTime: UInt64,
    targetAmount: Field,
    hardCap: Field;

  beforeAll(async () => {
    if (proofsEnabled) await Crowdfunding.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    deployerAccount = Local.testAccounts[0].key.toPublicKey();
    deployerKey = Local.testAccounts[0].key;

    senderAccount = Local.testAccounts[1].key.toPublicKey();
    senderKey = Local.testAccounts[1].key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Crowdfunding(zkAppAddress);

    // 设置众筹参数
    const currentTime = UInt64.from(Date.now());
    startTime = currentTime.add(UInt64.from(1000));
    endTime = startTime.add(UInt64.from(10000));
    targetAmount = Field(5000);
    hardCap = Field(10000);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('should initialize crowdfunding correctly', async () => {
    await localDeploy();

    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    expect(zkApp.startTime.get()).toEqual(startTime);
    expect(zkApp.endTime.get()).toEqual(endTime);
    expect(zkApp.targetAmount.get()).toEqual(targetAmount);
    expect(zkApp.hardCap.get()).toEqual(hardCap);
  });

  async function initializeAndFundCrowdfunding() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();
  }

  async function expectRejectedContribution(currentTime: UInt64, expectedError: string, amount: Field = Field(1000)) {
    await expect(async () => {
      const txn = await Mina.transaction(senderAccount, async () => {
        zkApp.network.timestamp.requireEquals(currentTime);
        await zkApp.contribute(amount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow(expectedError);
  }

  it('should allow contribution during funding period', async () => {
    await localDeploy();

    await initializeAndFundCrowdfunding();

    const contributionAmount = Field(1000);
    const currentTime = startTime.add(UInt64.from(1000));
    const txn = await Mina.transaction(senderAccount, async () => {
      zkApp.network.timestamp.requireEquals(currentTime);
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    expect(zkApp.currentAmount.get()).toEqual(contributionAmount);
  });

  it('should not allow contribution before start time', async () => {
    await localDeploy();

    await initializeAndFundCrowdfunding();

    await expectRejectedContribution(startTime.sub(UInt64.from(1000)), 'Crowdfunding not started');
  });

  it('should not allow contribution after end time', async () => {
    await localDeploy();

    await initializeAndFundCrowdfunding();

    await expectRejectedContribution(endTime.add(UInt64.from(1000)), 'Crowdfunding ended');
  });

  it('should not allow contribution exceeding hard cap', async () => {
    await localDeploy();

    await initializeAndFundCrowdfunding();

    const excessiveContribution = Field(11000);
    await expectRejectedContribution(startTime.add(UInt64.from(1000)), 'Exceeds hard cap', excessiveContribution);
  });

  it('should refund contributions if target is not met', async () => {
    await localDeploy();

    await initializeAndFundCrowdfunding();

    // 投资
    const contributionAmount = Field(1000);
    let currentTime = startTime.add(UInt64.from(1000));
    let txn = await Mina.transaction(senderAccount, async () => {
      zkApp.network.timestamp.requireEquals(currentTime);
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // 众筹结束后请求退款
    currentTime = endTime.add(UInt64.from(1000));
    txn = await Mina.transaction(senderAccount, async () => {
      zkApp.network.timestamp.requireEquals(currentTime);
      await zkApp.refund();
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    expect(zkApp.currentAmount.get()).toEqual(Field(0));
  });
});
