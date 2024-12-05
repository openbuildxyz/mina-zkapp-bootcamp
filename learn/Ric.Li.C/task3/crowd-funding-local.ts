import { Mina, UInt32, UInt64, AccountUpdate } from 'o1js';
import { getProfiler } from './utils/profiler.js';
import { CrowdFunding } from './crowd-funding.js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain.js';

const CrowdFundingProfiler = getProfiler('CrowdFunding zkApp');
CrowdFundingProfiler.start('CrowdFunding zkApp test flow');

const doProofs = false;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// Compile contract
if (doProofs) {
  await CrowdFunding.compile();
} else {
  await CrowdFunding.analyzeMethods();
}

// Test account setup
let [deployer, donor1, donor2, beneficiary] = Local.testAccounts; // Test accounts for deployer/owner, donors and beneficiary

// Show accounts and initial balances
console.log(
  '============================================================================================='
);
console.log('Accounts and Initial Balances:');
console.log('deployer   :', deployer.toBase58());
console.log('           :', formatBalance(deployer));
console.log('donor1     :', donor1.toBase58());
console.log('           :', formatBalance(donor1));
console.log('donor2     :', donor2.toBase58());
console.log('           :', formatBalance(donor2));
console.log('beneficiary:', beneficiary.toBase58());
console.log('           :', formatBalance(beneficiary));
console.log(
  '============================================================================================='
);

let zkappAccount = Mina.TestPublicKey.random();
let zkapp = new CrowdFunding(zkappAccount);

// Get current block height
const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('Deploying CrowdFunding contract...');
let deployTx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * 1e9, memo: 'Deploy CrowdFunding Contract' },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // Fund the zkApp account

    await zkapp.deploy({
      fundingCap: UInt64.from(1_000_000_000_000), // fundingCap: 1,000 MINA
      endTime: UInt32.from(currentSlot.add(1_000)), // endTime: current slot + 1,000 block heights
      owner: deployer, // owner: deployer
    }); // Deploy the zkApp
  }
);
await deployTx.prove();
await deployTx.sign([deployer.key, zkappAccount.key]).send();

console.log('Contract deployed.');
console.log('');
console.log('Initial state:');
console.log(
  'Total raised         :',
  zkapp.totalRaised.get().div(1e9).toString(),
  'MINA'
);
console.log(
  'Funding cap          :',
  zkapp.fundingCap.get().div(1e9).toString(),
  'MINA'
);
console.log(
  'End time             :',
  zkapp.endTime.get().toString(),
  'block height'
);
console.log('Owner                :', zkapp.owner.get().toBase58());
console.log('');
console.log('Contract balance     :', formatBalance(zkappAccount));
console.log('Deployer balance     :', formatBalance(deployer));
console.log(
  'Current block height :',
  Local.getNetworkState().globalSlotSinceGenesis.toString()
);
console.log(
  '============================================================================================='
);

// Donor 1 contributes to the campaign
console.log('Donor 1 contributes 300 MINA...');
let contributeTx1 = await Mina.transaction(
  { sender: donor1, fee: 0.1 * 1e9, memo: 'Donor 1 contribution' },
  async () => {
    await zkapp.contribute(UInt64.from(300 * 1e9)); // Donor 1 contributes 300 MINA
  }
);
await contributeTx1.prove();
await contributeTx1.sign([donor1.key]).send();

console.log('');
console.log('After Donor 1 contribution:');
console.log(
  'Total raised     :',
  zkapp.totalRaised.get().div(1e9).toString(),
  'MINA'
);
console.log('Contract balance :', formatBalance(zkappAccount));
console.log('Donor1 balance   :', formatBalance(donor1));
console.log(
  '============================================================================================='
);

// Donor 2 contributes to the campaign
console.log('Donor 2 contributes 900 MINA...');
let contributeTx2 = await Mina.transaction(
  { sender: donor2, fee: 0.1 * 1e9, memo: 'Donor 2 contribution' },
  async () => {
    await zkapp.contribute(UInt64.from(900 * 1e9)); // Donor 2 contributes 900 MINA
  }
);
await contributeTx2.prove();
await contributeTx2.sign([donor2.key]).send();

console.log('');
console.log('After Donor 2 contribution:');
console.log(
  'Total raised     :',
  zkapp.totalRaised.get().div(1e9).toString(),
  'MINA'
);
console.log('Contract balance :', formatBalance(zkappAccount));
console.log('Donor2 balance   :', formatBalance(donor2));
console.log(
  '============================================================================================='
);

// Owner withdraws funds after the funding period ends
console.log('Simulating end of funding period...');
// Local.incrementGlobalSlot(1_001);
// console.log(
//   'Current block height:',
//   Local.getNetworkState().globalSlotSinceGenesis.toString()
// );
Local.setBlockchainLength(UInt32.from(1_001));

console.log('Owner withdraws funds...');
let withdrawTx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * 1e9, memo: 'Owner withdrawal' },
  async () => {
    await zkapp.withdraw(beneficiary); // Owner withdraws funds to beneficiary's address
  }
);
await withdrawTx.prove();
await withdrawTx.sign([deployer.key]).send();

console.log('');
console.log('After withdrawal:');
console.log('Contract balance     :', formatBalance(zkappAccount));
console.log('Beneficiary balance  :', formatBalance(beneficiary));
console.log('Funds successfully withdrawn.');
console.log(
  '============================================================================================='
);

// Show final balances
console.log('Final Balances:');
console.log('deployer     :', formatBalance(deployer));
console.log('donor1       :', formatBalance(donor1));
console.log('donor2       :', formatBalance(donor2));
console.log('beneficiary  :', formatBalance(beneficiary));
console.log(
  '============================================================================================='
);

let account = Mina.getAccount(zkappAccount);
console.log(JSON.stringify(account));

CrowdFundingProfiler.stop().store();

/**
 * Helper function
 */
function formatBalance(account: TestPublicKey): string {
  return (
    (Number(Mina.getBalance(account).toBigInt()) / 1e9).toFixed(2) + ' MINA'
  );
}
