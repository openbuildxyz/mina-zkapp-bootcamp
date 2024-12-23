import { AccountUpdate, Bool, Mina, PrivateKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './CrowdFunding';
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type LocalBlockchain = UnwrapPromise<ReturnType<typeof Mina.LocalBlockchain>>;
const MINA = 1e9;
describe('本地网络部署', () => {
    let Local: LocalBlockchain,
        deployer: Mina.TestPublicKey,
        investor: Mina.TestPublicKey,
        receiver: Mina.TestPublicKey,
        zkAppAccount: PrivateKey,
        zkApp: CrowdFunding;
    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled: false });
        Mina.setActiveInstance(Local);
        [deployer, investor, receiver] = Local.testAccounts;
        zkAppAccount = PrivateKey.random();
        zkApp = new CrowdFunding(zkAppAccount.toPublicKey());
    });
    // js获取当前时间戳并增加一天时间
    async function localDeploy(target = 100, endTime = zkApp.network.timestamp.get().add(UInt64.from(1000))) {
        console.log("zkApp network timestam", zkApp.network.timestamp.get().toString());
        const txn = await Mina.transaction(deployer, async () => {
            AccountUpdate.fundNewAccount(deployer);
            await zkApp.deploy({
                receiver,
                target: UInt64.from(target * MINA),
                endTime: endTime,
            });
        });
        await txn.prove();
        await txn.sign([deployer.key, zkAppAccount]).send();
        return txn;
    }
    async function invest(amount: UInt64) {
        const txn = await Mina.transaction(investor, async () => {
            await zkApp.raise(amount);
        });
        await txn.prove();
        await txn.sign([investor.key]).send();
        return txn;
    }
    it('正常筹款', async () => {
        await localDeploy(100, zkApp.network.timestamp.get().add(UInt64.from(1000)));
        const amount = UInt64.from(10 * MINA);
        await invest(amount);
        expect(zkApp.existed.get()).toEqual(amount);
        const update = AccountUpdate.create(zkAppAccount.toPublicKey());
        expect(update.account.balance.get()).toEqual(amount);
    });
    it('取款', async () => {
        await localDeploy(20, zkApp.network.timestamp.get().add(UInt64.from(1000)));
        const amount = UInt64.from(20 * MINA);
        await invest(amount);
        // 窗口期内取款失败
        expect(async () => {
            const txn = await Mina.transaction(investor, async () => {
                await zkApp.withdraw();
            });
        }).rejects;
        Local.setBlockchainLength(UInt32.from(100));
        // 非接收人提取失败
        expect(async () => {
            const txn = await Mina.transaction(investor, async () => {
                await zkApp.withdraw();
            });
        }).rejects;
        // 正常提取
        const txns = await Mina.transaction(receiver, async () => {
            await zkApp.setEndTime(zkApp.network.timestamp.get().sub(UInt64.from(1000)))
        });
        // console.log("setEndTime time", zkApp.network.timestamp.get().toString());
        await txns.prove();
        await txns.sign([receiver.key]).send();

        const beforeBalance = AccountUpdate.create(receiver).account.balance.get();
        const txn = await Mina.transaction(receiver, async () => {
            await zkApp.withdraw();
        });
        await txn.prove();
        await txn.sign([receiver.key]).send();
        expect(zkApp.closed.get()).toEqual(Bool(true));
        expect(AccountUpdate.create(receiver).account.balance.get()).toEqual(beforeBalance.add(amount));
        // 提取后再次提取失败
        expect(async () => {
            const txn = await Mina.transaction(investor, async () => {
                await zkApp.withdraw();
            });
        }).rejects;
    });
});
