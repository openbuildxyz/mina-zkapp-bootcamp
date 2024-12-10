import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding';

let proofsEnabled = false;

describe('Crowdfunding', () => {
  let deployerAccount: Mina.PrivateKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.PrivateKey,
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
    
    deployerAccount = Local.testAccounts[0].privateKey;
    deployerKey = deployerAccount;
    
    senderAccount = Local.testAccounts[1].privateKey;
    senderKey = senderAccount;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Crowdfunding(zkAppAddress);

    const currentSlot = Mina.getNetworkState().timestamp;
    startTime = currentSlot.add(UInt64.from(1000)); 
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

  it('should deploy and initialize crowdfunding', async () => {
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
  });

  it('should not allow non-beneficiary to initialize', async () => {
    await localDeploy();

    await expect(async () => {
      const txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.initializeCrowdfunding(
          startTime,
          endTime,
          targetAmount,
          hardCap
        );
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Only beneficiary can initialize');
  });

  it('should not allow invalid time settings', async () => {
    await localDeploy();

    await expect(async () => {
      const txn = await Mina.transaction(deployerAccount, async () => {
        await zkApp.initializeCrowdfunding(
          endTime,         
          startTime,       
          targetAmount,
          hardCap
        );
      });
      await txn.prove();
      await txn.sign([deployerKey]).send();
    }).rejects.toThrow('Start time must be before end time');
  });

  it('should allow contribution during funding period', async () => {
    await localDeploy();

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

    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    const contributionAmount = Field(1000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();
  });

  it('should not allow contribution before start time', async () => {
    await localDeploy();

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

    const currentSlot = startTime.sub(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Crowdfunding not started');
  });

  it('should not allow contribution after end time', async () => {
    await localDeploy();

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

    const currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    await expect(async () => {
      const contributionAmount = Field(1000);
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Crowdfunding ended');
  });

  it('should not allow contribution exceeding hard cap', async () => {
    await localDeploy();

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

    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    await expect(async () => {
      const contributionAmount = Field(15000); 
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Exceeds hard cap');
  });

  it('should allow beneficiary to withdraw after successful funding', async () => {
    await localDeploy();

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

    let currentSlot = startTime.add(UInt64.from(1000));


    const contributionAmount = Field(6000); 
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();
  });

  it('should not allow withdrawal before end time', async () => {
    await localDeploy();

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

    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    const contributionAmount = Field(6000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    await expect(async () => {
      txn = await Mina.transaction(deployerAccount, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([deployerKey]).send();
    }).rejects.toThrow('Crowdfunding not ended');
  });

  it('should not allow withdrawal if target not reached', async () => {
    await localDeploy();

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

    let currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);


    const contributionAmount = Field(4000); 
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    await expect(async () => {
      txn = await Mina.transaction(deployerAccount, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([deployerKey]).send();
    }).rejects.toThrow('Target amount not reached');
  });

  it('should not allow non-beneficiary to withdraw', async () => {
    await localDeploy();

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

    let currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    const contributionAmount = Field(6000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    await expect(async () => {
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Only beneficiary can withdraw');
  });
});
