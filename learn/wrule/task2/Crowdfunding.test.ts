import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding';

let proofsEnabled = false;

interface IUser {
  key: PrivateKey;
  account: Mina.TestPublicKey;
}

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
    
    senderAccount = Local.testAccounts[1].key.toPublicKey();;
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
      await zkApp.initializeCrowdfunding(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    expect(zkApp.startTime.get()).toEqual(startTime);
    expect(zkApp.endTime.get()).toEqual(endTime);
    expect(zkApp.targetAmount.get()).toEqual(targetAmount);
    expect(zkApp.hardCap.get()).toEqual(hardCap);
  });

  it('should allow contribution during funding period', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
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

  it('should not allow contribution before start time', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
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
    }).rejects.toThrow('Crowdfunding not started');
  });

  it('should not allow contribution after end time', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
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
    }).rejects.toThrow('Crowdfunding ended');
  });

  it('should not allow contribution exceeding hard cap', async () => {
    await localDeploy();

    // 初始化众筹
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeCrowdfunding(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
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
    }).rejects.toThrow('Exceeds hard cap');
  });
});