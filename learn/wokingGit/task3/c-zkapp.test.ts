import {
  Mina,
  SmartContract,
  DeployArgs,
  PublicKey,
  UInt64,
  UInt32,
  AccountUpdate,
  Provable,
} from 'o1js';
import { CrowdFundingZkapp } from './c-zkapp'; // 导入你的合约类

// 配置测试环境
const testEnv = async () => {
  const sender = PublicKey.fromBase58('SenderPublicKey'); // 使用真实的测试公钥
  const investor = PublicKey.fromBase58('InvestorPublicKey'); // 投资者公钥
  const hardCap = UInt64.from(1000); // 硬顶设置为 1000
  const endTime = UInt32.from(10); // 结束时间设置为区块高度 10

  const deployProps = {
    investor,
    hardCap,
    endTime,
  };

  const contract = new CrowdFundingZkapp(deployProps);

  // 部署合约
  await contract.deploy(deployProps);

  return { contract, sender, investor, hardCap, endTime };
};

// 部署合约的测试
describe('CrowdFundingZkapp', () => {
  let contract;
  let sender;
  let investor;
  let hardCap;
  let endTime;

  beforeEach(async () => {
    const env = await testEnv();
    contract = env.contract;
    sender = env.sender;
    investor = env.investor;
    hardCap = env.hardCap;
    endTime = env.endTime;
  });

  test('should deploy with correct initial state', async () => {
    // 检查部署后的状态是否正确
    expect(await contract.hardCap.get()).toEqual(hardCap);
    expect(await contract.investor.get()).toEqual(investor);
    expect(await contract.endTime.get()).toEqual(endTime);
  });

  test('should invest within time window and respect hard cap', async () => {
    const amount = UInt64.from(500);

    // 模拟投资操作
    await contract.invest(amount);

    // 检查余额
    const currentBalance = await contract.account.balance.get();
    expect(currentBalance).toEqual(amount);

    // 再投资超过硬顶限制应该失败
    const exceedingAmount = UInt64.from(600);
    await expect(contract.invest(exceedingAmount)).rejects.toThrow(
      '投资金额已到顶'
    );
  });

  test('should reject investment after end time', async () => {
    const amount = UInt64.from(100);

    // 设置结束时间已经过去
    contract.endTime.set(UInt32.from(0));

    // 尝试在结束时间后投资，应该失败
    await expect(contract.invest(amount)).rejects.toThrow('投资事件已过期');
  });

  test('should allow withdrawal after end time by the investor', async () => {
    // 模拟提现操作
    contract.endTime.set(UInt32.from(0)); // 设置结束时间
    contract.investor.set(investor); // 设置投资人

    // 发送测试资金到合约
    const amount = UInt64.from(500);
    await contract.invest(amount);

    // 模拟提现
    await contract.withdraw();

    // 检查资金是否已退还到投资人账户
    const currentBalance = await contract.account.balance.get();
    expect(currentBalance).toEqual(UInt64.from(0)); // 合约余额应为0
  });

  test('should reject withdrawal if not called by the investor', async () => {
    const anotherPublicKey = PublicKey.fromBase58('AnotherPublicKey');
    // 设置一个不是投资者的签名
    const senderUpdate = AccountUpdate.createSigned(anotherPublicKey);

    await expect(contract.withdraw()).rejects.toThrow('签名无效'); // 这将因验证失败而抛出错误
  });

  test('should reject withdrawal before end time', async () => {
    const amount = UInt64.from(500);

    // 设置结束时间尚未到达
    contract.endTime.set(UInt32.from(100)); // 设置结束时间

    // 模拟投资
    await contract.invest(amount);

    // 提现时应该失败
    await expect(contract.withdraw()).rejects.toThrow('时间还没到');
  });
});
