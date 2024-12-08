import {
  Mina,
  AccountUpdate,
  UInt32,
  UInt64,
  fetchAccount,
  PrivateKey,
  PublicKey,
} from 'o1js';
import { FundingContract } from './fundingContract';

describe('DEV Net', () => {
  let local: any,
    sender: PublicKey,
    senderKey: PrivateKey,
    zkappAccount: PublicKey,
    zkapp: FundingContract,
    hardCap: number,
    endTime: UInt32,
    UNIT: number;
  beforeEach(async () => {
    UNIT = 1e9;
    hardCap = 20 * UNIT;
    let network = Mina.Network({
      mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
      archive: 'https://api.minascan.io/archive/devnet/v1/graphql/',
    });

    Mina.setActiveInstance(network);
    senderKey = PrivateKey.fromBase58(
      ''
    );
    sender = senderKey.toPublicKey();
    console.log(`Fetching the fee payer account information.`);
    const senderAcct = await fetchAccount({ publicKey: sender });
    const accountDetails = senderAcct.account;
    
    await FundingContract.compile();

    const zkappKey = PrivateKey.random();
    zkappAccount = zkappKey.toPublicKey();
    zkapp = new FundingContract(zkappAccount);

    // console.log(hardCap, endTime);
    const tx = await Mina.transaction(
      {
        sender,
        fee: 0.2 * UNIT,
        memo: 'deploy',
      },
      async () => {
        endTime = network.getNetworkState().globalSlotSinceGenesis.add(30);

        AccountUpdate.fundNewAccount(sender); // 需要为新账户创建而花费1MINA
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: sender,
        });
      }
    );
    await tx.prove();
    await tx.sign([senderKey, zkappKey]).send().wait();
  });

  it('should deploy sucessfully', async () => {
    await fetchAccount({ publicKey: zkappAccount });
    const getHardCap = zkapp.hardCap.get();
    const getEndTime = zkapp.endTime.get();

    expect(getHardCap).toEqual(UInt64.from(hardCap));
    expect(getEndTime).toEqual(UInt32.from(endTime));
  });

  it('should deposit sucessfully', async () => {
    await fetchAccount({ publicKey: zkappAccount });
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(
      { sender, fee: 1 * UNIT, memo: 'deposit' },
      async () => {
        await zkapp.deposit(UInt64.from(1 * UNIT));
      }
    );

    await tx.prove();
    await tx.sign([senderKey]).send().wait();
    expect(zkapp.balance).toEqual(UInt64.from(1 * UNIT));
  });

  it('should not exceed hardcap', async () => {
    await fetchAccount({ publicKey: zkappAccount });
    await fetchAccount({ publicKey: sender });
    const tx = await Mina.transaction(sender, async () => {
      await zkapp.deposit(UInt64.from(20 * UNIT));
    });

    await tx.prove();
    await tx.sign([senderKey]).send().wait();
    expect(zkapp.balance).toEqual(UInt64.from(hardCap));
  });

  it('should withdraw sucessfully', async () => {
    await fetchAccount({ publicKey: zkappAccount });
    await fetchAccount({ publicKey: sender });
    const depositTX = await Mina.transaction(sender, async () => {
      await zkapp.deposit(UInt64.from(UInt64.from(20 * UNIT)));
    });
    await depositTX.prove();
    await depositTX.sign([senderKey]).send().wait();

    const tx = await Mina.transaction({ sender, fee: 1 * UNIT }, async () => {
      await zkapp.withdraw();
    });
    await tx.prove();
    await tx.sign([senderKey]).send().wait();

    expect(zkapp.balance).toEqual(0);
  });
});
