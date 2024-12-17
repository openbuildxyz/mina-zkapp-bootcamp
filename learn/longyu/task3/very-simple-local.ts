import fs from 'fs/promises';
import { AccountUpdate, Field, Mina, NetworkId, PrivateKey } from 'o1js';
import { CrowdFunding } from './CrowdFunding.js';

const doProofs = false;
const Local = await Mina.LocalBlockchain({
    proofsEnabled: doProofs,
});

Mina.setActiveInstance(Local);

// 是否编译合约
if (doProofs) {
    await CrowdFunding.compile();
} else {
    await CrowdFunding.analyzeMethods();
}

// 默认有十个测试账号， 并且3000个mina
let [feePayer1] = Local.testAccounts

let CrowdFundingAccout = Mina.TestPublicKey.random();
let crowdFundingInstance = new CrowdFunding(CrowdFundingAccout);

console.log('compile the contract...');
// await CrowdFundingInstance.compile();

try {
    let tx = await Mina.transaction({
        sender: feePayer1,
        fee: 0.1 * 10e9,
        memo: '初始化数据'
    }, async () => {
        AccountUpdate.fundNewAccount(feePayer1);
        await crowdFundingInstance.deploy();
    });
    await tx.prove();
    await tx.sign([feePayer1.key, CrowdFundingAccout.key]).send().wait();
    console.log('initial state:', crowdFundingInstance.x.get())
} catch (err) {
    console.log(err);
}

try {
    let tx = await Mina.transaction(feePayer1, async () => {
        await crowdFundingInstance.update(Field(20));
    });
    await tx.prove();
    await tx.sign([feePayer1.key]).send().wait();
    console.log('initial state:', crowdFundingInstance.x.get())
} catch (err) {
    console.log(err);
}

