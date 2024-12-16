import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  UInt64,
} from 'o1js';
import { CatToken } from './CatToken';

let proofsEnabled = false;

describe('Cat', () => {
  let Local: any,
    deployer: Mina.TestPublicKey,
    receiver: Mina.TestPublicKey,
    tokenOwnerAddress: PublicKey,
    tokenKey: PrivateKey,
    token: CatToken,
    tokenId: Field;

  beforeAll(async () => {
    if (proofsEnabled) await CatToken.compile();
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployer, receiver] = Local.testAccounts;

    const keypair = PrivateKey.randomKeypair();
    tokenOwnerAddress = keypair.publicKey;
    tokenKey = keypair.privateKey;
    token = new CatToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer, 2);
      await token.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([tokenKey, deployer.key]).send();
  }

  it('deploy', async () => {
    console.log(token.account.balance.get());
    expect(token.account.balance.get()).toEqual(UInt64.zero);
  });

  it('transfer', async () => {
    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await token.transfer(tokenOwnerAddress, receiver, UInt64.one);
    });
    await txn.prove();
    await txn.sign([tokenKey, deployer.key]).send();

    expect(Mina.getBalance(receiver, tokenId)).toEqual(UInt64.one);
  });
});
