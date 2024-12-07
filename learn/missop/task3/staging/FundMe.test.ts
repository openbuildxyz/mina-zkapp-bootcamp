import { AccountUpdate, fetchAccount, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from "o1js";
import { FundMe } from "..";

const UNIT = 1e9
const ADD_NUM = 30;
const HARD_CAP = UInt64.from(ADD_NUM * UNIT);

describe('FundMe', () => {
    let endTime: UInt32;
    let senderKey: PrivateKey;
    let sender: PublicKey;
    let zkAppKey: PrivateKey;
    let zkAppAccount: PublicKey;
    let funeMeContract: FundMe;

    beforeEach(async () => {
        let network = Mina.Network({
            mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
            archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
        })
        Mina.setActiveInstance(network);
        senderKey = PrivateKey.fromBase58(
            ''
        );
        sender = senderKey.toPublicKey();
        console.log(`Fetching the fee payer account information.`);
        const senderAcct = await fetchAccount({ publicKey: sender });
        const accountDetails = senderAcct.account;
        console.log(
            `Using the fee payer account ${sender.toBase58()} with nonce: ${accountDetails?.nonce
            } and balance: ${accountDetails?.balance}.`
        );
        console.log('');
        await FundMe.compile();

        zkAppKey = PrivateKey.random();
        zkAppAccount = zkAppKey.toPublicKey();
        funeMeContract = new FundMe(zkAppAccount);

        const tx = await Mina.transaction({
            sender,
            fee: 0.2 * UNIT,
            memo: '一笔交易',
        }, async () => {
            endTime = network.getNetworkState().globalSlotSinceGenesis.add(ADD_NUM);
            AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
            await funeMeContract.deploy({
                hardcap: HARD_CAP,
                endTime,
                receiver: sender
            });// 部署前设置合约初始状态
        });
        await tx.prove();
        await tx.sign([senderKey, zkAppKey]).send().wait();
    });

    it('should deploy successfully', async () => {
        await fetchAccount({ publicKey: zkAppAccount });

        const _hardcap = funeMeContract.hardcap.get();
        const _endTime = funeMeContract.endTime.get();

        expect(_hardcap).toEqual(HARD_CAP);
        expect(_endTime).toEqual(endTime);
    });

    it('should fund successfully', async () => {
        await fetchAccount({ publicKey: zkAppAccount });// !!!必须
        await fetchAccount({ publicKey: sender });// !!!必须
        const tx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(1 * UNIT));
        });
        await tx.prove();
        await tx.sign([senderKey]).send().wait();
        expect(funeMeContract.balance).toEqual(1 * UNIT)
    })

    it('should not fund exceed hardcap', async () => {
        await fetchAccount({ publicKey: zkAppAccount });// !!!必须
        await fetchAccount({ publicKey: sender });// !!!必须
        const tx = await Mina.transaction(sender, async () => {
            await funeMeContract.fund(UInt64.from(ADD_NUM * UNIT));
        });
        await tx.prove();
        await tx.sign([senderKey]).send().wait();
        expect(funeMeContract.balance).toEqual(HARD_CAP)
    })

    // it('should withdraw successfully', async () => {
    //     await fetchAccount({ publicKey: zkAppAccount });// !!!必须
    //     await fetchAccount({ publicKey: sender });// !!!必须
    //     const tx = await Mina.transaction(sender, async () => {
    //         await funeMeContract.withdraw(UInt64.from(ADD_NUM * UNIT));
    //     });
    //     await tx.prove();
    //     await tx.sign([senderKey]).send().wait();
    //     expect(funeMeContract.balance).toEqual(0);
    // })
})