import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  UInt32,
  UInt64,
} from 'o1js';
import { CrowdFunding } from './CrowdFunding';
import { CatToken } from './CatToken';

let proofsEnabled = false;

describe('Cat', () => {
  let Local: any,
    deployer: Mina.TestPublicKey,
    buyer: Mina.TestPublicKey,
    crowdFundingAddress: PublicKey,
    crowdFundingKey: PrivateKey,
    crowdFunding: CrowdFunding,
    tokenOwnerAddress: PublicKey,
    tokenOwnerKey: PrivateKey,
    token: CatToken,
    tokenId: Field;

  beforeAll(async () => {
    if (proofsEnabled) {
      await CrowdFunding.compile();
      await CatToken.compile();
    }
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployer, buyer] = Local.testAccounts;

    const keypair = PrivateKey.randomKeypair();
    tokenOwnerAddress = keypair.publicKey;
    tokenOwnerKey = keypair.privateKey;
    token = new CatToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    crowdFundingKey = PrivateKey.random();
    crowdFundingAddress = crowdFundingKey.toPublicKey();
    crowdFunding = new CrowdFunding(crowdFundingAddress, tokenId);

    await localDeploy();
  });

  async function localDeploy() {
    // deploy token
    let txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer, 2);
      await token.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([tokenOwnerKey, deployer.key]).send();

    // deploy crowdFunding
    txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await crowdFunding.deploy({
        endTime: UInt32.from(100),
        hardCap: UInt64.from(100 * 1e9),
        pricePerToken: UInt64.from(2 * 1e9), // 2 MINA/token
      });
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([crowdFundingKey, deployer.key]).send();
  }

  it('deploy', async () => {
    expect(crowdFunding.account.balance.get()).toEqual(UInt64.from(0));
  });

  it('buy', async () => {
    const transferAmt = new UInt64(100);
    const txn = await Mina.transaction(deployer, async () => {
      await token.transfer(tokenOwnerAddress, crowdFundingAddress, transferAmt);
    });
    await txn.prove();
    await txn.sign([tokenOwnerKey, deployer.key]).send();

    expect(Mina.getBalance(crowdFundingAddress, tokenId)).toEqual(transferAmt);

    const beforeBalance = Mina.getBalance(buyer);
    console.log('before buyer mina balance', beforeBalance.toString());

    // 模拟购买代币
    const amountToBuy = UInt64.from(50 * 1e9); // 购买 50 MINA 的代币
    let tx = await Mina.transaction(buyer, async () => {
      AccountUpdate.fundNewAccount(buyer, 2);
      await crowdFunding.buyTokens(amountToBuy);
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await tx.prove();
    await tx.sign([buyer.key, crowdFundingKey]).send().wait();

    // 验证购买后的余额
    console.log(
      `final balance: ${Mina.getBalance(
        crowdFundingAddress,
        tokenId
      ).toString()}`
    );
    console.log(
      `final balance of buyer: ${Mina.getBalance(buyer, tokenId).toString()}`
    );
    expect(Mina.getBalance(crowdFundingAddress, tokenId)).toEqual(
      UInt64.from(75)
    );
    expect(Mina.getBalance(buyer, tokenId)).toEqual(UInt64.from(25));
  });
});
