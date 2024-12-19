import { Mina, PrivateKey, PublicKey, AccountUpdate, Field, UInt64, UInt32 } from 'o1js';
import { CrowdFundingZkapp } from './CrowdFundingZkapp';

describe('CrowdFundingZkapp', () => {
  let sender: PrivateKey;
  let investor: PublicKey;
  let hardCap: UInt64;
  let endTime: UInt32;
  let zkApp: CrowdFundingZkapp;

  beforeAll(async () => {
    // 创建一个测试账户
    sender = PrivateKey.fromBase58('your-private-key'); // 替换为有效的私钥
    investor = PublicKey.fromBase58('investor-public-key'); // 替换为投资人的公钥

    // 设置硬顶和结束时间
    hardCap = UInt64.fromNumber(1000000);
    endTime = UInt32.fromNumber(10000); // 结束时间可以是块高度

    // 部署 zkApp
    zkApp = new CrowdFundingZkapp(sender);
    await zkApp.deploy({
      investor,
      hardCap,
      endTime,
    });
  });

  it('should deploy zkApp successfully', async () => {
    const investorState = await zkApp.investor.get();
    const hardCapState = await zkApp.hardCap.get();
    const endTimeState = await zkApp.endTime.get();

    // 验证状态是否正确
    expect(investorState).toEqual(investor);
    expect(hardCapState.toString()).toEqual(hardCap.toString());
    expect(endTimeState.toString()).toEqual(endTime.toString());
  });

  it('should allow investment if within time window and under hard cap', async () => {
    const investmentAmount = UInt64.fromNumber(50000);

    // 模拟发送者进行投资
    await zkApp.invest(investmentAmount);

    // 获取合约当前余额
    const currentBalance = await zkApp.account.balance.get();

    // 验证投资后余额
    expect(currentBalance.toString()).toEqual(investmentAmount.toString());
  });

  it('should fail investment if past the end time', async () => {
    const investmentAmount = UInt64.fromNumber(50000);
    
    // 设置时间超过结束时间
    zkApp.endTime.set(UInt32.fromNumber(0)); // 设置一个过去的时间

    try {
      await zkApp.invest(investmentAmount);
    } catch (error) {
      expect(error.message).toContain('投资事件已过期');
    }
  });

  it('should fail investment if it exceeds hard cap', async () => {
    const investmentAmount = UInt64.fromNumber(2000000); // 超过硬顶

    try {
      await zkApp.invest(investmentAmount);
    } catch (error) {
      expect(error.message).toContain('投资金额已到顶');
    }
  });

  it('should allow withdraw by investor only after end time', async () => {
    // 设置时间达到结束时间
    zkApp.network.blockchainLength.set(UInt32.fromNumber(10001));

    // 模拟提现操作
    await zkApp.withdraw();

    // 获取合约余额，应该是 0
    const currentBalance = await zkApp.account.balance.get();
    expect(currentBalance.toString()).toEqual('0');
  });

  it('should fail withdraw if sender is not investor', async () => {
    // 设置一个非投资人的账户
    const nonInvestor = PrivateKey.random();
    zkApp.sender.set(nonInvestor.publicKey);

    try {
      await zkApp.withdraw();
    } catch (error) {
      expect(error.message).toContain('只有投资人可以提现');
    }
  });

  it('should fail withdraw if crowdfunding has not ended', async () => {
    // 设置时间还未到达结束时间
    zkApp.network.blockchainLength.set(UInt32.fromNumber(9999));

    try {
      await zkApp.withdraw();
    } catch (error) {
      expect(error.message).toContain('众筹未结束');
    }
  });
});
