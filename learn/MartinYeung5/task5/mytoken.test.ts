import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt64 } from 'o1js';
import { MyToken } from './mytoken';

let proofsEnabled = false;

describe('MYC', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        testUser: Mina.TestPublicKey,
        tokenOwnerAddress: PublicKey,
        tokenKey: PrivateKey,
        token: MyToken,
        Local: any,
        tokenId: Field;

    beforeAll(async () => {
        if (proofsEnabled) await MyToken.compile();
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [deployerAccount, testUser] = Local.testAccounts;
        deployerKey = deployerAccount.key;

        const keypair = PrivateKey.randomKeypair();
        tokenOwnerAddress = keypair.publicKey;
        tokenKey = keypair.privateKey;

        token = new MyToken(tokenOwnerAddress);
        tokenId = token.deriveTokenId();

        // 進入 Deploy
        await localDeploy();
    });

    async function localDeploy() {
        const deployTx = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount, 2);
            await token.deploy();
        });
        await deployTx.prove();
        await deployTx.sign([tokenKey, deployerKey]).send();
    }

    it('deploy', async () => {
        expect(token.account.balance.get()).toEqual(UInt64.from(0));
    });

    it('transfer', async () => {
        const deployTx = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await token.transfer(tokenOwnerAddress, testUser, UInt64.from(100));
        });
        await deployTx.prove();
        await deployTx.sign([deployerKey, tokenKey]).send();

        expect(Mina.getBalance(testUser, tokenId)).toEqual(UInt64.from(100));
    });
});