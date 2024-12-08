import { Mina, AccountUpdate, PrivateKey, UInt32, UInt64, PublicKey, fetchAccount } from 'o1js';
import { Funding } from './Add.js';

const useProof = true;

// 配置 Mina 网络
const DEVNET = Mina. Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql/',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql/'
    }) ;
Mina.setActiveInstance(DEVNET);

async function getCurrentBlockHeight() {
    // const query = `
    //   query {
    //     bestChain(limit: 1) {
    //       protocolState {
    //         blockchainState {
    //           blockchainLength
    //         }
    //       }
    //     }
    //   }
    // `;
    const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query {
                    bestChain(maxLength: 1) {
                        protocolState {
                            consensusState {
                                blockHeight
                            }
                        }
                    }
                }
            `
        }),
    });
    // const response = await fetch('https://api.minascan.io/node/devnet/v1/graphql/', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ query }),
    // });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch block height. HTTP status: ${response.status}`);
    }
  
    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }
  
    const currentBlock = data.data.bestChain[0]?.protocolState.consensusState.blockHeight;
    if (!currentBlock) {
      throw new Error('Unable to retrieve the current block height from the response.');
    }
  
    console.log(`Current block height: ${currentBlock}`);
    return parseInt(currentBlock);
  }

(async () => {
  // 检查账户
//   const deployerKey = PrivateKey.random(); // 部署者私钥
//   const deployerAddress = deployerKey.toPublicKey();
//   const zkAppPrivateKey = PrivateKey.random(); // zkApp 合约私钥
//   const zkAppAddress = zkAppPrivateKey.toPublicKey();

//   console.log(`Deployer address: ${deployerAddress.toBase58()}`);
//   console.log(`zkApp address: ${zkAppAddress.toBase58()}`);
const deployerKey = PrivateKey.fromBase58(''); 

const deployerAddress = deployerKey.toPublicKey();
console.log(`Using pre-funded test wallet: ${deployerAddress.toBase58()}`);

const senderAct = await fetchAccount({ publicKey: deployerAddress });
const accountDetails = senderAct.account;
console.log(
`Using the fee payer account ${deployerAddress.toBase58()} with nonce: ${
accountDetails?.nonce
}and balance: ${accountDetails?.balance}`
);
//complie the contract 
console.log("开始编译合约");
console.time("编译合约");
await Funding.compile();
console.timeEnd("编译合约");


const zkAppPrivateKey = PrivateKey.fromBase58('');

const zkAppAddress = zkAppPrivateKey.toPublicKey();
console.log(`zkApp address: ${zkAppAddress.toBase58()}`);

//compile the contract

// 检查部署者账户余额是否足够
  const deployerAccount = await fetchAccount({ publicKey: deployerAddress });
  if (!deployerAccount.account) {
    throw new Error(`Deployer account not found on the network. Please fund it first.`);
  }
  console.log(`Deployer account balance: ${deployerAccount.account.balance.div(1e9).toString()} MINA`);

// 检查 zkApp 合约账户余额是否足够
    const zkAppAccount = await fetchAccount({ publicKey: zkAppAddress });
    if (!zkAppAccount.account) {
      throw new Error(`zkApp account not found on the network. Please fund it first.`);
    }
    console.log(`zkApp account balance: ${zkAppAccount.account.balance.div(1e9).toString()} MINA`);

  // 初始化 zkApp 实例
  const zkAppInstance = new Funding(zkAppAddress);

  //获取当前区块高度
  let currentBlockHeight: UInt32;
  try {
    const tmp = await getCurrentBlockHeight();
    currentBlockHeight = UInt32.from(tmp);
    console.log(`The current block height is: ${currentBlockHeight}`);
  } catch (error: any) {
    console.error(`Error fetching block height: ${error.message}`);
    return;
  }

  console.log("trying to get the current block");
  //const currentBlock = zkAppAccount.account.blockchainLength;
  console.log(`Current block height: ${currentBlockHeight.toString()}`);

  // 设置众筹参数
  const deadline = UInt64.from(currentBlockHeight.add(UInt32.from(100))); // 当前块高度 + 10
  const beneficiaryKey = PrivateKey.fromBase58('');

  const beneficiaryPublicKey = beneficiaryKey.toPublicKey();
  const hardCap = UInt64.from(100 * 1e9); // 众筹目标金额：100 MINA
  console.log('beneficiaryKey',beneficiaryKey);
  console.log(`Beneficiary: ${beneficiaryPublicKey.toBase58()}`);
  console.log(`Hard cap: ${hardCap.div(1e9).toString()} MINA`);
  console.log(`Deadline: ${deadline.toString()}`);

   await fetchAccount({ publicKey: deployerAddress });

  // 部署 zkApp 合约
  const deployTxn = await Mina.transaction({
    
    sender: deployerAddress, fee: UInt64.from(5e9) }, async () => {
    //AccountUpdate.fundNewAccount(deployerAddress); // 为新账户提供资金
    zkAppInstance.deploy();
    await zkAppInstance.initFunding(hardCap, deadline, beneficiaryPublicKey);
  });

  await deployTxn.prove();
  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send().wait();
  console.log('zkApp deployed successfully.');
  // 获取交易哈希
const txInfo = deployTxn.toPretty();
const txHash = txInfo.transactionHash;
console.log(`Deployment transaction info: ${txInfo}`);
console.log(`Deployment transaction hash: ${txHash}`);
console.log(`View the transaction on Mina Explorer: https://explorer.minaprotocol.com/tx/${txHash}`);

  await fetchAccount({ publicKey: zkAppAddress });
  await fetchAccount({ publicKey: deployerAddress });

  // 验证部署结果
  console.log(`zkApp total raised: ${zkAppInstance.totalRaised.get().toString()}`);
  console.log(`zkApp hard cap: ${zkAppInstance.hardCap.get().div(1e9).toString()} MINA`);
  console.log(`zkApp beneficiary: ${zkAppInstance.beneficiary.get().toBase58()}`);
  console.log(`zkApp deadline: ${zkAppInstance.deadline.get().toString()}`);

  // 测试众筹
  const senderKey = deployerKey;
  const senderAddress = senderKey.toPublicKey();
  console.log(`Sender address: ${senderAddress.toBase58()}`);

  const amount = UInt64.from(1 * 1e9); // 众筹 10 MINA
  const contributeTxn = await Mina.transaction({ sender: senderAddress, fee: UInt64.from(1e9) }, async () => {
    await zkAppInstance.contribute(amount, senderAddress);
  });
  await contributeTxn.prove();
  await contributeTxn.sign([senderKey]).send();
  console.log(`Contributed 10 MINA successfully.`);

  // 验证众筹余额
  console.log(`zkApp total raised after contribution: ${zkAppInstance.totalRaised.get().div(1e9).toString()} MINA`);
  await fetchAccount({ publicKey: zkAppAddress });
  await fetchAccount({ publicKey: deployerAddress });

  // 
})();
