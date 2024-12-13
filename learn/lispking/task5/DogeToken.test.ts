import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { DogeToken } from './DogeToken';

let proofsEnabled = false;

describe('DOGE', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    user1: Mina.TestPublicKey,
    tokenOwnerAddress: PublicKey,
    tokenKey: PrivateKey,
    token: DogeToken,
    Local: any,
    tokenId: Field;

  beforeAll(async () => {
    if (proofsEnabled) await DogeToken.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployerAccount, user1] = Local.testAccounts;
    deployerKey = deployerAccount.key;


    const keypair = PrivateKey.randomKeypair();
    tokenOwnerAddress = keypair.publicKey;
    tokenKey = keypair.privateKey;
    token = new DogeToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount, 2);
      await token.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([tokenKey, deployerKey]).send();
  }

  it('deploy', async () => {
    expect(token.account.balance.get()).toEqual(UInt64.from(0));
  });

  it('transfer', async () => {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await token.transfer(tokenOwnerAddress, user1, UInt64.from(100));
    });
    await txn.prove();
    await txn.sign([deployerKey, tokenKey]).send();

    expect(Mina.getBalance(user1, tokenId)).toEqual(UInt64.from(100));
  });
});
