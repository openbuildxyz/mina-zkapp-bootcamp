import {
    Field,
    Mina,
    AccountUpdate} from 'o1js';
  import { getProfiler } from '../others/utils/profiler.js';
  import { CrowdfundingZkapp } from "./crowdfunding-zkapp.js";
  
  const SimpleProfiler = getProfiler('Simple zkApp');
  SimpleProfiler.start('Simple zkApp test flow');
  
  const doProofs = true;
  let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
  Mina.setActiveInstance(Local);
  
  // 编译合约
  
  if (doProofs) {
    await CrowdfundingZkapp.compile();
  } else {
    await CrowdfundingZkapp.analyzeMethods();
  }
  
  // a test account that pays all the fees, and puts additional funds into the zkapp
  let [sender] = Local.testAccounts;// EKEdjFogmuzcAYVqYJZPuF8WmXVR1PBZ3oMA2ektLpeRJArkD4ne
  
  // the zkapp account
  let zkappAccount = Mina.TestPublicKey.random();
  let zkapp = new CrowdfundingZkapp(zkappAccount);
  
  console.log('deploy');
  let tx = await Mina.transaction({
    sender,
    fee: 0.1 * 10e9,
    memo: '一笔交易',
    // nonce: 2
  }, async () => {
    AccountUpdate.fundNewAccount(sender);// 需要为新账户创建而花费1MINA
    zkapp.deploy();// 部署前设置合约初始状态
  });
  await tx.prove();
  await tx.sign([sender.key, zkappAccount.key]).send();
  
  // console.log(tx.toPretty());
  
  console.log('initial state: ' + zkapp.x.get());
  
  let account = Mina.getAccount(zkappAccount);
  console.log(JSON.stringify(account));
  
  console.log('update x...');
  tx = await Mina.transaction(sender, async () => {
    await zkapp.update(Field(3));
  });
  await tx.prove();
  await tx.sign([sender.key]).send();
  
  const newX = zkapp.x.get();
  console.log('latest state: ' + newX);
  
  SimpleProfiler.stop().store();
  
