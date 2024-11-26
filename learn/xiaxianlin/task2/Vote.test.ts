import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { Vote } from './Vote';

describe('Vote', () => {
  let deployer: Mina.TestPublicKey,
    member1: Mina.TestPublicKey,
    member2: Mina.TestPublicKey,
    member3: Mina.TestPublicKey,
    app: PrivateKey,
    instance: Vote;

  beforeAll(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    [deployer, member1, member2, member3] = Local.testAccounts;
    app = PrivateKey.random();
    instance = new Vote(app.toPublicKey());

    const txn = await Mina.transaction(deployer, async () => {
      AccountUpdate.fundNewAccount(deployer);
      await instance.deploy();
    });
    await txn.prove();
    await txn.sign([deployer.key, app]).send();
  });

  const vote = async (member: Mina.TestPublicKey, pass: boolean) => {
    const tx1 = await Mina.transaction(member, async () => {
      if (pass) {
        await instance.agree();
      } else {
        await instance.reject();
      }
    });
    await tx1.prove();
    await tx1.sign([member.key]).send();
  };

  it('member1 vote agree', async () => {
    await vote(member1, true);
    expect(instance.agreedCount.get()).toEqual(Field(1));
    expect(instance.rejectedCount.get()).toEqual(Field(0));
  });

  it('member2 vote agree', async () => {
    await vote(member2, true);
    expect(instance.agreedCount.get()).toEqual(Field(2));
    expect(instance.rejectedCount.get()).toEqual(Field(0));
  });

  it('member3 vote reject', async () => {
    await vote(member3, false);
    expect(instance.agreedCount.get()).toEqual(Field(2));
    expect(instance.rejectedCount.get()).toEqual(Field(1));
  });
});
