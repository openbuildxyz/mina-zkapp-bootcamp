import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Reward } from './reward';

let proofsEnabled = false;

interface IUser {
  key: PrivateKey;
  account: Mina.TestPublicKey;
}

describe('Reward', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    
    senderAccount: PublicKey,
    senderKey: PrivateKey,

    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Reward;

  let startTime: UInt64,
    endTime: UInt64,
    targetAmount: Field,
    hardCap: Field;

  beforeAll(async () => {
    if (proofsEnabled) await Reward.compile();
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
    zkApp = new Reward(zkAppAddress);

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

  it('should initialize Reward correctly', async () => {
    await localDeploy();

    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeReward(
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

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeReward(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    const contributionAmount = Field(1000);
    txn = await Mina.transaction(senderAccount, async () => {
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

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeReward(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        const currentTime = startTime.sub(UInt64.from(1000));
        zkApp.network.timestamp.requireEquals(currentTime);
        
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Reward not started');
  });

  it('should not allow contribution after end time', async () => {
    await localDeploy();

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeReward(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        const currentTime = endTime.add(UInt64.from(1000));
        zkApp.network.timestamp.requireEquals(currentTime);
        
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Reward ended');
  });

  it('should not allow contribution exceeding hard cap', async () => {
    await localDeploy();

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.initializeReward(
        startTime,
        endTime,
        targetAmount,
        hardCap
      );
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

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