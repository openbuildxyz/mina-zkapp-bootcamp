import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, Bool } from 'o1js';
import { Vote } from './Vote';

describe('Vote', () => {
  let deployer: Mina.TestPublicKey,
      deployerKey: PrivateKey,
      member: Mina.TestPublicKey,
      memberKey: PrivateKey,
      contractAddress: PublicKey,
      contractKey: PrivateKey,
      voteContract: Vote;

  beforeEach(async () => {
      const Local = await Mina.LocalBlockchain({ proofsEnabled: false });
      Mina.setActiveInstance(Local);
      [deployer, member] = Local.testAccounts;
      deployerKey = deployer.key;
      memberKey = member.key;

      contractKey = PrivateKey.random();
      contractAddress = contractKey.toPublicKey();
      voteContract = new Vote(contractAddress);
  });

  async function deployContract() {
      const txn = await Mina.transaction(deployer, async () => {
          AccountUpdate.fundNewAccount(deployer);
          await voteContract.deploy();
      });
      await txn.sign([deployerKey, contractKey]).send();
  }

  it('should initialize with zero votes and members', async () => {
      await deployContract();

      expect(voteContract.approvalCount.get()).toEqual(Field(0));
      expect(voteContract.rejectCount.get()).toEqual(Field(0));
      expect(voteContract.teamSize.get()).toEqual(Field(0));
  });

  it('should register new team member', async () => {
      await deployContract();

      const txn = await Mina.transaction(deployer, async () => {
          await voteContract.registerMember(member);
      });
      await txn.prove();
      await txn.sign([deployerKey]).send();

      expect(voteContract.teamSize.get()).toEqual(Field(1));
  });

  it('should allow team member to vote', async () => {
      await deployContract();

      // 注册成员
      const registerTxn = await Mina.transaction(deployer, async () => {
          await voteContract.registerMember(member);
      });
      await registerTxn.prove();
      await registerTxn.sign([deployerKey]).send();

      // 投赞成票
      const voteTxn = await Mina.transaction(member, async () => {
          await voteContract.submitVote(member, Bool(true));
      });
      await voteTxn.prove();
      await voteTxn.sign([memberKey]).send();

      expect(voteContract.approvalCount.get()).toEqual(Field(1));
      expect(voteContract.rejectCount.get()).toEqual(Field(0));
  });

  it('should correctly calculate final results', async () => {
      await deployContract();

      // 注册成员
      const registerTxn = await Mina.transaction(deployer, async () => {
          await voteContract.registerMember(member);
      });
      await registerTxn.prove();
      await registerTxn.sign([deployerKey]).send();

      // 投票
      const voteTxn = await Mina.transaction(member, async () => {
          await voteContract.submitVote(member, Bool(true));
      });
      await voteTxn.prove();
      await voteTxn.sign([memberKey]).send();

      // 获取结果
      const resultTxn = await Mina.transaction(deployer, async () => {
          await voteContract.getVotingResult();
      });
      await resultTxn.prove();
      await resultTxn.sign([deployerKey]).send();

      expect(voteContract.finalApprovalCount).toEqual(Field(1));
      expect(voteContract.finalRejectCount).toEqual(Field(0));
  });
});
