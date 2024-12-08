import {  Mina, AccountUpdate, PrivateKey, Bool, Field, Poseidon, MerkleMap, Signature, UInt32} from 'o1js';
import { VoteApp } from './VotingCounter.js';

const useProof = false;

  // Setup Mina local blockchain
const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0];
const deployerKey = deployerAccount.key;
const senderAccount = Local.testAccounts[1];
const senderKey = senderAccount.key;

//create team member 
const teamKeys = [
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
  PrivateKey.random(),
]

const teamPubKeys = teamKeys.map((privateKey) => privateKey.toPublicKey());
//create the merkle tree
const leaves =  teamPubKeys.map((pubKey) => Poseidon.hash(pubKey.toFields()));
// leaves.map((leaf) => {
//   console.log("leaf " + leaf);
// });
let teamTree: MerkleMap = new MerkleMap();
//note: the node of tree, both key and value is public key hash 
leaves.map((pubKeyHash) => teamTree.set(pubKeyHash, pubKeyHash));

//deploy the contract 
const zkAppPrivateKey = PrivateKey.random(); //this is the owner of the contract 
const zkAppAddress = zkAppPrivateKey.toPublicKey();
const zkAppInstance = new VoteApp(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkAppInstance.deploy();
    await zkAppInstance.initState(teamTree.getRoot()); // Initialize with the whitelist tree root 
  });
  await deployTxn.prove();
  await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

//approval + 1 
  const approval = Bool(true);
  const signature = Signature.create(teamKeys[0], [approval.toField()]);
  const voteTxn0 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.vote(approval, signature, teamPubKeys[0],  teamTree.getWitness(leaves[0]));
  });

  await voteTxn0.prove();
  await voteTxn0.sign([senderKey]).send();
  let voteStatus = zkAppInstance.getVoteCounts();
  printVoteResult(voteStatus.approve, voteStatus.reject);

  //approval + 1
  const teamIndex1 = 1;
  const signature1 = Signature.create(teamKeys[1], [approval.toField()]);
  const voteTxn1 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.vote(approval, signature1, teamPubKeys[1],  teamTree.getWitness(leaves[1]));
  });  
  await voteTxn1.prove();
  await voteTxn1.sign([senderKey]).send();
  let voteStatus1 = zkAppInstance.getVoteCounts();
  printVoteResult(voteStatus1.approve, voteStatus1.reject);
  
  //reject + 1 
  const reject = Bool(false);
  const signtaure_reject = Signature.create(teamKeys[2], [reject.toField()]);
  const voteTxn2 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.vote(reject, signtaure_reject, teamPubKeys[2], teamTree.getWitness(leaves[2]));
  })
  await voteTxn2.prove();
  await voteTxn2.sign([senderKey]).send();
  let voteStatus2 = zkAppInstance.getVoteCounts();
  printVoteResult(voteStatus2.approve, voteStatus2.reject);

  // Try voting as an unauthorized member
  const unauthorizedKey = PrivateKey.random();
  const unauthorizedPubKey = unauthorizedKey.toPublicKey();
  const unauthorizedSignature = Signature.create(unauthorizedKey, [approval.toField()]);

  try {
    const unauthorizedVoteTxn = await Mina.transaction(senderAccount, async () => {
      await zkAppInstance.vote(approval, unauthorizedSignature, unauthorizedPubKey,  teamTree.getWitness(leaves[0]));
    });
    await unauthorizedVoteTxn.prove();
    await unauthorizedVoteTxn.sign([senderKey]).send();
  } catch (error: any) {
    console.log(`Unauthorized voting failed as expected: ${error.message}`);
  }
  let voteStatus3 = zkAppInstance.getVoteCounts();
  printVoteResult(voteStatus3.approve, voteStatus3.reject);

  function printVoteResult(approvalCount: UInt32, rejectCount: UInt32) {
    console.log(`Approval Votes: ${approvalCount}, Reject Votes: ${rejectCount}`);
  }
