import {
  Field,
  UInt32,
  UInt64,
  PublicKey,
  PrivateKey,
  Mina,
  AccountUpdate,
} from 'o1js';
import { EscaToken } from './EscaToken';
import { Funding } from './FundingContract';

let proofsEnabled = false;

const DECIMALS = 1e9;
const price = UInt64.from(DECIMALS);
const hardCap = UInt64.from(100).mul(DECIMALS);

describe('EscaToken Trade', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    user: Mina.TestPublicKey,
    userKey: PrivateKey,
    fundingAddress: PublicKey,
    fundingKey: PrivateKey,
    funding: Funding,
    tokenOwnerAddress: PublicKey,
    tokenKey: PrivateKey,
    token: EscaToken,
    tokenId: Field,
    Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>;

  beforeAll(async () => {
    if (proofsEnabled) {
      await EscaToken.compile();
      await Funding.compile();
    }
  });

  beforeEach(async () => {
    // setup local blockchain
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    // test config
    [deployerAccount, user] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    userKey = user.key;

    let tokenKeyPair = PrivateKey.randomKeypair();
    tokenOwnerAddress = tokenKeyPair.publicKey;
    tokenKey = tokenKeyPair.privateKey;
    token = new EscaToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    let fundingKeyPair = PrivateKey.randomKeypair();
    fundingAddress = fundingKeyPair.publicKey;
    fundingKey = fundingKeyPair.privateKey;
    funding = new Funding(fundingAddress, tokenId);

    await localDeploy();
  });

  async function localDeploy() {
    const tokenTx = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount, 2);
      await token.deploy();
    });
    await tokenTx.prove();
    await tokenTx.sign([tokenKey, deployerKey]).send();

    const fundingTx = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await funding.deploy({
        hardCap,
        endTime: UInt32.from(1000),
        price,
      });
      await token.approveAccountUpdate(funding.self);
    });
    await fundingTx.prove();
    await fundingTx.sign([fundingKey, deployerKey]).send();
  }

  it('contract deployed', async () => {
    expect(funding.hardCap.get()).toEqual(hardCap);
    expect(funding.endTime.get()).toEqual(UInt32.from(1000));
    expect(funding.price.get()).toEqual(price);
    expect(funding.account.balance.get()).toEqual(UInt64.from(0));
  });

  it('trade', async () => {
    // transfer token
    let transferTx = await Mina.transaction(deployerAccount, async () => {
      await token.transfer(
        tokenOwnerAddress,
        fundingAddress,
        funding.hardCap.get()
      );
    });
    await transferTx.prove();
    await transferTx.sign([tokenKey, deployerKey]).send();
    expect(Mina.getBalance(fundingAddress, tokenId)).toEqual(
      funding.hardCap.get()
    );

    // trade
    const userBeforeBalance = Mina.getBalance(user);
    let tradeTx = await Mina.transaction(user, async () => {
      AccountUpdate.fundNewAccount(user, 2);
      await funding.trade(UInt64.from(DECIMALS));
      await token.approveAccountUpdate(funding.self);
    });
    await tradeTx.prove();
    await tradeTx.sign([userKey, fundingKey]).send().wait();
    expect(Mina.getBalance(user, tokenId)).toEqual(UInt64.from(DECIMALS));
  });
});
