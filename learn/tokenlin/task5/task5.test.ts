import { 
  AccountUpdate, 
  Field, 
  Mina, 
  PrivateKey, 
  PublicKey,
  UInt32,
  UInt64,
  TokenId,
  UInt8,
  Bool
 } from 'o1js';

import { FungibleToken } from './FungibleToken';
import { FungibleTokenAdmin } from "./FungibleTokenAdmin.js"

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */







let proofsEnabled = false;
const fee = 1e9;
let initialState_deadlineBlockHeight = new UInt32(376620);

describe('FungibleToken', () => {

    let deployer: Mina.TestPublicKey,
      operator: Mina.TestPublicKey,
      alexa: Mina.TestPublicKey,
      billy: Mina.TestPublicKey,
      tokenContractKey:any,
      adminContractKey: any,
      token:FungibleToken,
      tokenId:any,
      adminContract:FungibleTokenAdmin,
      Local: any;


  beforeAll(async () => {
    if (proofsEnabled) {
      await FungibleToken.compile();
      await FungibleTokenAdmin.compile();
    }
  });



  beforeEach(async () => {
    Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);


    [deployer, operator, alexa, billy] = Local.testAccounts;
    tokenContractKey = PrivateKey.randomKeypair()
    adminContractKey = PrivateKey.randomKeypair()
    
    token = new FungibleToken(tokenContractKey.publicKey)
    tokenId = TokenId.derive(tokenContractKey.publicKey);// 计算出tokenId
    adminContract = new FungibleTokenAdmin(adminContractKey.publicKey)  
  });



  async function localDeploy() {


    const deployTx = await Mina.transaction({
      sender: deployer,
      fee,
    }, async () => {
      AccountUpdate.fundNewAccount(deployer, 3)
      await adminContract.deploy({ adminPublicKey: adminContractKey.publicKey }) //!! make adminContract account as the token Manager !!
      await token.deploy({
        symbol: "task5-tokenlin",
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
    await deployTx.sign([deployer.key, tokenContractKey.privateKey, adminContractKey.privateKey]).send();
    // await deployTx.sign([deployer.key, adminContractKey.privateKey]).send();
  }



  it('Alexa buy new tokens', async () => {
    await localDeploy();

    // update transaction
    const txn = await Mina.transaction({
      sender: alexa,
      fee,
    }, async () => {
      AccountUpdate.fundNewAccount(alexa, 1);
      await token.buy(alexa, new UInt64(1e9));
    });
    await txn.prove();
    await txn.sign([alexa.key, tokenContractKey.privateKey, adminContractKey.privateKey]).send();
    

    const alexaBalanceAfterMint = (await token.getBalanceOf(alexa)).toBigInt()
    expect(alexaBalanceAfterMint).toEqual(new UInt64(2e9));  // token / MINA == 2
  
  });




});
