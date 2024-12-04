import {
  Field,
  MerkleTree,
  MerkleWitness,
  SelfProof,
  Struct,
  ZkProgram,
  Provable,
  Poseidon,
} from 'o1js';

const treeHeight = 64;
const tree = new MerkleTree(treeHeight);
class MerkleTreeWitness extends MerkleWitness(treeHeight) { }

class MainProgramState extends Struct({
  treeRoot: Field,
  disagreed: Field,
  agreed: Field
}) { }

const mainProgram = ZkProgram({
  name: 'mainProgram',
  publicInput: Field,
  publicOutput: MainProgramState,
  methods: {
    baseCase: {
      privateInputs: [Field, Field, MerkleTreeWitness],
      async method(
        totalNumber: Field,
        votingValue: Field,  // Field(0) or Field(1)
        privateKey: Field,
        merkleWitness: MerkleTreeWitness,
      ) {
        totalNumber.assertEquals(Field(1));// constraint

        const currentRoot = merkleWitness.calculateRoot(Poseidon.hash([privateKey]));

        votingValue.assertLessThanOrEqual(Field(1));

        const v0: Field = Provable.if(votingValue.lessThanOrEqual(0), Field(1), Field(0));
        const v1: Field = Provable.if(votingValue.greaterThanOrEqual(1), Field(1), Field(0));

        return new MainProgramState({
          treeRoot: currentRoot,
          disagreed: v0,
          agreed: v1,
        });

      },
    },

    inductiveCase: {
      privateInputs: [Field, Field, MerkleTreeWitness, SelfProof],
      async method(
        totalNumber: Field,
        votingValue: Field,  // Field(0) or Field(1)
        privateKey: Field,
        merkleWitness: MerkleTreeWitness,
        earlierProof: SelfProof<Field, MainProgramState>
      ) {
        earlierProof.publicInput.add(1).assertEquals(totalNumber);

        const currentRoot = merkleWitness.calculateRoot(Poseidon.hash([privateKey]));

        earlierProof.verify();

        earlierProof.publicOutput.treeRoot.assertEquals(
          currentRoot,
          'Provided merklewitness not correct or leaf not empty'
        );

        votingValue.assertLessThanOrEqual(Field(1));

        const v0: Field = Provable.if(votingValue.lessThanOrEqual(0), Field(1), Field(0));
        const v1: Field = Provable.if(votingValue.greaterThanOrEqual(1), Field(1), Field(0));

        return new MainProgramState({
          treeRoot: currentRoot,
          disagreed: earlierProof.publicOutput.disagreed.add(v0),
          agreed: earlierProof.publicOutput.agreed.add(v1),
        });
      },
    },
  },
});

let key = [1000n, 1001n, 1002n, 1003n, 1004n, 1005n]
tree.setLeaf(0n, Poseidon.hash([Field(key[0])]));
tree.setLeaf(1n, Poseidon.hash([Field(key[1])]));
tree.setLeaf(2n, Poseidon.hash([Field(key[2])]));
tree.setLeaf(3n, Poseidon.hash([Field(key[3])]));
tree.setLeaf(4n, Poseidon.hash([Field(key[4])]));
tree.setLeaf(5n, Poseidon.hash([Field(key[5])]));

console.log();
console.log();
console.log('Compiling task2 circuits...');
console.time('MyProgram.compile time cost ');
const mainVk = (await mainProgram.compile()).verificationKey;
console.timeEnd('MyProgram.compile time cost ');

console.log();
console.log();
console.log('proving base case...');
console.time('MyProgram.baseCase time cost ');
let totalNumber = Field(1);
let votingValue = Field(1); // agreed
let privateKey = Field(key[0]);
let merkleWitness = new MerkleTreeWitness(tree.getWitness(0n));
let proof = await mainProgram.baseCase(totalNumber, votingValue, privateKey, merkleWitness);
console.timeEnd('MyProgram.baseCase time cost ');
console.log('verify...');
console.time('verify MyProgram time cost ');
let ok = await mainProgram.verify(proof);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);
console.log();
console.log();
console.log('proving inductiveCase...');
console.time('MyProgram.inductiveCase time cost ');
totalNumber = totalNumber.add(1);
votingValue = Field(0); // disagreed
privateKey = Field(key[1]);
merkleWitness = new MerkleTreeWitness(tree.getWitness(1n));
proof = await mainProgram.inductiveCase(totalNumber, votingValue, privateKey, merkleWitness, proof);
console.timeEnd('MyProgram.inductiveCase time cost ');
console.log('verify...');
console.time('verify MyProgram time cost ');
ok = await mainProgram.verify(proof);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);

console.log();
console.log();
console.log('proving inductiveCase...');
console.time('MyProgram.inductiveCase time cost ');
totalNumber = totalNumber.add(1);
votingValue = Field(0); // disagreed
privateKey = Field(key[3]);
merkleWitness = new MerkleTreeWitness(tree.getWitness(3n));
proof = await mainProgram.inductiveCase(totalNumber, votingValue, privateKey, merkleWitness, proof);
console.timeEnd('MyProgram.inductiveCase time cost ');
console.log('verify...');
console.time('verify MyProgram time cost ');
ok = await mainProgram.verify(proof);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);
