import { Mina, AccountUpdate, Field, PublicKey, MerkleTree, Poseidon, Bool, MerkleWitness } from 'o1js';
import { VotingSystem } from './VotingSystem'; // Ensure the contract is imported

type Names = 'Bob' | 'Alice' | 'Charlie' | 'Olivia';

// Initialize the local Mina blockchain
let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);
let initialBalance = 10_000_000_000;
let [feePayer] = Local.testAccounts;
let contractAccount = Mina.TestPublicKey.random();

// This map is our off-chain memory storage
let Accounts: Map<string, PublicKey> = new Map<Names, PublicKey>(
  ['Bob', 'Alice', 'Charlie', 'Olivia'].map((name: string, index: number) => {
    return [name as Names, Local.testAccounts[index + 1]];  // `+ 1` to avoid duplication with `feePayer`
  })
);

// Initialize the Merkle tree
const TREE_HEIGHT = 8;
class MemberMerkleWitness extends MerkleWitness(TREE_HEIGHT) { }
const Tree = new MerkleTree(TREE_HEIGHT);

// Set the Merkle tree leaf nodes
Tree.setLeaf(0n, Poseidon.hash(Accounts.get('Bob')!.toFields()));
Tree.setLeaf(1n, Poseidon.hash(Accounts.get('Alice')!.toFields()));
Tree.setLeaf(2n, Poseidon.hash(Accounts.get('Charlie')!.toFields()));
Tree.setLeaf(3n, Poseidon.hash(Accounts.get('Olivia')!.toFields()));

// Get the Merkle tree root
let teamMembersMerkleRoot = Tree.getRoot();

// Deploy the VotingSystem contract
let contract = new VotingSystem(contractAccount);
console.log('Deploying VotingSystem...');
await VotingSystem.compile();

let tx = await Mina.transaction(feePayer, async () => {
  AccountUpdate.fundNewAccount(feePayer).send({
    to: contractAccount,
    amount: initialBalance,
  });
  await contract.deploy();
});

await tx.prove();
await tx.sign([feePayer.key, contractAccount.key]).send();
await initRoot(teamMembersMerkleRoot);

// Initialize the team members Merkle root
async function initRoot(teamMembersMerkleRoot: Field) {
  let tx = await Mina.transaction(feePayer, async () => {
    await contract.initTeamMembersMerkleRoot(teamMembersMerkleRoot);
  });
  await tx.prove();
  await tx.sign([feePayer.key, contractAccount.key]).send();
}

// Function to cast a vote
async function makeVote(name: Names, isApprove: boolean) {
  let voterPK = Accounts.get(name)!;
  let path = Tree.getWitness(name === 'Bob' ? 0n : name === 'Alice' ? 1n : name === 'Charlie' ? 2n : 3n); // Merkle path for the name

  let tx = await Mina.transaction(feePayer, async () => {
    await contract.vote(voterPK, Bool(isApprove), new MemberMerkleWitness(path));
  });
  await tx.prove();
  await tx.sign([feePayer.key, contractAccount.key]).send();
}

// Check voting results
describe('VotingSystem', () => {
  it('should deploy VotingSystem contract successfully', async () => {
    console.log('VotingSystem...init...');
    const approveCount = await contract.approveCount.get();
    const rejectCount = await contract.rejectCount.get();
    expect(approveCount.toString()).toBe('0');
    expect(rejectCount.toString()).toBe('0');
  });
  it('should correctly update approve count', async () => {
    // Simulate voting
    console.log('Voting...approve...');
    await makeVote('Bob', true);  // Bob votes in favor
    const approveCount = await contract.approveCount.get();
    const rejectCount = await contract.rejectCount.get();
    expect(approveCount.toString()).toBe('1');  // After voting, approve count should be 1
    expect(rejectCount.toString()).toBe('0');

  });
  it('should correctly update  reject count', async () => {
    // Simulate voting
    console.log('Voting...reject...');
    await makeVote('Alice', false); // Alice votes against
    const approveCount = await contract.approveCount.get();
    const rejectCount = await contract.rejectCount.get();
    expect(approveCount.toString()).toBe('1');  // 
    expect(rejectCount.toString()).toBe('1');  // After voting, reject count should be 1
  });
});