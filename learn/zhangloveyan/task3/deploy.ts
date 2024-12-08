import config from 'dotenv';

import {
    AccountUpdate,
    Mina,
    PrivateKey,
    UInt32,
    UInt64,
    fetchAccount
} from 'o1js';
import Fund from './Fund.js';

config.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

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