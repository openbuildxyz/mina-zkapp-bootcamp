import ZToken from './ZToken';

import {
    AccountUpdate,
    assert,
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    UInt64
} from 'o1js';

let proofsEnabled = false;
describe("ZToken", () => {
    let deployAccount: Mina.TestPublicKey;
    let deployKey: PrivateKey;
    let tokenOwerAddress: PublicKey;
    let tokenKey: PrivateKey;
    let user: Mina.TestPublicKey;
    let token: ZToken;
    let Local: any;
    let tokenId: Field;

    beforeAll(async () => {
        if (proofsEnabled) await ZToken.compile();
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [deployAccount, user] = Local.testAccounts;
        deployKey = deployAccount.key;

        const pair = PrivateKey.randomKeypair();
        tokenOwerAddress = pair.publicKey;
        tokenKey = pair.privateKey;

        token = new ZToken(tokenOwerAddress);
        tokenId = token.deriveTokenId();

        let deployTx = await Mina.transaction(deployAccount, async () => {
            AccountUpdate.fundNewAccount(deployAccount, 2);
            await token.deploy();
        })

        await deployTx.prove();
        await deployTx.sign([tokenKey, deployKey]).send();

        assert(
            Mina.getAccount(tokenOwerAddress).zkapp?.verificationKey !== undefined,
            "token contract deployed"
        )
    });

    it("ZToken-test", async () => {
        // 转账

        let tx = await Mina.transaction(deployAccount, async () => {
            AccountUpdate.fundNewAccount(deployAccount);
            await token.transfer(tokenOwerAddress, user, UInt64.one);
        })

        await tx.prove();
        await tx.sign([tokenKey, deployAccount.key]).send();
        expect(Mina.getBalance(user, tokenId)).toEqual(UInt64.one);
    })

})