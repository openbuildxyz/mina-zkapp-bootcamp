import Token from './Token';

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
describe("Token", () => {
    let deployAccount: Mina.TestPublicKey;
    let deployKey: PrivateKey;
    let tokenOwerAddress: PublicKey;
    let tokenKey: PrivateKey;
    let user: Mina.TestPublicKey;
    let token: Token;
    let Local: any;
    let tokenId: Field;

    beforeAll(async () => {
        if (proofsEnabled) await Token.compile();
    });

    beforeEach(async () => {
        Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);

        [deployAccount, user] = Local.testAccounts;
        deployKey = deployAccount.key;

        const pair = PrivateKey.randomKeypair();
        tokenOwerAddress = pair.publicKey;
        tokenKey = pair.privateKey;

        token = new Token(tokenOwerAddress);
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

    it("Token-transfer", async () => {
        let tx = await Mina.transaction(deployAccount, async () => {
            AccountUpdate.fundNewAccount(deployAccount);
            await token.transfer(tokenOwerAddress, user, UInt64.one);
        })

        await tx.prove();
        await tx.sign([tokenKey, deployAccount.key]).send();
        expect(Mina.getBalance(user, tokenId)).toEqual(UInt64.one);
    })

})