import { Field, Mina, AccountUpdate, UInt32, UInt64 } from 'o1js';
import { CrowdfundingZkapp } from './crowdfunding-zkapp.js';

const doProofs = true;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Local.setBlockchainLength(UInt32.from(1));
Mina.setActiveInstance(Local);

// 编译合约
if (doProofs) {
  await CrowdfundingZkapp.compile();
} else {
  await CrowdfundingZkapp.analyzeMethods();
}

// a test account that pays all the fees, and puts additional funds into the zkapp
let [deployer, sender] = Local.testAccounts; // EKEdjFogmuzcAYVqYJZPuF8WmXVR1PBZ3oMA2ektLpeRJArkD4ne

// the zkapp account
let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new CrowdfundingZkapp(zkappAccount);

console.log('deploy');
let tx = await Mina.transaction(
  {
    sender: deployer,
    fee: 0.1 * 10e9,
    memo: 'deploy',
  },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // fare 1MINA
    await zkapp.deploy({
      endTime: UInt32.from(4),
      hardCap: UInt64.from(100 * 10 ** 9),
      withdrawer: deployer,
    }); // initial
  }
);
await tx.prove();
await tx.sign([deployer.key, zkappAccount.key]).send();
console.log(tx.toPretty());

console.log('deposit');
Local.setBlockchainLength(UInt32.from(2));

tx = await Mina.transaction(
  { sender, fee: 0.1 * 10e9, memo: 'deposit' },
  async () => {
    await zkapp.deposit(UInt64.from(3 * 10 ** 9));
  }
);
await tx.prove();
await tx.sign([sender.key]).send();
console.log(tx.toPretty());

console.log('withdraw');
Local.setBlockchainLength(UInt32.from(8));

tx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * 10e9, memo: 'withdraw' },
  async () => {
    await zkapp.withdraw();
  }
);
await tx.prove();
await tx.sign([deployer.key]).send();
console.log(tx.toPretty());