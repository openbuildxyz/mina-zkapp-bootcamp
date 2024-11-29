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
  Bool,
} from 'o1js';

describe('Vote', () => {
  let deployerAccount: Mina.TestPublicKey,
    account2: Mina.TestPublicKey,
    account3: Mina.TestPublicKey;

  let zkAppAddress: PublicKey, zkAppPrivateKey: PrivateKey;
  let zkApp: Vote;
  let memberMap: MerkleMap;

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployerAccount, account2, account3] = Local.testAccounts;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    zkApp = new Vote(zkAppAddress);

    memberMap = new MerkleMap();
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerAccount.key, zkAppPrivateKey]).send();
  }

  it('生成部署合约', async () => {
    await localDeploy();

    const approveVotes = zkApp.approveVotes.get();
    const rejectVotes = zkApp.rejectVotes.get();
    const memberRoot = zkApp.memberRoot.get();

    expect(approveVotes).toEqual(Field(0));
    expect(rejectVotes).toEqual(Field(0));
    expect(memberRoot).toEqual(memberMap.getRoot());
  });

  it('成员投票并计数', async () => {
    await localDeploy();

    let txn: Mina.Transaction<false, false>;
    let witness2: MerkleMapWitness;
    let witness3: MerkleMapWitness;
    let approveVotes: Field;
    let rejectVotes: Field;

    //添加成员2
    const address2 = Poseidon.hash(account2.toFields());
    memberMap.set(address2, Field(6));
    witness2 = memberMap.getWitness(address2);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(witness2)
    })
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    //添加成员3
    const address3 = Poseidon.hash(account3.toFields());
    memberMap.set(address3, Field(6));
    witness3 = memberMap.getWitness(address3);
    txn = await Mina.transaction(deployerAccount, async () => {
      await zkApp.addMember(witness3)
    })
    await txn.prove();
    await txn.sign([deployerAccount.key]).send();

    //成员2投支持票
    txn = await Mina.transaction(account2, async () => {
      await zkApp.submitVote(Bool(true), address2, memberMap.getWitness(address2));
    })
    await txn.prove();
    await txn.sign([account2.key]).send();

    approveVotes = zkApp.approveVotes.get();
    rejectVotes = zkApp.rejectVotes.get();
    expect(approveVotes).toEqual(Field(1));
    expect(rejectVotes).toEqual(Field(0));

    //成员3投反对票
    txn = await Mina.transaction(account3, async () => {
      await zkApp.submitVote(Bool(false), address3, memberMap.getWitness(address3));
    })
    await txn.prove();
    await txn.sign([account3.key]).send();

    approveVotes = zkApp.approveVotes.get();
    rejectVotes = zkApp.rejectVotes.get();
    expect(approveVotes).toEqual(Field(1));
    expect(rejectVotes).toEqual(Field(1));
  });

  it('非成员无法投票', async () => {
    await localDeploy();

    const address2 = Poseidon.hash(account2.toFields());
    const witness2 = memberMap.getWitness(address2);
    expect(async () => {
      const txn = await Mina.transaction(account2, async () => {
        await zkApp.submitVote(Bool(true), address2, witness2);
      })
      await txn.prove();
      await txn.sign([account2.key]).send();
    }).rejects.toThrow('非成员无法投票');

    const approveVotes = zkApp.approveVotes.get();
    const rejectVotes = zkApp.rejectVotes.get();
    expect(approveVotes).toEqual(Field(0));
    expect(rejectVotes).toEqual(Field(0));
  })

});