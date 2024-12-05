import {
    Field,
    PrivateKey,
    Mina,
    AccountUpdate,
    fetchAccount,
    UInt64,
    UInt32
} from 'o1js';
import { getProfiler } from './profiler.js';
import { CrowdFunding } from './crowd-funding.js';

const SimpleProfiler = getProfiler('CrowdFunding zkApp');
SimpleProfiler.start('CrowdFunding zkApp test flow');

// Network configuration
const network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
});
Mina.setActiveInstance(network);

// Fee payer setup
const senderKey = PrivateKey.fromBase58('SECRET_KEY');
const sender = senderKey.toPublicKey();
// console.log(`Funding the fee payer account.`);
// await Mina.faucet(sender);// 领水

console.log(`Fetching the fee payer account information.`);
const senderAcct = await fetchAccount({ publicKey: sender });
const accountDetails = senderAcct.account;
console.log(
    `Using the fee payer account ${sender.toBase58()} with nonce: ${accountDetails?.nonce
    } and balance: ${accountDetails?.balance}.`
);
console.log('');

// 编译合约
console.log('compile');
console.time('compile');
await CrowdFunding.compile();
console.timeEnd('compile');

// the zkapp account
let zkappKey = PrivateKey.random();
let zkappAccount = zkappKey.toPublicKey();
let zkapp = new CrowdFunding(zkappAccount);

console.log('deploy...');
let tx = await Mina.transaction({
    sender,
    fee: 0.2 * 10e9,
    memo: 'deploy',
    // nonce: 2
}, async () => {
    AccountUpdate.fundNewAccount(sender);
    zkapp.deploy({
        verificationKey: undefined,
        privileged: sender
    });
});
await tx.prove();
await tx.sign([senderKey, zkappKey]).send().wait();

await fetchAccount({ publicKey: zkappAccount });
console.log('initial state--- \n', 
    'privileged:    ', zkapp.privileged.get().toBase58(),
    '\nfundGoal:   ',zkapp.fundGoal.get().toString(),
    '\nendTime:   ', zkapp.endTime.get().toString(), '\n-----------');
await fetchAccount({ publicKey: sender });

console.log('fund 1 Mina ...');
tx = await Mina.transaction({
    sender,
    fee: 0.2 * 10 ** 9,
    memo: 'fund 1 Mina',
    // nonce: 2
}, async () => {
    await zkapp.fund(UInt64.from(1e9));
});
await tx.prove();
await tx.sign([senderKey]).send().wait();

await fetchAccount({ publicKey: zkappAccount });
console.log('current balance: ' + zkapp.account.balance.get());

SimpleProfiler.stop().store();
