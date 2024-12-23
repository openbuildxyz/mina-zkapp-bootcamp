import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { Crowedfund, MINA } from './Crowedfund';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type LocalBlockchain = UnwrapPromise<ReturnType<typeof Mina.LocalBlockchain>>;

const balance = (acc: Mina.TestPublicKey | PublicKey) => Mina.getBalance(acc).div(MINA).toJSON();

describe('CrowedFund', () => {
  let Local: LocalBlockchain;
  const receiver = PrivateKey.random();
  const receiverPubKey = receiver.toPublicKey();

  const withdraw = async (amount: number) => {
    const toAcc = PrivateKey.random().toPublicKey();
    const tx = await Mina.transaction(receiverPubKey, async () => {
      AccountUpdate.fundNewAccount(receiverPubKey);
      const acctUpdate = AccountUpdate.createSigned(receiverPubKey);
      acctUpdate.send({ to: toAcc, amount: UInt64.from(amount * MINA) });
    });
    await tx.sign([receiver]).send();
    console.log('receiver balance: %s, to balance: %s', balance(receiverPubKey), balance(toAcc));
  };

  const prepare = async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    const [deployer, pledgee] = Local.testAccounts;
    const zkAppAccount = PrivateKey.random();
    const zkApp = new Crowedfund(zkAppAccount.toPublicKey());

    // 部署
    const deployTx = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.deploy({ goal: UInt64.from(100 * MINA), endAt: UInt32.from(200) });
    });
    await deployTx.prove();
    await deployTx.sign([deployer.key, zkAppAccount]).send();

    // 投资
    const pledgeTx = await Mina.transaction(pledgee, async () => {
      await zkApp.pledge(UInt64.from(100 * MINA));
    });
    await pledgeTx.prove();
    await pledgeTx.sign([pledgee.key]).send();

    Local.setBlockchainLength(UInt32.from(300));
    // 提取
    const claimTx = await Mina.transaction({ sender: deployer, fee: 1 }, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await zkApp.claim(receiverPubKey);
    });
    await claimTx.prove();
    await claimTx.sign([deployer.key, receiver]).send();

    expect(balance(zkAppAccount.toPublicKey())).toEqual('0');
  };

  it('CrowedFund test', async () => {
    await prepare();

    try {
      await withdraw(21);
    } catch (error: any) {
      expect(error.message).toContain('Transaction failed with errors');
    }

    await withdraw(18);
    // 100 - 18 - 1
    expect(balance(receiverPubKey)).toEqual('81');

    // 第一次释放 10 MINA
    Local.incrementGlobalSlot(200);
    try {
      await withdraw(12);
    } catch (error: any) {
      expect(error.message).toContain('Transaction failed with errors');
    }

    await withdraw(10);
    // 81 - 10 - 1
    expect(balance(receiverPubKey)).toEqual('70');

    // 全部释放
    Local.incrementGlobalSlot(1500);
    await withdraw(69);
    expect(balance(receiverPubKey)).toEqual('0');
  });
});
