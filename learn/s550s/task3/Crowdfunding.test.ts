import { Crowdfunding } from './Crowdfunding';
import { Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';

describe('Crowdfunding Contract', () => {
  let deployerKey: PrivateKey;
  let deployerPublicKey: PublicKey;
  let beneficiaryKey: PrivateKey;
  let beneficiaryPublicKey: PublicKey;
  let contributorKey: PrivateKey;
  let contributorPublicKey: PublicKey;

  beforeAll(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled: false });
    Mina.setActiveInstance(Local);

    // 初始化账户
    deployerKey = Local.testAccounts[0].privateKey;
    deployerPublicKey = deployerKey.toPublicKey();

    beneficiaryKey = PrivateKey.random();
    beneficiaryPublicKey = beneficiaryKey.toPublicKey();

    contributorKey = Local.testAccounts[1].privateKey;
    contributorPublicKey = contributorKey.toPublicKey();
  });

  it('should allow contributions and beneficiary withdrawal', async () => {
    // 创建合约实例
    const crowdfunding = new Crowdfunding(deployerPublicKey);
    const hardCap = UInt64.fromNumber(1000);
    const endTime = Mina.getBlockchainLength().add(10); // 时间窗口结束

    // 初始化合约
    await crowdfunding.init(beneficiaryPublicKey, hardCap, endTime);

    // 测试投资
    await crowdfunding.contribute(UInt64.fromNumber(200), contributorPublicKey);
    await crowdfunding.contribute(UInt64.fromNumber(300), contributorPublicKey);

    const totalFunds = crowdfunding.totalFunds.get();
    expect(totalFunds).toEqual(UInt64.fromNumber(500)); // 验证总筹资金额

    // 时间窗口未结束，提款应失败
    expect(() => crowdfunding.withdraw()).toThrow('Crowdfunding period is still active');

    // 快进时间到结束
    Mina.advanceBlockchainLength(11);

    // 测试提款
    await crowdfunding.withdraw();
    const contractBalance = Mina.getAccount(crowdfunding.address).balance;
    expect(contractBalance).toEqual(UInt64.zero()); // 验证资金已提取
  });
});
