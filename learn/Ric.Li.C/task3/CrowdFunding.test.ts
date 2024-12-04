import { Mina, UInt32, UInt64, AccountUpdate } from 'o1js';
import { getProfiler } from './utils/profiler.js';
import { CrowdFunding } from './CrowdFunding.js';
import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain.js';

const CrowdFundingProfiler = getProfiler('CrowdFunding zkApp');
CrowdFundingProfiler.start('CrowdFunding zkApp test flow');

const doProofs = true;
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

// let account = Mina.getAccount(zkappAccount);
// console.log(JSON.stringify(account));

// Get current block height
const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

console.log('Deploying CrowdFunding contract...');
let deployTx = await Mina.transaction(
  { sender: deployer, fee: 0.1 * 10e9, memo: 'Deploy CrowdFunding Contract' },
  async () => {
    AccountUpdate.fundNewAccount(deployer); // Fund the zkApp account

    zkapp.deploy({
      fundingCap: UInt64.from(1_000_000_000_000), // fundingCap: 1,000 MINA
      endTime: UInt32.from(currentSlot.add(1_000)), // endTime: current slot + 1,000 block heights
    }); // Deploy the zkApp
  }
);
await deployTx.prove();
await deployTx.sign([deployer.key, zkappAccount.key]).send();

console.log('Contract deployed. Initial state:');
console.log(
  'Total raised:',
  zkapp.totalRaised.get().div(1e9).toString(),
  'MINA'
);
console.log('Funding cap:', zkapp.fundingCap.get().div(1e9).toString(), 'MINA');
console.log('End time:', zkapp.endTime.get().toString(), 'block height');
console.log('Owner:', zkapp.owner.get().toBase58());
console.log(
  '============================================================================================='
);

CrowdFundingProfiler.stop().store();

/**
 * Helper function
 */
function formatBalance(account: TestPublicKey): string {
  return (
    (Number(Mina.getBalance(account).toBigInt()) / 1e9).toFixed(2) + ' MINA'
  );
}
