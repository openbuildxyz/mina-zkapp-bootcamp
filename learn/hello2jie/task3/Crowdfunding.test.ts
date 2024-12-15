import { Crowdfunding } from './Crowdfunding';
import {
  AccountUpdate,
  Mina,
  PrivateKey,
  PublicKey,
  UInt64,
  fetchAccount,
} from 'o1js';

describe('Crowdfunding', () => {
  let deployerKey: PrivateKey,
    deployer: Mina.TestPublicKey,
    beneficiaryKey: PrivateKey,
    beneficiary: Mina.TestPublicKey,
    contributorKey: PrivateKey,
    contributor: Mina.TestPublicKey,
    zkApp: Crowdfunding,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey;


  beforeEach(async () => {
    const proofsEnabled = false;
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
		Mina.setActiveInstance(Local);
    [deployer, beneficiary, contributor] = Local.testAccounts;
    deployerKey = deployer.key;
    beneficiaryKey = beneficiary.key;
    contributorKey = contributor.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
     

    zkApp = new Crowdfunding(zkAppAddress);

    const txn = await Mina.transaction({
      sender: deployer,
      fee: 0.5 * 10e9
    }, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  });

  it('should initialize with correct parameters', async () => {
    const targetAmount = UInt64.from(10);
    const duration = UInt64.from(100);

    const txn = await Mina.transaction(deployer, async () => {
      zkApp.setup(beneficiary, targetAmount, duration);
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const target = zkApp.targetAmount.get();
    expect(target).toEqual(targetAmount);
  });

  it('should allow contributions before deadline', async () => {
    // 设置众筹参数
    const targetAmount = UInt64.from(10);
    const duration = UInt64.from(100);
    let txn = await Mina.transaction(deployer, async () => {
      zkApp.setup(beneficiary, targetAmount, duration);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 进行投资
    const contribution = UInt64.from(5);
    txn = await Mina.transaction(contributor, async () => {
      zkApp.contribute(contribution);
    });
    await txn.prove();
    await txn.sign([contributorKey]).send();

    const totalRaised = zkApp.totalRaised.get();
    expect(totalRaised).toEqual(contribution);
  });

  it('should allow beneficiary to withdraw after deadline', async () => {
    // 设置众筹参数
    const targetAmount = UInt64.from(10);
    const duration = UInt64.from(0); // 立即截止
    let txn = await Mina.transaction(deployer, async () => {
      zkApp.setup(beneficiary, targetAmount, duration);
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    // 执行提现
      txn = await Mina.transaction(beneficiary, async () => {
      zkApp.withdraw();
    });
    await txn.prove();
    await txn.sign([beneficiaryKey, zkAppPrivateKey]).send();
  });
});
