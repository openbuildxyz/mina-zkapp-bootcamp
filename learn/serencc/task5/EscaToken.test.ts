import {
  Field,
  UInt64,
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
} from 'o1js';
import { EscaToken } from './EscaToken';

let proofEnabled = false;

describe('EscaToken', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    user: Mina.TestPublicKey,
    tokenOwnerAddress: PublicKey,
    tokenKey: PrivateKey,
    tokenId: Field,
    token: EscaToken,
    Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>;

  beforeAll(async () => {
    if (proofEnabled) await EscaToken.compile();
  });

  beforeEach(async () => {
    // setup local blockchain
    Local = await Mina.LocalBlockchain({ proofsEnabled: proofEnabled });
    Mina.setActiveInstance(Local);

    // test config
    [deployerAccount, user] = Local.testAccounts;
    deployerKey = deployerAccount.key;

    let tokenKeyPair = PrivateKey.randomKeypair();
    tokenOwnerAddress = tokenKeyPair.publicKey;
    tokenKey = tokenKeyPair.privateKey;
    token = new EscaToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    await localDeploy();
  });

  async function localDeploy() {
    const deployTx = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount, 2);
      await token.deploy();
    });
    await deployTx.prove();
    await deployTx.sign([tokenKey, deployerKey]).send();
  }

  it('token contract deployed', async () => {
    expect(
      Mina.getAccount(tokenOwnerAddress).zkapp?.verificationKey !== undefined
    );
  });

  it('transfer', async () => {
    let transferTx = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await token.transfer(tokenOwnerAddress, user, UInt64.from(20));
    });
    await transferTx.prove();
    await transferTx.sign([deployerKey, tokenKey]).send();

    expect(Mina.getBalance(user, tokenId)).toEqual(UInt64.from(20));
  });
});
