import { equal } from "node:assert"
import { AccountUpdate, Bool, Mina, PrivateKey, TokenId, UInt64, UInt8, UInt32 } from "o1js"
import { FungibleToken } from "./FungibleToken.js"
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js"



const localChain = await Mina.LocalBlockchain({
  proofsEnabled: true,
  enforceTransactionLimits: false,
})
Mina.setActiveInstance(localChain)

console.log("FungibleTokenAdmin.compile...")
await FungibleTokenAdmin.compile();
console.log("FungibleToken.compile...")
await FungibleToken.compile();

const fee = 1e8

let initialState_deadlineBlockHeight = new UInt32(376620);

const [deployer, operator, alexa, billy] = localChain.testAccounts
const tokenContractKey = PrivateKey.randomKeypair()
const adminContractKey = PrivateKey.randomKeypair()

const token = new FungibleToken(tokenContractKey.publicKey)
const tokenId = TokenId.derive(tokenContractKey.publicKey);// 计算出tokenId
const adminContract = new FungibleTokenAdmin(adminContractKey.publicKey)

console.log("Deploying token contract.")
const deployTx = await Mina.transaction({
  sender: deployer,
  fee,
}, async () => {
  AccountUpdate.fundNewAccount(deployer, 3)
  await adminContract.deploy({ adminPublicKey: adminContractKey.publicKey }) //!! make adminContract account as the token Manager !!
  await token.deploy({
    symbol: "abc",
    src: "https://github.com/MinaFoundation/mina-fungible-token/blob/main/FungibleToken.ts",
  })
  await token.initialize(
    adminContractKey.publicKey,
    UInt8.from(9),
    // We can set `startPaused` to `Bool(false)` here, because we are doing an atomic deployment
    // If you are not deploying the admin and token contracts in the same transaction,
    // it is safer to start the tokens paused, and resume them only after verifying that
    // the admin contract has been deployed
    Bool(false),
    deployer
  )
})
await deployTx.prove()
deployTx.sign([deployer.key, tokenContractKey.privateKey, adminContractKey.privateKey])
// deployTx.sign([deployer.key])
const deployTxResult = await deployTx.send().then((v) => v.wait())
// console.log("Deploy tx result:", deployTxResult.toPretty())
// equal(deployTxResult.status, "included")


console.log('alexa balance of MINA before mint: ' + Mina.getBalance(alexa));
const alexaBalanceBeforeMint = (await token.getBalanceOf(alexa)).toBigInt()
console.log("Alexa balance of token before mint:", alexaBalanceBeforeMint)
console.log("zkapp balance of token before mint:" + (await token.getBalanceOf(tokenContractKey.publicKey)).toBigInt());
equal(alexaBalanceBeforeMint, 0n)





console.log()
console.log("Alexa buy new tokens.")
const mintTx = await Mina.transaction({
  sender: alexa,
  fee,
}, async () => {
  AccountUpdate.fundNewAccount(alexa, 1);
  // await token.buy(alexa, billy, new UInt64(2e9));
  await token.buy(alexa, new UInt64(1e9));
})
await mintTx.prove()
// mintTx.sign([alexa.key, tokenContractKey.privateKey, adminContractKey.privateKey])
mintTx.sign([alexa.key])
const mintTxResult = await mintTx.send().then((v) => v.wait())
// console.log("Mint tx result:", mintTxResult.toPretty())
equal(mintTxResult.status, "included")





console.log('alexa balance of MINA after mint: ' + Mina.getBalance(alexa));
console.log("billy balance of MINA after mint:"+ Mina.getBalance(billy));
console.log(`contract balance of MINA after mint:${token.account.balance.get().div(1e9)} MINA`);
const alexaBalanceAfterMint = (await token.getBalanceOf(alexa)).toBigInt()
console.log("Alexa balance of token after mint:", alexaBalanceAfterMint)
console.log("zkapp balance of token before mint:" + (await token.getBalanceOf(tokenContractKey.publicKey)).toBigInt());

equal(alexaBalanceAfterMint, BigInt(2e9));  // token / MINA == 2


