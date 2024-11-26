import { AccountUpdate, Field, MerkleMap, Mina, Poseidon, PrivateKey, PublicKey } from 'o1js';
import { Vote } from './Vote';

let proofsEnabled = false;

interface User {
  key: PrivateKey;
  account: Mina.TestPublicKey;
  hash: Field;
}

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    invalidAccount: Mina.TestPublicKey,
    memberRoot: MerkleMap = new MerkleMap(),
    teamMembers: User[] = [],
    invalidUser: User,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Vote;

  beforeAll(async () => {
    if (proofsEnabled) await Vote.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);

    [deployerAccount, invalidAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
  
    invalidUser = {
      key: invalidAccount.key,
      account: invalidAccount,
      hash: Poseidon.hash(invalidAccount.toFields()),
    };

    Local.testAccounts.slice(2, 10).forEach((item, index) => {
      teamMembers[index] = {
        key: item.key,
        account: item,
        hash: Poseidon.hash(item.toFields()),
      };
      memberRoot.set(teamMembers[index].hash, Field(1));
    });

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Vote(zkAppAddress);

    await localDeploy();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const txnInit = await Mina.transaction(deployerAccount, async () => {
      await zkApp.setTeamMembers(memberRoot.getRoot());
    });
    await txnInit.prove();
    await txnInit.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('approve vote', async () => {
    const user = teamMembers[Math.floor(Math.random() * teamMembers.length)];
  
    const oldVoteCount = zkApp.getVoteCount();  
    const txn = await Mina.transaction(user.account, async () => {
      await zkApp.approveVote(memberRoot.getWitness(user.hash));
    });
    await txn.prove();  
    await txn.sign([user.key]).send();

    const newVoteCount = zkApp.getVoteCount();  
    expect([newVoteCount.approve, newVoteCount.reject])
      .toEqual([oldVoteCount.approve.add(Field(1)), oldVoteCount.reject]);
  });

  it('reject vote', async () => {
    const user = teamMembers[Math.floor(Math.random() * teamMembers.length)];
  
    const oldVoteCount = zkApp.getVoteCount();

    const txn = await Mina.transaction(user.account, async () => {
      await zkApp.rejectVote(memberRoot.getWitness(user.hash));
    });
    await txn.prove();  
    await txn.sign([user.key]).send();

    const newVoteCount = zkApp.getVoteCount();  
    expect([newVoteCount.approve, newVoteCount.reject])
      .toEqual([oldVoteCount.approve, oldVoteCount.reject.add(Field(1))]);
  });

  it('invalid member', async () => {  
    expect(async () => {
      await Mina.transaction(invalidUser.account, async () => {
        await zkApp.approveVote(memberRoot.getWitness(invalidUser.hash));
      });
    }).rejects;
  });
});
