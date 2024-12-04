import { Vote } from './vote';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  PublicKey,
  MerkleMap,
  Poseidon,
  MerkleMapWitness,
} from 'o1js';

describe('Vote test', () => {
  let deployerAccount: Mina.TestPublicKey;
  let member1Account: Mina.TestPublicKey;
  let member2Account: Mina.TestPublicKey;
  let zkAppAddress: PublicKey;
  let zkAppPrivateKey: PrivateKey;
  let zkApp: Vote;
  let membershipMap: MerkleMap;

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployerAccount, member1Account, member2Account] = Local.testAccounts;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    zkApp = new Vote(zkAppAddress);
    membershipMap = new MerkleMap();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerAccount.key, zkAppPrivateKey]).send();
  }

  it('generates and deploys the Vote smart contract', async () => {
    await localDeploy();

    const upvoteCount = zkApp.enVoteCount.get();
    const downvoteCount = zkApp.deVoteCount.get();
    const membershipMapRoot = zkApp.membershipMapRoot.get();

    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
    expect(membershipMapRoot).toEqual(membershipMap.getRoot());
  });

  it('only allows deployer to add members', async () => {
    await localDeploy();

    const member1AddressToField = Poseidon.hash(member1Account.toFields());
    const member1Witness = membershipMap.getWitness(member1AddressToField);

    await expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.addMember(member1Witness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Only deployer can add members');

    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member1Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    membershipMap.set(member1AddressToField, Field(1));

    const updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);
  });

  it('correctly updates the enVoteCount and deVoteCount state on the Vote', async () => {
    await localDeploy();

    let txn: Mina.Transaction<false, false>;
    let member1Witness: MerkleMapWitness;
    let member2Witness: MerkleMapWitness;
    let enVoteCount: Field;
    let deVoteCount: Field;

    const member1AddressToField = Poseidon.hash(member1Account.toFields());
    member1Witness = membershipMap.getWitness(member1AddressToField);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member1Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    membershipMap.set(member1AddressToField, Field(1));

    let updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);

    const member2AddressToField = Poseidon.hash(member2Account.toFields());
    member2Witness = membershipMap.getWitness(member2AddressToField);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member2Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    membershipMap.set(member2AddressToField, Field(1));

    updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);

    member1Witness = membershipMap.getWitness(member1AddressToField);
    txn = await Mina.transaction(member1Account, async () => {
      await zkApp.vote(Field(1), member1Witness);
    });
    await txn.prove();
    await txn.sign([member1Account.key]).send();

    enVoteCount = zkApp.enVoteCount.get();
    deVoteCount = zkApp.deVoteCount.get();
    expect(enVoteCount).toEqual(Field(1));
    expect(deVoteCount).toEqual(Field(0));

    member2Witness = membershipMap.getWitness(member2AddressToField);
    txn = await Mina.transaction(member2Account, async () => {
      await zkApp.vote(Field(0), member2Witness);
    });
    await txn.prove();
    await txn.sign([member2Account.key]).send();

    enVoteCount = zkApp.enVoteCount.get();
    deVoteCount = zkApp.deVoteCount.get();
    expect(enVoteCount).toEqual(Field(1));
    expect(deVoteCount).toEqual(Field(1));
  });

  it('team members can vote', async () => {
    await localDeploy();

    const member1AddressToField = Poseidon.hash(member1Account.toFields());
    const member1Witness = membershipMap.getWitness(member1AddressToField);

    expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.vote(Field(1), member1Witness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Only team members can vote');

    // 验证投票结果无变化
    const upvoteCount = zkApp.enVoteCount.get();
    const downvoteCount = zkApp.deVoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
  });

  it('vote type must be 1 or 0', async () => {
    await localDeploy();

    const member1AddressToField = Poseidon.hash(member1Account.toFields());
    const member2Witness = membershipMap.getWitness(member1AddressToField);

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member2Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    membershipMap.set(member1AddressToField, Field(1));

    expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.vote(Field(2), member2Witness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Vote type must be 0 or 1');

    const enVoteCount = zkApp.enVoteCount.get();
    const deVoteCount = zkApp.deVoteCount.get();
    expect(enVoteCount).toEqual(Field(0));
    expect(deVoteCount).toEqual(Field(0));
  });
});
