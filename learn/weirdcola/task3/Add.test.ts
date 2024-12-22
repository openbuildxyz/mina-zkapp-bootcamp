import { Mina, PrivateKey, UInt64, UInt32, AccountUpdate, PublicKey } from 'o1js';
import { Funding } from './Add.js'; // 替换为你的合约路径

describe('Funding Contract Tests', () => {
  let Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>,
    deployerKey: PrivateKey,
    deployerPublicKey: PublicKey,
    senderKey: PrivateKey,
    senderPublicKey: PublicKey,
    beneficiaryKey: PrivateKey,
    beneficiaryPublicKey: PublicKey,
    zkAppKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppInstance: Funding,
    initialDeployerBalance: UInt64,
    initialSenderBalance: UInt64,
    hardCap: UInt64,
    deadline: UInt64,
    currentBlock: UInt32;

  beforeAll(async () => {
    const useProof = false;
    Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);


    deployerKey = Local.testAccounts[0].key;
    deployerPublicKey = Local.testAccounts[0].key.toPublicKey();

    senderKey = Local.testAccounts[1].key;
    senderPublicKey = Local.testAccounts[1].key.toPublicKey();

    beneficiaryKey = PrivateKey.random();
    beneficiaryPublicKey = beneficiaryKey.toPublicKey();

    zkAppKey = PrivateKey.random();
    zkAppAddress = zkAppKey.toPublicKey();
    zkAppInstance = new Funding(zkAppAddress);

    hardCap = UInt64.from(100 * 1e9); // 100 MINA
    currentBlock = Local.getNetworkState().blockchainLength;
    deadline = UInt64.from(currentBlock.add(10)); // 当前块高度 + 10

    initialDeployerBalance = Mina.getBalance(deployerPublicKey);
    initialSenderBalance = Mina.getBalance(senderPublicKey);

    const deployTxn = await Mina.transaction(deployerPublicKey, async () => {
      AccountUpdate.fundNewAccount(deployerPublicKey);
      await zkAppInstance.deploy();
      await zkAppInstance.initFunding(hardCap, deadline, beneficiaryPublicKey);
    });
    await deployTxn.prove();
    await deployTxn.sign([deployerKey, zkAppKey]).send();
  });

  test('Initial state of the contract', () => {
    expect(zkAppInstance.totalRaised.get().toString()).toBe(UInt64.zero.toString());
    expect(zkAppInstance.hardCap.get().toString()).toBe(hardCap.toString());
    expect(zkAppInstance.deadline.get().toString()).toBe(deadline.toString());
    expect(zkAppInstance.beneficiary.get().toBase58()).toBe(beneficiaryKey.toPublicKey().toBase58());
  });

  test('Contribute funds within the limit', async () => {
    const amount = UInt64.from(10 * 1e9); // 10 MINA
    const contributeTxn = await Mina.transaction(senderPublicKey, async () => {
      await zkAppInstance.contribute(amount, senderPublicKey);
    });
    await contributeTxn.prove();
    await contributeTxn.sign([senderKey]).send();

    expect(zkAppInstance.totalRaised.get().toString()).toBe(amount.toString());
    const contractBalance = Mina.getBalance(zkAppAddress);
    expect(contractBalance.toString()).toBe(amount.toString());
  });

  test('Contribute funds to reach the hard cap', async () => {
    const amount90 = UInt64.from(90 * 1e9); // 90 MINA
    const contributeTxn = await Mina.transaction(senderPublicKey, async () => {
      await zkAppInstance.contribute(amount90, senderPublicKey);
    });
    await contributeTxn.prove();
    await contributeTxn.sign([senderKey]).send();

    expect(zkAppInstance.totalRaised.get().toString()).toBe(hardCap.toString());
    const contractBalance = Mina.getBalance(zkAppAddress);
    expect(contractBalance.toString()).toBe(hardCap.toString());
  });

  test('Fail to contribute beyond hard cap', async () => {
    const amount = UInt64.from(10 * 1e9); // 10 MINA
    await expect(
      Mina.transaction(senderPublicKey, async () => {
        await zkAppInstance.contribute(amount, senderPublicKey);
      })
    ).rejects.toThrow('Exceeds hard cap');
  });

  test('Fail to withdraw before the deadline', async () => {
    await expect(
      Mina.transaction(senderPublicKey, async () => {
        await zkAppInstance.withdraw(senderPublicKey);
      })
    ).rejects.toThrow('Crowdfunding is still active');
  });

  test('Withdraw funds after the deadline', async () => {
    // 模拟区块高度超过 deadline
 
    await Local.setBlockchainLength(UInt32.from(1001));

    const withdrawTxn = await Mina.transaction(senderPublicKey, async () => {
      AccountUpdate.fundNewAccount(senderPublicKey);
      await zkAppInstance.withdraw(beneficiaryPublicKey);
    });
    await withdrawTxn.prove();
    await withdrawTxn.sign([senderKey]).send();

    const contractBalance = Mina.getBalance(zkAppAddress);
    expect(contractBalance.toString()).toBe(UInt64.zero.toString());

    const beneficiaryBalance = Mina.getBalance(beneficiaryKey.toPublicKey());
    expect(beneficiaryBalance.toString()).toBe(hardCap.toString());
  }
);
});
