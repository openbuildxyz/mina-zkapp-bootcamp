import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../');
dotenvConfig({ path: resolve(projectRoot, '.env') });

import {
    PrivateKey,
    Mina,
    AccountUpdate,
    fetchAccount,
    UInt64,
    UInt32,
} from 'o1js';
import { CrowdFunding } from '../src/index.js';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error("SECRET_KEY env not found");
}
const network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

const deployerKey = PrivateKey.fromBase58(SECRET_KEY);
const deployer = deployerKey.toPublicKey();

const deployerAccount = await fetchAccount({ publicKey: deployer });
console.log(`Using the network ${network.getNetworkId()}`);
console.log(`Deploy wallet Address: ${deployer.toBase58()}`);
console.log(`Wallet Nonce: ${deployerAccount.account?.nonce}`);
console.log(`Wallet Balance: ${deployerAccount.account?.balance}`);

console.time('Compile CrowdFunding');
await CrowdFunding.compile();
console.timeEnd('Compile CrowdFunding');

let zkAppKey = PrivateKey.random();
let zkAppAccount = zkAppKey.toPublicKey();
let zkApp = new CrowdFunding(zkAppAccount);

console.time('Deploy');
let tx = await Mina.transaction({
    sender: deployer,
    fee: 0.2 * 1e9,
    memo: 'Deploy',
}, async () => {
    AccountUpdate.fundNewAccount(deployer);
    await zkApp.deploy({
        verificationKey: undefined,
        deadline: UInt32.from(1000000),
        minimumInvestment: UInt64.from(1e9),
        hardCap: UInt64.from(10e9),
    });
});
await tx.prove();
await tx.sign([deployerKey, zkAppKey]).send().wait();
console.timeEnd('Deploy');

await fetchAccount({ publicKey: zkAppAccount });
console.log(`zkApp Address: ${zkAppAccount.toBase58()}`);
console.log(`zkApp deadline: ${zkApp.getDeadline().toString()}`);
console.log(`zkApp minimumInvestment: ${zkApp.getMinimumInvestment().toString()}`);
console.log(`zkApp hardCap: ${zkApp.getHardCap().toString()}`);
console.log(`zkApp investors: ${zkApp.getInvestor().toBase58()}`);
console.log(`zkApp balance: ${zkApp.account.balance.get().toString()}`);
