import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  UInt64,
} from 'o1js';
import { MakeMoney } from './MakeMoney';

let proofsEnabled = false;

describe('圈钱机', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: MakeMoney;

  let startTime: UInt64, endTime: UInt64, targetAmount: Field, hardCap: Field;

  beforeAll(async () => {
    if (proofsEnabled) await MakeMoney.compile();
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
    zkApp = new MakeMoney(zkAppAddress);

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

  it('正确的初始化机器', async () => {
    await localDeploy();

    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeMachine(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    expect(zkApp.startTime.get()).toEqual(startTime);
    expect(zkApp.endTime.get()).toEqual(endTime);
    expect(zkApp.targetAmount.get()).toEqual(targetAmount);
    expect(zkApp.hardCap.get()).toEqual(hardCap);
  });

  it('正常流程', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeMachine(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 投资
    const contributionAmount = Field(1000);
    txn = await Mina.transaction(senderAccount, async () => {
      // 设置为众筹期间的时间
      const currentTime = startTime.add(UInt64.from(1000));
      zkApp.network.timestamp.requireEquals(currentTime);

      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    expect(zkApp.currentAmount.get()).toEqual(contributionAmount);
  });

  it('还没开始着什么急', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeMachine(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 尝试在开始时间之前投资
    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        const currentTime = startTime.sub(UInt64.from(1000));
        zkApp.network.timestamp.requireEquals(currentTime);

        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('对味了');
  });

  it('结束后不允许给钱了', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeMachine(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 尝试在结束时间之后投资
    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        const currentTime = endTime.add(UInt64.from(1000));
        zkApp.network.timestamp.requireEquals(currentTime);

        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('对味了');
  });

  it('超过硬顶', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeMachine(startTime, endTime, targetAmount, hardCap);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 尝试投资超过硬顶的金额
    await expect(async () => {
      const contributionAmount = Field(11000);
      txn = await Mina.transaction(senderAccount, async () => {
        const currentTime = startTime.add(UInt64.from(1000));
        zkApp.network.timestamp.requireEquals(currentTime);

        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('对味了');
  });
});
