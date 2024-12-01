import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  MerkleMap,
  Bool,
  Poseidon,
} from 'o1js';
import { Vote } from './Vote';

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    memberAccount1: Mina.TestPublicKey,
    memberKey1: PrivateKey,
    memberAccount2: Mina.TestPublicKey,
    memberKey2: PrivateKey,
    nonMemberAccount: Mina.TestPublicKey,
    nonMemberKey: PrivateKey,
    zkApp: Vote,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey;

  let memberMap: MerkleMap;

  beforeAll(async () => {
    // 编译合约
    await Vote.compile();
  });

  beforeEach(async () => {
    // 设置本地测试链
    const Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    [deployerAccount, memberAccount1, memberAccount2, nonMemberAccount] =
      Local.testAccounts;

    deployerKey = deployerAccount.key;
    memberKey1 = memberAccount1.key;
    memberKey2 = memberAccount2.key;
    nonMemberKey = nonMemberAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Vote(zkAppAddress);

    // 初始化成员MerkleMap
    memberMap = new MerkleMap();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('Deploy Vote Smart Contract', async () => {
    await localDeploy();

    const deployerPublicKey = zkApp.deployer.get();
    expect(deployerPublicKey).toEqual(deployerAccount.key.toPublicKey());

    const agreeCount = zkApp.agreeCount.get();
    expect(agreeCount).toEqual(Field(0));

    const disagreeCount = zkApp.disagreeCount.get();
    expect(disagreeCount).toEqual(Field(0));
  });

  it('Add Member', async () => {
    await localDeploy();

    // 添加两个成员
    memberMap.set(memberAccount1.toFields()[0], Field(1));
    memberMap.set(memberAccount2.toFields()[0], Field(1));

    const txn = await Mina.transaction(deployerAccount, async () => {
      zkApp.addMember(memberMap.getRoot());
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    const memberRoot = zkApp.member.get();
    expect(memberRoot).toEqual(memberMap.getRoot());
  });

  it('Add Member Valiate Permission', async () => {
    await localDeploy();

    memberMap.set(memberAccount1.toFields()[0], Field(1));

    await expect(async () => {
      const txn = await Mina.transaction(memberAccount1, async () => {
        await zkApp.addMember(memberMap.getRoot());
      });
      await txn.prove();
      await txn.sign([memberKey1]).send();
    }).rejects.toThrow();
  });

  it('Member Voting', async () => {
    await localDeploy();

    memberMap.set(memberAccount1.toFields()[0], Field(1));
    let txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(memberMap.getRoot());
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    const witness = memberMap.getWitness(memberAccount1.toFields()[0]);
    txn = await Mina.transaction(memberAccount1, async () => {
      await zkApp.vote(Bool(true), witness);
    });
    await txn.prove();
    await txn.sign([memberKey1]).send();

    const agreeCount = zkApp.agreeCount.get();
    expect(agreeCount).toEqual(Field(1));
  });

  it('Un-Menmber Voting', async () => {
    await localDeploy();

    memberMap.set(memberAccount1.toFields()[0], Field(1));
    let txn = await Mina.transaction(deployerAccount, async () => {
      zkApp.addMember(memberMap.getRoot());
    });
    await txn.prove();
    await txn.sign([deployerKey]).send();

    const witness = memberMap.getWitness(nonMemberAccount.toFields()[0]);
    await expect(async () => {
      txn = await Mina.transaction(nonMemberAccount, async () => {
        await zkApp.vote(Bool(true), witness);
      });
      await txn.prove();
      await txn.sign([nonMemberKey]).send();
    }).rejects.toThrow();
  });
});
