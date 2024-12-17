import {
  Field,
  Mina,
  AccountUpdate,
  PublicKey,
  PrivateKey,
  UInt32,
  UInt64,
} from 'o1js';
import { CrowdfundingZkapp } from './crowdfunding-zkapp.js';
import { AbcTokenContract } from './token-contract.js';

describe('Token Crowdfunding Local Net', () => {
  let local: any,
    deployer: Mina.TestPublicKey,
    sender: Mina.TestPublicKey,
    zkappAccount: Mina.TestPublicKey,
    zkapp: CrowdfundingZkapp,
    hardCap: number,
    endTime: number,
    tokenAddress: PublicKey,
    tokenKey: PrivateKey,
    tokenId: Field,
    tokenOwnerZkapp: AbcTokenContract;

  beforeAll(async () => {
    hardCap = 10 * 10 ** 9;
    endTime = 3;
    await CrowdfundingZkapp.compile();
    await AbcTokenContract.compile();
  });

  beforeEach(async () => {
    local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(local);
    local.setBlockchainLength(UInt32.from(1));

    tokenKey = PrivateKey.random();
    tokenAddress = tokenKey.toPublicKey();
    tokenOwnerZkapp = new AbcTokenContract(tokenAddress);
    tokenId = tokenOwnerZkapp.deriveTokenId();

    [deployer, sender] = local.testAccounts;
    zkappAccount = Mina.TestPublicKey.random();
    zkapp = new CrowdfundingZkapp(zkappAccount, tokenId);
  });

  async function deploy() {
    let deployTx = await Mina.transaction(sender, async () => {
      AccountUpdate.fundNewAccount(sender, 2);
      await tokenOwnerZkapp.deploy();
    });
    await deployTx.prove();
    await deployTx.sign([tokenKey, sender.key]).send();

    console.log(hardCap, endTime);
    let tx = await Mina.transaction(
      {
        sender: deployer,
        fee: 0.1 * 10e9,
        memo: 'deploy',
      },
      async () => {
        AccountUpdate.fundNewAccount(deployer); // 需要为新账户创建而花费1MINA
        await zkapp.deploy({
          endTime: UInt32.from(endTime),
          hardCap: UInt64.from(hardCap),
          withdrawer: deployer,
        });
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
      }
    );
    await tx.prove();
    await tx.sign([deployer.key, zkappAccount.key]).send();
    console.log(tx.toPretty());

    // sender 获取 abc token
    console.log('sender get abc token ...');
    const transferAmount = UInt64.from(10 * 10 ** 9);
    tx = await Mina.transaction(sender, async () => {
      AccountUpdate.fundNewAccount(sender, 1);
      await tokenOwnerZkapp.transfer(tokenAddress, sender, transferAmount);
    });
    await tx.prove();
    await tx.sign([tokenKey, sender.key]).send();
    console.log(`token bal: ` + Mina.getBalance(sender, tokenId));
  }

  it('token crowdfunding deposit', async () => {
    await deploy();

    const depositAmount = 3 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10e9, memo: 'deposit' },
      async () => {
        AccountUpdate.fundNewAccount(sender, 1);
        await zkapp.deposit(UInt64.from(depositAmount));
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    const amount = Mina.getBalance(zkappAccount, tokenId);
    expect(amount.equals(UInt64.from(depositAmount)));
  });

  it('token crowdfunding withdraw', async () => {
    await deploy();

    const depositAmount = 3 * 10 ** 9;
    let tx = await Mina.transaction(
      { sender, fee: 0.1 * 10e9, memo: 'deposit' },
      async () => {
        AccountUpdate.fundNewAccount(sender, 1);
        await zkapp.deposit(UInt64.from(depositAmount));
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
      }
    );
    await tx.prove();
    await tx.sign([sender.key]).send();
    console.log(tx.toPretty());

    local.setBlockchainLength(UInt32.from(endTime + 1));

    tx = await Mina.transaction(
      { sender: deployer, fee: 0.1 * 10e9, memo: 'withdraw' },
      async () => {
        AccountUpdate.fundNewAccount(deployer, 1);
        await zkapp.withdraw();
        await tokenOwnerZkapp.approveAccountUpdate(zkapp.self); // 底层调用了approveBase(*)
      }
    );
    await tx.prove();
    await tx.sign([deployer.key]).send();
    console.log(tx.toPretty());

    const amount = Mina.getBalance(zkappAccount, tokenId);
    expect(amount.equals(UInt64.from(0)));
  });
});
