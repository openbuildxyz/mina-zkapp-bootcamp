import {
  Mina,
  AccountUpdate,
  UInt32,
  UInt64,
  Field,
  PublicKey,
  PrivateKey,
} from 'o1js';
import { FundingContract } from './fundingContract';
import { PotatoToken } from './PotatoToken';

describe('Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
    zkapp: FundingContract,
    hardCap: number,
    endTime: number,
    UNIT: number,
    tokenId: Field,
    tokenAddress: PublicKey,
    tokenKey: PrivateKey,
    tokenOwnerZkapp: PotatoToken;

  beforeAll(async () => {
    UNIT = 1e9;
    hardCap = 20 * UNIT;
    endTime = 3;
    await FundingContract.compile();
    await PotatoToken.compile();
  });

  beforeEach(async () => {
    local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(local);
    local.setBlockchainLength(UInt32.from(1));

    tokenKey = PrivateKey.random();
    tokenAddress = tokenKey.toPublicKey();
    tokenOwnerZkapp = new PotatoToken(tokenAddress);
    tokenId = tokenOwnerZkapp.deriveTokenId();

    [deployer, sender] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();

    zkapp = new FundingContract(zkappAccount, tokenId);

    let deployTx = await Mina.transaction(sender, async () => {
      AccountUpdate.fundNewAccount(sender, 2);
      await tokenOwnerZkapp.deploy();
    });
    await deployTx.prove();
    await deployTx.sign([tokenKey, sender.key]).send();

    let tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 0.1 * UNIT,
        memo: 'deploy',
      },
      async () => {
        AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: deployer,
        });
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self);
      }
    );
    await tx.prove();
    await tx.sign([deployer.key, zkappAccount.key]).send();

    const transferAmount = UInt64.from(20 * UNIT);
    tx = await Mina.transaction(sender, async () => {
      AccountUpdate.fundNewAccount(sender, 1);
      await tokenOwnerZkapp.transfer(tokenAddress, sender, transferAmount);
    });
    await tx.prove();
    await tx.sign([tokenKey, sender.key]).send();
  });

  it('should deposit sucessfully', async () => {
    const amount1 = Mina.getBalance(zkappAccount, tokenId);
    console.log('amount1:', amount1.div(UNIT).toBigInt());

    const depositNum = 2 * UNIT;
    const tx = await Mina.transaction(
      { sender, fee: 0.1 * UNIT, memo: 'deposit' },
      async () => {
        AccountUpdate.fundNewAccount(sender);
        await zkapp.deposit(UInt64.from(depositNum));
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self);
      }
    );

    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log('amount2:', amount1.div(UNIT).toBigInt());

    const amount = Mina.getBalance(zkappAccount, tokenId);
    expect(amount.equals(UInt64.from(depositNum)));
  });

  it('should withdraw sucessfully', async () => {
    const depositTX = await Mina.transaction(
      { sender, fee: 1 * UNIT },
      async () => {
        AccountUpdate.fundNewAccount(sender, 1);
        await zkapp.deposit(UInt64.from(3 * UNIT));
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self);
      }
    );
    await depositTX.prove();
    await depositTX.sign([sender.key]).send();

    local.setBlockchainLength(UInt32.from(endTime + 1));

    let tx = await Mina.transaction(
      { sender: deployer, fee: 1 * UNIT },
      async () => {
        AccountUpdate.fundNewAccount(deployer, 1);
        await zkapp.withdraw();
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self);
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();

    const amount = Mina.getBalance(zkappAccount, tokenId);
    expect(amount.equals(UInt64.from(0)));
  });
});
