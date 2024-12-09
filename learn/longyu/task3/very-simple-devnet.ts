import fs from 'fs/promises';
import { AccountUpdate, Field, Mina, NetworkId, PrivateKey, fetchAccount } from 'o1js';
import { CrowdFunding } from './CrowdFunding.js';

const devnetChain = Mina.Network({
    mina: "https://api.minascan.io/node/devnet/v1/graphql/",
    archive: "https://api.minascan.io/archive/devnet/v1/graphql"
});

Mina.setActiveInstance(devnetChain);

const senderKey = PrivateKey.fromBase58('B62qkt24qwKeJa4AMYqkdnRz2Cc49DW6XrUk5eyFeyATR1QoykiMcbC');
const sender = senderKey.toPublicKey();

// 领水
// await Mina.faucet(sender);

console.log('Fetching the fee payer account information');
const senderAcc = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcc.account;

// 编译合约
console.time('compile')
await CrowdFunding.compile()
console.timeEnd('compile')

let crFunKey = PrivateKey.random();
let crFunAccount = crFunKey.toPublicKey();

let crowdFundingInstance = new CrowdFunding(crFunAccount);

console.log('compile the contract...');
// await CrowdFundingInstance.compile();

try {
    await fetchAccount({ publicKey: crFunAccount })
    let tx = await Mina.transaction({
        sender,
        fee: 0.1 * 10e9,
        memo: '初始化数据'
    }, async () => {
        AccountUpdate.fundNewAccount(sender);
        await crowdFundingInstance.deploy();
    });
    await tx.prove();
    await tx.sign([senderKey, crFunKey]).send().wait();
    console.log('initial state:', crowdFundingInstance.x.get())
} catch (err) {
    console.log(err);
}

try {
    await fetchAccount({ publicKey: crFunAccount })
    await fetchAccount({ publicKey: sender })
    let tx = await Mina.transaction(sender, async () => {
        await crowdFundingInstance.update(Field(20));
    });
    await tx.prove();
    await tx.sign([senderKey]).send().wait();
    console.log('initial state:', crowdFundingInstance.x.get())
} catch (err) {
    console.log(err);
}

