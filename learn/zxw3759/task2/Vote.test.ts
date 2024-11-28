import { AccountUpdate, Field, Mina, Bool, PrivateKey, PublicKey } from 'o1js';
import { Vote } from './Vote';

let proofsEnabled = false;

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    oneTestAccount: Mina.TestPublicKey,
    twoTestAccount: Mina.TestPublicKey,
    oneTestKey: PrivateKey,
    twoTestKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Vote;

  beforeAll(async () => {
    if (proofsEnabled) await Vote.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, oneTestAccount, twoTestAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    oneTestKey = oneTestAccount.key;
    twoTestKey = twoTestAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Vote(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('init number to 0', async () => {
    await localDeploy();
    const approveNum = zkApp.approveNum.get();
    expect(approveNum).toEqual(Field(0));
    const opposeNum = zkApp.opposeNum.get();
    expect(opposeNum).toEqual(Field(0));
  });
  it('correctly count on the `Vote` smart contract', async () => {
    let approveNum: Field;
    let opposeNum: Field;
    await localDeploy();
    // 反对票
    let txn = await Mina.transaction(oneTestAccount, async () => {
      await zkApp.count(Bool(false));
    });
    await txn.prove();
    await txn.sign([oneTestKey]).send();
    approveNum = zkApp.approveNum.get();
    opposeNum = zkApp.opposeNum.get();
    expect(approveNum).toEqual(Field(0));
    expect(opposeNum).toEqual(Field(1));

    // 赞成票
    let twotxn = await Mina.transaction(twoTestAccount, async () => {
      await zkApp.count(Bool(true));
    });
    await twotxn.prove();
    await twotxn.sign([twoTestKey]).send();
    approveNum = zkApp.approveNum.get();
    opposeNum = zkApp.opposeNum.get();
    expect(approveNum).toEqual(Field(1));
    expect(opposeNum).toEqual(Field(1));
  });
});
