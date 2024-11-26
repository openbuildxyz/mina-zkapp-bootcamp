import { Vote } from './Vote';
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

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    bobAccount: Mina.TestPublicKey,
    aliceAccount: Mina.TestPublicKey;

  let zkAppAddress: PublicKey, zkAppPrivateKey: PrivateKey;

  let zkApp: Vote;

  let membershipMap: MerkleMap;

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployerAccount, bobAccount, aliceAccount] = Local.testAccounts;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    zkApp = new Vote(zkAppAddress);

    // 初始化 MerkleMap
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

  it('generates and deploys the `Vote` smart contract', async () => {
    await localDeploy();

    const upvoteCount = zkApp.upvoteCount.get();
    const downvoteCount = zkApp.downvoteCount.get();
    const membershipMapRoot = zkApp.membershipMapRoot.get();

    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
    expect(membershipMapRoot).toEqual(membershipMap.getRoot());
  });

  it('only allows deployer to add members', async () => {
    await localDeploy();

    // 非部署者尝试添加成员
    const bobAddressToField = Poseidon.hash(bobAccount.toFields());
    const bobWitness = membershipMap.getWitness(bobAddressToField);

    await expect(async () => {
      const txn = await Mina.transaction(bobAccount, async () => {
        await zkApp.addMember(bobWitness);
      });
      await txn.prove();
      await txn.sign([bobAccount.key]).send();
    }).rejects.toThrow('Only deployer can add members');

    // 部署者尝试添加成员
    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(bobWitness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    // 更新本地 MerkleMap
    membershipMap.set(bobAddressToField, Field(1));

    // 验证更新后的根
    const updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);
  });

  it('correctly updates the `upvoteCount` and `downvoteCount` state on the `Vote` smart contract', async () => {
    await localDeploy();

    let txn: Mina.Transaction<false, false>;
    let bobWitness: MerkleMapWitness;
    let aliceWitness: MerkleMapWitness;
    let upvoteCount: Field;
    let downvoteCount: Field;

    // 添加成员 Bob
    const bobAddressToField = Poseidon.hash(bobAccount.toFields());
    bobWitness = membershipMap.getWitness(bobAddressToField);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(bobWitness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    // 更新本地 MerkleMap
    membershipMap.set(bobAddressToField, Field(1));

    // 验证更新后的根值
    let updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);

    // 添加成员 Alice
    const aliceAddressToField = Poseidon.hash(aliceAccount.toFields());
    aliceWitness = membershipMap.getWitness(aliceAddressToField);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(aliceWitness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    // 更新本地 MerkleMap
    membershipMap.set(aliceAddressToField, Field(1));

    // 验证更新后的根值
    updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);

    // Bob 投赞同票
    bobWitness = membershipMap.getWitness(bobAddressToField);
    txn = await Mina.transaction(bobAccount, async () => {
      await zkApp.vote(Field(1), bobWitness);
    });
    await txn.prove();
    await txn.sign([bobAccount.key]).send();

    // 验证投票结果
    upvoteCount = zkApp.upvoteCount.get();
    downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(1));
    expect(downvoteCount).toEqual(Field(0));

    // Alice 投反对票
    aliceWitness = membershipMap.getWitness(aliceAddressToField);
    txn = await Mina.transaction(aliceAccount, async () => {
      await zkApp.vote(Field(0), aliceWitness);
    });
    await txn.prove();
    await txn.sign([aliceAccount.key]).send();

    // 验证投票结果
    upvoteCount = zkApp.upvoteCount.get();
    downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(1));
    expect(downvoteCount).toEqual(Field(1));
  });

  it('only team members can vote', async () => {
    await localDeploy();

    // Bob
    const bobAddressToField = Poseidon.hash(bobAccount.toFields());
    const bobWitness = membershipMap.getWitness(bobAddressToField);

    expect(async () => {
      const txn = await Mina.transaction(bobAccount, async () => {
        await zkApp.vote(Field(1), bobWitness);
      });
      await txn.prove();
      await txn.sign([bobAccount.key]).send();
    }).rejects.toThrow('Only team members can vote');

    // 验证投票结果无变化
    const upvoteCount = zkApp.upvoteCount.get();
    const downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
  });

  it('vote type must be 0 or 1', async () => {
    await localDeploy();

    // 添加成员 Bob
    const bobAddressToField = Poseidon.hash(bobAccount.toFields());
    const bobWitness = membershipMap.getWitness(bobAddressToField);

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(bobWitness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    // 更新本地 MerkleMap
    membershipMap.set(bobAddressToField, Field(1));

    expect(async () => {
      const txn = await Mina.transaction(bobAccount, async () => {
        await zkApp.vote(Field(2), bobWitness);
      });
      await txn.prove();
      await txn.sign([bobAccount.key]).send();
    }).rejects.toThrow('Vote type must be 0 or 1');

    // 验证投票结果无变化
    const upvoteCount = zkApp.upvoteCount.get();
    const downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
  });
});
