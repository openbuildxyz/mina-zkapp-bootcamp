import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from "o1js";
import { CrowdFunding } from "./CrowdFunding";

let proofsEnabled = false;

describe('CrowdFunding', () => {
  let deployKeyAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    crowdFundingAddress: PublicKey,
    crowdFundingPrivateKey: PrivateKey,
    crowdFunding: CrowdFunding;

  beforeAll(async () => {
    if (proofsEnabled) {
      await CrowdFunding.compile()
    }
  })

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({
      proofsEnabled
    });

    Mina.setActiveInstance(Local);

    [deployKeyAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployKeyAccount.key;
    senderKey = senderAccount.key;

    crowdFundingPrivateKey = PrivateKey.random();
    crowdFundingAddress = crowdFundingPrivateKey.toPublicKey();
    crowdFunding = new CrowdFunding(crowdFundingAddress);
  })

  async function localDeploy() {
    const txn = await Mina.transaction({
      sender: deployKeyAccount,
      fee: 0.1 * 10e9,
      memo: "部署"
    }, async () => {
      AccountUpdate.fundNewAccount(deployKeyAccount);
      await crowdFunding.deploy()
    });

    await txn.prove();
    await txn.sign([deployerKey, senderKey]).send().wait();
  }

  it('generator and deploys the crowdFunding smart contract', async () => {
    await localDeploy();
    const x = crowdFunding.x.get();
    expect(x).toEqual(Field(0))
  })

  it('update x state on the crowdFunding smart contract', async () => {
    const txn = await Mina.transaction({
      sender: senderAccount,
      fee: 0.1 * 10e9,
      memo: "部署"
    }, async () => {
      await crowdFunding.update(Field(20));
    });

    await txn.prove();
    await txn.sign([senderKey]).send().wait();
    const x = crowdFunding.x.get();
    expect(x).toEqual(Field(20))
  })
})