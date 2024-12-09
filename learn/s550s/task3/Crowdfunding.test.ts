import { Mina, PrivateKey, AccountUpdate, UInt64 } from 'o1js';
import { Crowdfunding } from '../crowdfunding';

describe('Crowdfunding Smart Contract', () => {
  let owner: PrivateKey;
  let investor1: PrivateKey;
  let investor2: PrivateKey;
  let crowdfunding: Crowdfunding;

  beforeEach(() => {
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    owner = Local.testAccounts[0].privateKey;
    investor1 = Local.testAccounts[1].privateKey;
    investor2 = Local.testAccounts[2].privateKey;

    crowdfunding = new Crowdfunding(owner);
  });

  it('should allow investments within the time window', async () => {
    const hardCap = UInt64.from(1000);
    const deadline = UInt64.from(Date.now() + 10_000); // 10 seconds from now

    await crowdfunding.setDeadline(deadline.toField());
    await crowdfunding.setHardCap(hardCap.toField());

    await crowdfunding.invest(UInt64.from(100), investor1.toPublicKey().toBase58());
    expect(crowdfunding.totalFunds.get()).toEqual(UInt64.from(100).toField());
  });

  it('should not allow investments after the deadline', async () => {
    const hardCap = UInt64.from(1000);
    const deadline = UInt64.from(Date.now() + 1); // 1 millisecond from now

    await crowdfunding.setDeadline(deadline.toField());
    await crowdfunding.setHardCap(hardCap.toField());

    // Wait for deadline to pass
    await new Promise((resolve) => setTimeout(resolve, 10));

    await expect(
      crowdfunding.invest(UInt64.from(100), investor1.toPublicKey().toBase58())
    ).rejects.toThrow('时间窗口已关闭');
  });

  it('should allow withdrawals after the deadline', async () => {
    const hardCap = UInt64.from(1000);
    const deadline = UInt64.from(Date.now() + 10); // 10 milliseconds from now

    await crowdfunding.setDeadline(deadline.toField());
    await crowdfunding.setHardCap(hardCap.toField());

    await crowdfunding.invest(UInt64.from(200), investor1.toPublicKey().toBase58());

    // Wait for deadline to pass
    await new Promise((resolve) => setTimeout(resolve, 20));

    await crowdfunding.withdraw(UInt64.from(200), investor1.toPublicKey().toBase58());
    expect(crowdfunding.totalFunds.get()).toEqual(UInt64.from(0).toField());
  });

  it('should not allow non-investors to withdraw', async () => {
    const hardCap = UInt64.from(1000);
    const deadline = UInt64.from(Date.now() + 10_000);

    await crowdfunding.setDeadline(deadline.toField());
    await crowdfunding.setHardCap(hardCap.toField());

    await crowdfunding.invest(UInt64.from(100), investor1.toPublicKey().toBase58());

    await expect(
      crowdfunding.withdraw(UInt64.from(50), investor2.toPublicKey().toBase58())
    ).rejects.toThrow('未找到投资记录');
  });
});