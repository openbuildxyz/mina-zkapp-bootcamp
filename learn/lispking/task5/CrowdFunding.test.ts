import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './CrowdFunding';
import { DogeToken } from './DogeToken';

let proofsEnabled = false;

const DECIMALS = 1e9;
const MINA = UInt64.from(1e9);
const fixedPrice = UInt64.from(DECIMALS);
const hardCap = UInt64.from(10).mul(DECIMALS);

describe('CrowdFunding', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    user1: Mina.TestPublicKey,
    user1Key: PrivateKey,

    crowdFundingAddress: PublicKey,
    crowdFundingKey: PrivateKey,
    crowdFunding: CrowdFunding,

    tokenOwnerAddress: PublicKey,
    tokenOwnerKey: PrivateKey,
    token: DogeToken,
    tokenId: Field,

    Local: any;

  beforeAll(async () => {
    if (proofsEnabled) {
      await CrowdFunding.compile();
      await DogeToken.compile();
    }
  });

  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployerAccount, user1] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    user1Key = user1.key;

    tokenOwnerKey = PrivateKey.random();
    tokenOwnerAddress = tokenOwnerKey.toPublicKey();
    token = new DogeToken(tokenOwnerAddress);
    tokenId = token.deriveTokenId();

    crowdFundingKey = PrivateKey.random();
    crowdFundingAddress = crowdFundingKey.toPublicKey();
    crowdFunding = new CrowdFunding(crowdFundingAddress, tokenId);

    await localDeploy();
  });

  async function localDeploy() {
    let txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount, 2);
      await token.deploy();
    });
    await txn.prove();
    await txn.sign([tokenOwnerKey, deployerKey]).send();

    txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await crowdFunding.deploy({
        deadline: UInt32.from(100),
        hardCap,
        fixedPrice,
      });
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([crowdFundingKey, deployerKey]).send();
  }

  async function transferToken() {
    const transferAmount = crowdFunding.getHardCap();
    const txn = await Mina.transaction(deployerAccount, async () => {
      await token.transfer(tokenOwnerAddress, crowdFundingAddress, transferAmount);
    });
    await txn.prove();
    await txn.sign([tokenOwnerKey, deployerKey]).send();
    expect(Mina.getBalance(crowdFundingAddress, tokenId)).toEqual(transferAmount);
  }

  it('deploy', async () => {
    expect(crowdFunding.account.balance.get()).toEqual(UInt64.from(0));
    expect(crowdFunding.getDeadline()).toEqual(UInt32.from(100));
    expect(crowdFunding.getHardCap()).toEqual(hardCap);
    expect(crowdFunding.getFixedPrice()).toEqual(fixedPrice);
    expect(crowdFunding.getInvestor()).toEqual(deployerKey.toPublicKey());
  });

  it('contribute success', async () => {
    await transferToken();

    const beforeBalance = Mina.getBalance(user1);
    console.log('before user1 mina balance', beforeBalance.toString());
    let txn = await Mina.transaction(user1, async () => {
      AccountUpdate.fundNewAccount(user1, 2);
      await crowdFunding.contribute();
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([user1Key, crowdFundingKey]).send().wait();
    expect(crowdFunding.getBalance()).toEqual(MINA);
    expect(Mina.getBalance(user1, tokenId)).toEqual(fixedPrice);
    expect(crowdFunding.getSoldAmount().toString()).toEqual(fixedPrice.toString());

    const afterBalance = Mina.getBalance(user1);
    console.log('after user1 mina balance', afterBalance.toString(), beforeBalance.sub(afterBalance).toString());
    expect(beforeBalance.sub(afterBalance).sub(UInt64.from(2).mul(DECIMALS))).toEqual(fixedPrice);

    txn = await Mina.transaction(user1, async () => {
      await crowdFunding.contribute();
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([user1Key, crowdFundingKey]).send().wait();
    expect(Mina.getBalance(user1, tokenId)).toEqual(fixedPrice.mul(2));
    expect(crowdFunding.getBalance()).toEqual(MINA.mul(2));

    Local.setBlockchainLength(UInt64.from(100));

    const beforeWithdrawBalance = Mina.getBalance(deployerAccount);
    txn = await Mina.transaction(deployerAccount, async () => {
      await crowdFunding.withdraw();
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([deployerKey, crowdFundingKey]).send().wait();
    const afterWithdrawBalance = Mina.getBalance(deployerAccount);
    expect(beforeWithdrawBalance.add(MINA.mul(2))).toEqual(afterWithdrawBalance);
    expect(crowdFunding.getBalance()).toEqual(UInt64.from(0));

    const tokenRemain = crowdFunding.getBalance(tokenId);
    txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await crowdFunding.withdrawToken();
      await token.approveAccountUpdate(crowdFunding.self);
    });
    await txn.prove();
    await txn.sign([deployerKey, crowdFundingKey]).send().wait();
    const afterWithdrawTokenBalance = Mina.getBalance(deployerAccount, tokenId);
    expect(afterWithdrawTokenBalance).toEqual(tokenRemain);
  });
});
