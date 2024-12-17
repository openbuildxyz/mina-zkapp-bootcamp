import { equal } from "node:assert"
import { AccountUpdate, Bool, fetchAccount, Mina, PrivateKey, TokenId, UInt64, UInt8 } from "o1js"
import { FungibleToken } from "./FungibleToken.js"
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js"



// 在项目入口文件顶部导入
import * as dotenv from 'dotenv';
dotenv.config();
// 读取环境变量
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PRIVATE_KEY_tokenContract_TASK5 = process.env.PRIVATE_KEY_tokenContract_TASK5;
const PRIVATE_KEY_adminContract_TASK5 = process.env.PRIVATE_KEY_adminContract_TASK5;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is not defined in .env file');
}
if (!PRIVATE_KEY_tokenContract_TASK5) {
  throw new Error('PRIVATE_KEY_tokenContract_TASK5 is not defined in .env file');
}
if (!PRIVATE_KEY_adminContract_TASK5) {
  throw new Error('PRIVATE_KEY_adminContract_TASK5 is not defined in .env file');
}
// console.log("PRIVATE_KEY, " + PRIVATE_KEY);







// Network configuration
const network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

console.log("FungibleTokenAdmin.compile...")
await FungibleTokenAdmin.compile();
console.log("FungibleToken.compile...")
await FungibleToken.compile();

const fee = 1e8

const deployer = Mina.TestPublicKey(PrivateKey.fromBase58(PRIVATE_KEY));// should read from config
const operator = Mina.TestPublicKey(PrivateKey.fromBase58(PRIVATE_KEY));
const alexa = Mina.TestPublicKey(PrivateKey.fromBase58(PRIVATE_KEY));


const tokenContractKey = {
    privateKey: PrivateKey.fromBase58(PRIVATE_KEY_tokenContract_TASK5),
    publicKey: PrivateKey.fromBase58(PRIVATE_KEY_tokenContract_TASK5).toPublicKey()
}
const adminContractKey = {
    privateKey: PrivateKey.fromBase58(PRIVATE_KEY_adminContract_TASK5),
    publicKey: PrivateKey.fromBase58(PRIVATE_KEY_adminContract_TASK5).toPublicKey()
}


const token = new FungibleToken(tokenContractKey.publicKey)
const tokenId = TokenId.derive(tokenContractKey.publicKey);// 计算出tokenId
console.log('tokenId: ', tokenId.toString());
const adminContract = new FungibleTokenAdmin(adminContractKey.publicKey)





console.log("Deploying token contract...")
const deployTx = await Mina.transaction({
  sender: deployer,
  fee,
}, async () => {
  AccountUpdate.fundNewAccount(deployer, 3)
  await adminContract.deploy({ adminPublicKey: adminContractKey.publicKey })//!! make adminContract account as the token Manager !!
  await token.deploy({
    symbol: "TASK5",
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
const deployTxResult = await deployTx.send().then((v) => v.wait())
console.log("Deploy tx result:", deployTxResult.toPretty())
equal(deployTxResult.status, "included")

console.log('fetching account from devnet...');
await fetchAccount({ publicKey: deployer });
await fetchAccount({ publicKey: tokenContractKey.publicKey });
await fetchAccount({ publicKey: tokenContractKey.publicKey, tokenId });
await fetchAccount({ publicKey: adminContractKey.publicKey });

const alexaBalanceBeforeMint = (await token.getBalanceOf(alexa)).toBigInt()
console.log("Alexa balance before mint:", alexaBalanceBeforeMint)
equal(alexaBalanceBeforeMint, 0n)






console.log()
console.log("Minting new tokens to Alexa...")
const mintTx = await Mina.transaction({
  sender: alexa,
  fee,
}, async () => {
  AccountUpdate.fundNewAccount(alexa, 1);
  await token.buy(alexa, new UInt64(1e9));
})
await mintTx.prove()
mintTx.sign([alexa.key, tokenContractKey.privateKey, adminContractKey.privateKey])
const mintTxResult = await mintTx.send().then((v) => v.wait())
console.log("Mint tx result:", mintTxResult.toPretty())
equal(mintTxResult.status, "included")

console.log()
console.log('fetching account from devnet...');
await fetchAccount({ publicKey: deployer });
await fetchAccount({ publicKey: tokenContractKey.publicKey });
await fetchAccount({ publicKey: tokenContractKey.publicKey, tokenId });
await fetchAccount({ publicKey: adminContractKey.publicKey });
await fetchAccount({ publicKey: alexa });
await fetchAccount({ publicKey: alexa, tokenId });

const alexaBalanceAfterMint = (await token.getBalanceOf(alexa)).toBigInt()
console.log("Alexa balance after mint:", alexaBalanceAfterMint)
equal(alexaBalanceAfterMint, BigInt(2e9))

