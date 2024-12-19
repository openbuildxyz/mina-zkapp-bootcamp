import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import {CrowdFunding} from './CrowdFunding';
import {Token} from './Token';

let proofsEnabled = false;

const DECIMALS = 1e9;
const TARGET = UInt64.from(10).mul(DECIMALS);

describe('CrowdFunding', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        user: Mina.TestPublicKey,
        userKey: PrivateKey,

        crowdFundingAddress: PublicKey,
        crowdFundingKey: PrivateKey,
        crowdFunding: CrowdFunding,

        tokenOwnerAddress: PublicKey,
        tokenOwnerKey: PrivateKey,
        token: Token,
        tokenId: Field,

        Local: any;

    beforeAll(async () => {
        if (proofsEnabled) {
            await CrowdFunding.compile();
            await Token.compile();
        }
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [deployerAccount, user] = Local.testAccounts;
        deployerKey = deployerAccount.key;
        userKey = user.key;

        tokenOwnerKey = PrivateKey.random();
        tokenOwnerAddress = tokenOwnerKey.toPublicKey();

        token = new Token(tokenOwnerAddress);
        tokenId = token.deriveTokenId();

        crowdFundingKey = PrivateKey.random();
        crowdFundingAddress = crowdFundingKey.toPublicKey();

        crowdFunding = new CrowdFunding(crowdFundingAddress, tokenId);

        await localDeploy();
    });

    async function localDeploy() {
        let txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount, 2);
            await token.deploy();
        });
        await txn.prove();
        await txn.sign([tokenOwnerKey, deployerKey]).send();

        txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await crowdFunding.deploy({
                endTime: UInt32.from(100),
                targetAmount: TARGET,
                owner: deployerAccount,
            });
            await token.approveAccountUpdate(crowdFunding.self);
        });
        await txn.prove();
        await txn.sign([crowdFundingKey, deployerKey]).send();
    }

    async function transferToken() {
        const txn = await Mina.transaction(deployerAccount, async () => {
            await token.transfer(tokenOwnerAddress, crowdFundingAddress, TARGET);
        });
        await txn.prove();
        await txn.sign([tokenOwnerKey, deployerKey]).send();
        expect(Mina.getBalance(crowdFundingAddress, tokenId)).toEqual(TARGET);
    }

    it('deploy', async () => {
        expect(crowdFunding.account.balance.get()).toEqual(UInt64.from(0));
        expect(crowdFunding.getOwner()).toEqual(deployerKey.toPublicKey());
    });

    it('fund withdraw', async () => {
        await transferToken();

        let txn = await Mina.transaction(user, async () => {
            AccountUpdate.fundNewAccount(user);
            await crowdFunding.fund(TARGET);
            await token.approveAccountUpdate(crowdFunding.self);
        });
        await txn.prove();
        await txn.sign([userKey, crowdFundingKey]).send().wait();

        expect(crowdFunding.getBalance()).toEqual(TARGET);

        Local.setBlockchainLength(UInt64.from(100));

        const tokenRemain = crowdFunding.getBalance(tokenId);
        txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await crowdFunding.withdrawToken();
            await token.approveAccountUpdate(crowdFunding.self);
        });
        await txn.prove();
        await txn.sign([deployerKey, crowdFundingKey]).send().wait();

        const afterWithdrawTokenBalance = Mina.getBalance(deployerAccount, tokenId);
        expect(afterWithdrawTokenBalance).toEqual(tokenRemain);
    });
});