/**
* 用了别人的部署脚本
* SECRET_KEY 用了 coldstar1993课程代码中的 SECRET_KEY
* 部署完毕得到 zkApp Address: B62qr2Y3At4SAkSQeh1gjhbes5JrGiSznujnE7ePQ7nwthsgtdgC6Wa
请求 https://minascan.io/devnet/account/B62qr2Y3At4SAkSQeh1gjhbes5JrGiSznujnE7ePQ7nwthsgtdgC6Wa/txs 
一直没显示交易
*/
//import config from 'dotenv';

import {
    AccountUpdate,
    Mina,
    PrivateKey,
    UInt32,
    UInt64,
    fetchAccount
} from 'o1js';
import Fund from './Crowdfunding.js';

//config.config();

const SECRET_KEY = 'SECRET_KEY 用了 coldstar1993课程代码中的 SECRET_KEY';//process.env.SECRET_KEY as string;

const network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});

Mina.setActiveInstance(network);

const deployerKey = PrivateKey.fromBase58(SECRET_KEY);
const deployer = deployerKey.toPublicKey();

console.log('编译合约')
await Fund.compile();

let zkAppKey = PrivateKey.random();
let zkAppAccount = zkAppKey.toPublicKey();
let zkApp: Fund = new Fund(zkAppAccount);

console.log('部署合约')
let txn = await Mina.transaction({
    sender: deployer,
    fee: 0.2 * 1e9,
    memo: 'deploy contract',
},
    async () => {
        AccountUpdate.fundNewAccount(deployer);
        await zkApp.deploy({
            owner: deployer,
            targetAmount: UInt64.from(1e9),
            endTime: UInt32.from(100)
        });
    });

await txn.prove();
await txn.sign([deployerKey, zkAppKey]).send().wait;
console.log('部署完成')

await fetchAccount({ publicKey: zkAppAccount });
console.log(`zkApp Address: ${zkAppAccount.toBase58()}`);
