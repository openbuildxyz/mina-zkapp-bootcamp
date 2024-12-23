import { AccountUpdate, Field, MerkleMap, Mina, Poseidon, PrivateKey, PublicKey } from 'o1js';
import Vote from './Vote';

let proofsEnabled = false;

interface Member {
  key: PrivateKey;
  account: Mina.TestPublicKey;
  hashKey: Field;
}

describe('Vote test', () => {
  let deployerAccount: Mina.TestPublicKey;
  let deployerKey: PrivateKey;

  let members: Member[] = [];
  let notMembers: Member[] = [];

  let zkAppAddress: PublicKey;
  let zkAppPrivateKey: PrivateKey;
  let zkApp: Vote;
  let memberMap = new MerkleMap();

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
    await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const txnInit = await Mina.transaction(deployerAccount, async () => {
      await zkApp.updateMemberRoot(memberMap.getRoot());
    });
    await txnInit.prove();
    await txnInit.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('member vote approve', async () => {
    await localDeploy();

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

    const castVote = async (user: any, voteOption: Field) => {
      const txn = await Mina.transaction(user.account, async () => {
        await zkApp.vote(voteOption, memberMap.getWitness(user.hashKey));
      });
      await txn.prove();
      await txn.sign([user.key]).send();
    };

    await Promise.all([
     await castVote(members[0], Field(0)),
     await  castVote(members[1], Field(1)),
     await  castVote(members[2], Field(1)),
     await castVote(members[3], Field(1)),
     await castVote(members[4], Field(0))
    ]);

    const state2 = zkApp.getVoteCounts();

    expect([state2.approve, state2.reject])
      .toEqual([state1.approve.add(Field(3)), state1.reject.add(Field(2))]);
  });

  it('notmember vote approve', async () => {
    await localDeploy();
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