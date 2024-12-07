import { AccountUpdate, Field, Mina, PrivateKey, PublicKey, UInt32, UInt64 } from 'o1js';
import { Crowdfunding } from './Crowdfunding';

let contract: Crowdfunding, txn;
// Initialize the local Mina blockchain
let Local = await Mina.LocalBlockchain({ proofsEnabled: false });
Mina.setActiveInstance(Local);
let initialBalance = 10_000_000_000;
let [feePayer] = Local.testAccounts;
let contractAccount = Mina.TestPublicKey.random();
Local.setBlockchainLength(UInt32.from(1000));
// Deploy the Crowdfunding contract
contract = new Crowdfunding(contractAccount);
console.log('Deploying Crowdfunding...');
await Crowdfunding.analyzeMethods();

let tx = await Mina.transaction(feePayer, async () => {
  AccountUpdate.fundNewAccount(feePayer).send({
    to: contractAccount,
    amount: initialBalance,
  });
  await contract.deploy();
});

await tx.prove();
await tx.sign([feePayer.key, contractAccount.key]).send();

describe('Crowdfunding zkApp', () => {
  test('should allow investment before deadline', async () => {
    // Set a future deadline (in seconds, rounded down)
    const deadline = Field(Math.floor(Date.now() / 1000) + 1000000); // Future deadline
    console.log("deadline =>" + deadline);

    // Set the contract's deadline
    txn = await Mina.transaction(feePayer, async () => {
      await contract.setDeadline(UInt32.from(10000));
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    // Define the amount to invest
    const amountToInvest = UInt64.from(50000); // Investment amount as UInt64
    console.log("amountToInvest =>", amountToInvest.toString());

    // Call the invest method
    txn = await Mina.transaction(feePayer, async () => {
      await contract.invest(amountToInvest);
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    const totalRaised = contract.totalRaised.get();

    expect(totalRaised.toString()).toEqual("50000");
  });

  test('should allow withdraw after crowdfunding is closed', async () => {
    const deadline = Field(Math.floor(Date.now() / 1000) + 100000); // 设置未来的截止时间

    // Call the setDeadline method
    txn = await Mina.transaction(feePayer, async () => {
      await contract.setDeadline(UInt32.from(10000));
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    const amountToInvest = UInt64.from(50000);
    // Call the invest method
    txn = await Mina.transaction(feePayer, async () => {
      await contract.invest(amountToInvest);
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    // Call the closeCrowdfunding method
    txn = await Mina.transaction(feePayer, async () => {
      await contract.closeCrowdfunding();//关闭众筹
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    const withdrawAmount = UInt64.from(50000);

    // Call the withdraw method
    txn = await Mina.transaction(feePayer, async () => {
      await contract.withdraw(withdrawAmount);
    });
    await txn.prove();
    await txn.sign([feePayer.key, contractAccount.key]).send();

    const totalRaised = await contract.totalRaised.get();
    expect(totalRaised.toString()).toEqual('50000');
  });


});