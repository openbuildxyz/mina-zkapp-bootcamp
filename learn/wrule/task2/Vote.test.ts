import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, MerkleMap, Poseidon } from 'o1js';
import { Vote } from './Vote';

let proofsEnabled = false;

interface IUser {
  key: PrivateKey;
  account: Mina.TestPublicKey;
  hashKey: Field;
}

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,

    members: IUser[] = [],
    notMembers: IUser[] = [],

    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Vote,
    memberMap = new MerkleMap();


  beforeAll(async () => {
    if (proofsEnabled) await Vote.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    deployerAccount = Local.testAccounts[0];
    deployerKey = deployerAccount.key;
    Local.testAccounts.slice(1, 6).forEach((item, index) => {
      members[index] = {
        account: item,
        key: item.key,
        hashKey: Poseidon.hash(item.toFields()),
      };
      memberMap.set(members[index].hashKey, Field(1));
    });
    console.log(1234, members.map((item) => item.hashKey.toString()));
    Local.testAccounts.slice(6, 10).forEach((item, index) => {
      notMembers[index] = {
        account: item,
        key: item.key,
        hashKey: Poseidon.hash(item.toFields()),
      };
    });
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

    const txnInit = await Mina.transaction(deployerAccount, async () => {
      await zkApp.updateMemberRoot(memberMap.getRoot());
    });
    await txnInit.prove();
    await txnInit.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('member vote approve', async () => {
    await localDeploy();
    // random select a member
    const user = members[Math.floor(Math.random() * members.length)];
    const state1 = zkApp.getVoteCounts();
    const txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(1), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();
    const state2 = zkApp.getVoteCounts();
    expect([state2.approve, state2.reject])
      .toEqual([state1.approve.add(Field(1)), state1.reject]);
  });

  it('member vote reject', async () => {
    await localDeploy();
    // random select a member
    const user = members[Math.floor(Math.random() * members.length)];
    const state1 = zkApp.getVoteCounts();
    const txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(0), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();
    const state2 = zkApp.getVoteCounts();
    expect([state2.approve, state2.reject])
      .toEqual([state1.approve, state1.reject.add(Field(1))]);
  });

  it('member vote complex scene', async () => {
    await localDeploy();
    const state1 = zkApp.getVoteCounts();

    let user = members[0];
    let txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(0), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    user = members[1];
    txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(1), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    user = members[2];
    txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(1), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    user = members[3];
    txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(1), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    user = members[4];
    txn = await Mina.transaction(user.account, async () => {
      await zkApp.vote(Field(0), memberMap.getWitness(user.hashKey));
    });
    await txn.prove();
    await txn.sign([user.key]).send();

    const state2 = zkApp.getVoteCounts();
    expect([state2.approve, state2.reject])
      .toEqual([state1.approve.add(Field(3)), state1.reject.add(Field(2))]);
  });

  it('notmember vote approve', async () => {
    await localDeploy();
    // random select a user not member
    const user = notMembers[Math.floor(Math.random() * notMembers.length)];
    const state1 = zkApp.getVoteCounts();
    await expect(async () => {
      const txn = await Mina.transaction(user.account, async () => {
        await zkApp.vote(Field(1), memberMap.getWitness(user.hashKey));
      });
      await txn.prove();
      await txn.sign([user.key]).send();
    }).rejects.toThrow('Member validation failed');
    const state2 = zkApp.getVoteCounts();
    expect(state2).toEqual(state1);
  });

  it('notmember vote reject', async () => {
    await localDeploy();
    // random select a user not member
    const user = notMembers[Math.floor(Math.random() * notMembers.length)];
    const state1 = zkApp.getVoteCounts();
    await expect(async () => {
      const txn = await Mina.transaction(user.account, async () => {
        await zkApp.vote(Field(0), memberMap.getWitness(user.hashKey));
      });
      await txn.prove();
      await txn.sign([user.key]).send();
    }).rejects.toThrow('Member validation failed');
    const state2 = zkApp.getVoteCounts();
    expect(state2).toEqual(state1);
  });

  it('merkle tree root update and access', async () => {
    await localDeploy();
    const tree = new MerkleMap();
    members.forEach((member) => {
      tree.set(member.hashKey, Field(1));
    });
    const txnRootUpdate = await Mina.transaction(deployerAccount, async () => {
      await zkApp.updateMemberRoot(tree.getRoot());
    });
    await txnRootUpdate.prove();
    await txnRootUpdate.sign([deployerKey, zkAppPrivateKey]).send();
    const currentRoot = zkApp.getMemberRoot();
    expect(currentRoot).toEqual(tree.getRoot());
  });
});
