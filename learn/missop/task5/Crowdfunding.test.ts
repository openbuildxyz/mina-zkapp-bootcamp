import { AccountUpdate, Bool, Mina, PrivateKey, UInt32, UInt64, UInt8 } from "o1js";
import { FungibleTokenAdmin } from "./FungibleTokenAdmin";
import { FungibleToken } from "./FungibleToken";
import { Crowdfunding } from "./Crowdfunding";

const localChain = await Mina.LocalBlockchain({
    proofsEnabled: true,
    enforceTransactionLimits: false
})
Mina.setActiveInstance(localChain)

console.log("FungibleTokenAdmin.compile...")
await FungibleTokenAdmin.compile();
console.log("FungibleToken.compile...")
await FungibleToken.compile();
console.log("Crowdfunding.compile...")
await Crowdfunding.compile();

const FEE = 1e8;
// 30 MINA
const HARDCAP = new UInt64(30e9);
// 30 blocks
const END_TIME = new UInt32(30);

const [deployer, operator, alexa, billy] = localChain.testAccounts
const tokenContractKey = PrivateKey.randomKeypair()
const adminContractKey = PrivateKey.randomKeypair()
const crowdContractKey = PrivateKey.randomKeypair()

const adminContract = new FungibleTokenAdmin(adminContractKey.publicKey);
const tokenContract = new FungibleToken(tokenContractKey.publicKey);
const crowdContract = new Crowdfunding(crowdContractKey.publicKey);

console.log("Deploying token contract.")
const deployTx = await Mina.transaction({
    sender: deployer,
    fee: FEE,
}, async () => {
    AccountUpdate.fundNewAccount(deployer, 4)
    await adminContract.deploy({ adminPublicKey: adminContractKey.publicKey }) //!! make adminContract account as the token Manager !!
    await tokenContract.deploy({
        symbol: "abc",
        src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts",
    })
    await tokenContract.initialize(
        adminContractKey.publicKey,
        UInt8.from(9),
        // We can set `startPaused` to `Bool(false)` here, because we are doing an atomic deployment
        // If you are not deploying the admin and token contracts in the same transaction,
        // it is safer to start the tokens paused, and resume them only after verifying that
        // the admin contract has been deployed
        Bool(false),
    )
    await crowdContract.deploy({
        hardcap: HARDCAP,
        endTime: END_TIME
    })
    await crowdContract.initialize(tokenContractKey.publicKey);
})
await deployTx.prove()
deployTx.sign([deployer.key, adminContractKey.privateKey, tokenContractKey.privateKey, crowdContractKey.privateKey])
const deployTxResult = await deployTx.send().then((v) => v.wait())
console.log("Deploy tx result:", deployTxResult.toPretty())

console.log("Minting new tokens to Alexa.")
const mintTx = await Mina.transaction({
    sender: operator,
    fee: FEE,
}, async () => {
    AccountUpdate.fundNewAccount(operator, 1)
    await tokenContract.mint(alexa, new UInt64(50e9))
})

mintTx.sign([operator.key, adminContractKey.privateKey])
await mintTx.prove()
await mintTx.send()

console.log("alexa balance:", (await tokenContract.getBalanceOf(alexa)).toString(), '\n')
describe('Crowdfunding test', () => {
    it('should prevent calling `initialize()` a second time', async () => {
        const tx = await Mina.transaction({
            sender: deployer,
            fee: FEE,
        }, async () => {
            await crowdContract.initialize(
                tokenContractKey.publicKey,
            )
        })

        await tx.prove()
        tx.sign([
            deployer.key,
            crowdContractKey.privateKey,
        ])


        await tx.send().catch((e) => {
            expect(e).toBe(true);
        })
    })

    it('should prevent calling buyFungiableToken before endTime', async () => {
        const tx = await Mina.transaction({
            sender: operator,
            fee: FEE,
        }, async () => {
            await crowdContract.buyFungiableToken(
                billy,
                alexa,
                new UInt64(1e9)
            )
        })

        tx.sign([
            operator.key,
            crowdContractKey.privateKey,
            tokenContractKey.privateKey,
        ])

        await tx.prove()
        await tx.send().catch((e) => {
            expect(e).toBe(true);
        })
    })

    it('should prevent calling buyFungiableToken if balance is less than amount', async () => {
        localChain.setBlockchainLength(END_TIME.add(1));
        const tx = await Mina.transaction({
            sender: operator,
            fee: FEE,
        }, async () => {
            await crowdContract.buyFungiableToken(
                billy,
                alexa,
                new UInt64(1e9)
            )
        })

        await tx.prove()
        tx.sign([
            operator.key,
            crowdContractKey.privateKey,
            tokenContractKey.privateKey,
        ])


        await tx.send().catch((e) => {
            expect(e).toBe(true);
        })
    })

    it('should pay successfully if balance is enough', async () => {
        localChain.setBlockchainLength(END_TIME.add(1));
        const tx = await Mina.transaction({
            sender: operator,
            fee: FEE,
        }, async () => {
            await crowdContract.buyFungiableToken(
                alexa,
                billy,
                new UInt64(1e9)
            )
        })

        await tx.prove();
        tx.sign([
            operator.key,
            crowdContractKey.privateKey,
            tokenContractKey.privateKey,
        ])

        await tx.send().then(v => v.wait())
        console.log("alexa:", (await tokenContract.getBalanceOf(alexa)).toString(), '\n')
        console.log("billy:", (await tokenContract.getBalanceOf(billy)).toString())
    })
})
