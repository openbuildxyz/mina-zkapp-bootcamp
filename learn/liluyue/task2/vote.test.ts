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

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    member1Account: Mina.TestPublicKey,
    member2Account: Mina.TestPublicKey;

  let zkAppAddress: PublicKey, zkAppPrivateKey: PrivateKey;

  let zkApp: Vote;

  let membershipMap: MerkleMap;

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployerAccount, member1Account, member2Account] = Local.testAccounts;

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

  it('生成并本地部署投票合约', async () => {
    await localDeploy();

    const upvoteCount = zkApp.upvoteCount.get();
    const downvoteCount = zkApp.downvoteCount.get();
    const membershipMapRoot = zkApp.membershipMapRoot.get();

    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
    expect(membershipMapRoot).toEqual(membershipMap.getRoot());
  });

  it('只允许部署者添加投票成员', async () => {
    await localDeploy();

    // 非部署者尝试添加成员
    const member1Field = Poseidon.hash(member1Account.toFields());
    const member1Witness = membershipMap.getWitness(member1Field);

    await expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.addMember(member1Witness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Only deployer can add members');

    // 部署者尝试添加成员
    const txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member1Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    // 更新本地 MerkleMap
    membershipMap.set(member1Field, Field(1));

    // 验证更新后的根
    const updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);
  });

  it('更新投赞成票和反对票成功', async () => {
    await localDeploy();

    let txn: Mina.Transaction<false, false>;
    let member1Witness: MerkleMapWitness;
    let member2Witness: MerkleMapWitness;
    let upvoteCount: Field;
    let downvoteCount: Field;

    // 添加成员 
    const member1Field = Poseidon.hash(member1Account.toFields());
    member1Witness = membershipMap.getWitness(member1Field);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member1Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    // 更新本地 MerkleMap
    membershipMap.set(member1Field, Field(1));

    // 验证更新后的根值
    let updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);

    // 添加成员 
    const member2Field = Poseidon.hash(member2Account.toFields());
    member2Witness = membershipMap.getWitness(member2Field);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(member2Witness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();
    // 更新本地 MerkleMap
    membershipMap.set(member2Field, Field(1));

    // 验证更新后的根值
    updatedMembershipRoot = zkApp.membershipMapRoot.get();
    expect(membershipMap.getRoot()).toEqual(updatedMembershipRoot);
    // 投票前状态确认
    upvoteCount = zkApp.upvoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
    //  投赞同票
    member1Witness = membershipMap.getWitness(member1Field);
    txn = await Mina.transaction(member1Account, async () => {
      await zkApp.vote(Field(1), member1Witness);
    });
    await txn.prove();
    await txn.sign([member1Account.key]).send();

    // 验证投票结果
    upvoteCount = zkApp.upvoteCount.get();
    expect(upvoteCount).toEqual(Field(1));
    downvoteCount = zkApp.downvoteCount.get();
    expect(downvoteCount).toEqual(Field(0));

    //  投反对票
    member2Witness = membershipMap.getWitness(member2Field);
    txn = await Mina.transaction(member2Account, async () => {
      await zkApp.vote(Field(0), member2Witness);
    });
    await txn.prove();
    await txn.sign([member2Account.key]).send();

    // 验证投票结果
    upvoteCount = zkApp.upvoteCount.get();
    downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(1));
    expect(downvoteCount).toEqual(Field(1));
  });

  it('只有团队成员能投票', async () => {
    await localDeploy();

    const member1Field = Poseidon.hash(member1Account.toFields());
    const member1Witness = membershipMap.getWitness(member1Field);

    expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.vote(Field(1), member1Witness);
        await zkApp.vote(Field(1), member1Witness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Only team members can vote');

    // 验证投票结果无变化
    const upvoteCount = zkApp.upvoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
  });

  it('vote type must be 0 or 1', async () => {
    await localDeploy();

    // 添加成员 
    const bobAddressToField = Poseidon.hash(member1Account.toFields());
    const bobWitness = membershipMap.getWitness(bobAddressToField);

    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(bobWitness);
    });
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    // 更新本地 MerkleMap
    membershipMap.set(bobAddressToField, Field(1));

    expect(async () => {
      const txn = await Mina.transaction(member1Account, async () => {
        await zkApp.vote(Field(2), bobWitness);
      });
      await txn.prove();
      await txn.sign([member1Account.key]).send();
    }).rejects.toThrow('Vote type must be 0 or 1');

    // 验证投票结果无变化
    const upvoteCount = zkApp.upvoteCount.get();
    const downvoteCount = zkApp.downvoteCount.get();
    expect(upvoteCount).toEqual(Field(0));
    expect(downvoteCount).toEqual(Field(0));
  });
});
