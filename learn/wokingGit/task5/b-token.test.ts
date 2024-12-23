import { Mina, PrivateKey, PublicKey, AccountUpdate, AccountUpdateForest, UInt64, TokenContract } from 'o1js';
import { WToken } from './WToken';

describe('WToken', () => {
  let sender: PrivateKey;
  let tokenContract: WToken;
  let SUPPLY: UInt64;

  beforeAll(async () => {
    // 创建测试账户
    sender = PrivateKey.fromBase58('your-private-key'); // 替换为有效的私钥
    SUPPLY = UInt64.from(10n ** 18n);

    // 部署 token 合约
    tokenContract = new WToken(sender);
    await tokenContract.deploy();
  });

  it('should deploy the contract and set token symbol', async () => {
    const tokenSymbol = await tokenContract.account.tokenSymbol.get();
    expect(tokenSymbol).toEqual('WTK');
  });

  it('should initialize the contract and mint tokens', async () => {
    // 模拟初始化操作
    await tokenContract.init();

    // 获取合约账户的余额
    const currentBalance = await tokenContract.account.balance.get();
    expect(currentBalance.toString()).toEqual(SUPPLY.toString());

    // 确保在初始化时铸币操作被调用
    console.log('铸币成功');
  });

  it('should approve base with no balance change', async () => {
    const updates = new AccountUpdateForest();
    // 模拟检查没有余额变化
    await tokenContract.approveBase(updates);
  });

  it('should fail if balance change is not zero in approveBase', async () => {
    const updates = new AccountUpdateForest();
    // 模拟非法的账户更新
    updates.add({ from: sender.publicKey, to: sender.publicKey, amount: UInt64.from(100n) });

    try {
      await tokenContract.approveBase(updates);
    } catch (error) {
      expect(error.message).toContain('Zero balance change check failed');
    }
  });
});
