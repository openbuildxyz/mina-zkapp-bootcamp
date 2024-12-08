import { Crowdfunding } from './Crowdfunding';
import {
  AccountUpdate,
  Mina,
  PrivateKey,
  PublicKey,
  UInt64,
} from 'o1js';

describe('Crowdfunding', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkApp: Crowdfunding;

  beforeAll(async () => {
    const Local = Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);
    
    deployerKey = Local.testAccounts[0].privateKey;
    deployerAccount = Local.testAccounts[0].publicKey;
    senderKey = Local.testAccounts[1].privateKey;
    senderAccount = Local.testAccounts[1].publicKey;
    
    zkApp = new Crowdfunding(deployerAccount);
  });

  it('部署合约', async () => {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();
  });

  it('投资众筹', async () => {
    const amount = UInt64.from(100000000); // 0.1 MINA
    
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.contribute();
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const currentAmount = zkApp.currentAmount.get();
    expect(currentAmount).toEqual(amount);
  });
}); 