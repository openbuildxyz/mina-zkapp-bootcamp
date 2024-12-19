import { AccountUpdate, Mina, PrivateKey, UInt32, UInt64 } from 'o1js';
import { CrowdFunding } from './CrowdFunding.js';
import fs from 'fs/promises';

// Constants
const MINA = 1e9;
const TARGET_AMOUNT = UInt64.from(30 * MINA);
const DEPLOY_TX_FEE = 0.1 * MINA;

async function main() {
  console.log('Compiling contract...');
  await CrowdFunding.compile();

  // Load config
  const configJson = JSON.parse(await fs.readFile('config.json', 'utf8'));
  const config = configJson.deployAliases.devnet;

  // Load deployer key
  const deployerKeysJson = JSON.parse(
    await fs.readFile(config.feepayerKeyPath, 'utf8')
  );
  const deployerKey = PrivateKey.fromBase58(deployerKeysJson.privateKey);
  const deployerAccount = deployerKey.toPublicKey();

  // Generate new zkApp key
  const zkAppKey = PrivateKey.random();
  const zkAppAddress = zkAppKey.toPublicKey();

  // Save zkApp key
  await fs.writeFile(
    config.keyPath,
    JSON.stringify({
      privateKey: zkAppKey.toBase58(),
      publicKey: zkAppAddress.toBase58(),
    })
  );

  // Set up Berkeley network
  const Network = Mina.Network({
    mina: config.url,
    networkId: config.networkId,
  });
  Mina.setActiveInstance(Network);

  console.log('Deploying CrowdFunding...');
  const zkApp = new CrowdFunding(zkAppAddress);

  try {
    const endTimestamp = UInt32.from(100000); // Set appropriate end time

    const txn = await Mina.transaction(
      { sender: deployerAccount, fee: DEPLOY_TX_FEE },
      async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        await zkApp.deploy({
          beneficiary: deployerAccount, // Use deployer as beneficiary
          targetAmount: TARGET_AMOUNT,
          endTimestamp: endTimestamp
        });
      }
    );

    await txn.prove();
    const result = await txn.sign([deployerKey, zkAppKey]).send();

    console.log('Deployment successful!');
    console.log('Transaction hash:', result.hash);
    console.log('zkApp address:', zkAppAddress.toBase58());
  } catch (error) {
    console.error('Deployment failed:', error);
  }
}

main().catch(console.error);