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

    // 设置众筹参数
    const currentSlot = Mina.getNetworkState().timestamp;
    startTime = currentSlot.add(UInt64.from(1000)); // 开始时间设为当前时间+1000
    endTime = startTime.add(UInt64.from(10000));    // 结束时间设为开始时间+10000
    targetAmount = Field(5000);                      // 目标金额5000
    hardCap = Field(10000);                         // 硬顶10000
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
          endTime,          // 故意将开始时间设为结束时间
          startTime,        // 故意将结束时间设为开始时间
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

    // 设置当前时间为众筹期间
    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 投资
    const contributionAmount = Field(1000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();
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

    // 设置当前时间为开始时间之前
    const currentSlot = startTime.sub(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 尝试投资
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

    // 设置当前时间为结束时间之后
    const currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 尝试投资
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

    // 设置当前时间为众筹期间
    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 尝试投资超过硬顶的金额
    await expect(async () => {
      const contributionAmount = Field(15000); // 大于硬顶10000
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.contribute(contributionAmount);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Exceeds hard cap');
  });

  it('should allow beneficiary to withdraw after successful funding', async () => {
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

    // 设置当前时间为众筹期间
    let currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 投资足够金额
    const contributionAmount = Field(6000); // 大于目标金额5000
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // 设置当前时间为结束时间之后
    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 受益人提款
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();
  });

  it('should not allow withdrawal before end time', async () => {
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

    // 设置当前时间为众筹期间
    const currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 投资足够金额
    const contributionAmount = Field(6000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // 尝试提前提款
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

    // 设置当前时间为众筹期间
    let currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 投资不足金额
    const contributionAmount = Field(4000); // 小于目标金额5000
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // 设置当前时间为结束时间之后
    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 尝试提款
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

    // 设置当前时间为众筹期间
    let currentSlot = startTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 投资足够金额
    const contributionAmount = Field(6000);
    txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.contribute(contributionAmount);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // 设置当前时间为结束时间之后
    currentSlot = endTime.add(UInt64.from(1000));
    await Mina.setTimestamp(currentSlot);

    // 非受益人尝试提款
    await expect(async () => {
      txn = await Mina.transaction(senderAccount, async () => {
        await zkApp.withdraw();
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }).rejects.toThrow('Only beneficiary can withdraw');
  });
});
