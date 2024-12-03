// 设计一个简单的投票统计器用于小团队内部投票，要求能累积统计出赞成票和反对票的票数考虑检查投票者属于团队成员，
// 假设队员不会重复投票请提交电路代码和测试代码。
// 通过递归zkp来累计团队内每个人的投票(赞成票和反对票)。其中，"检查投票者属于团队成员",
// 有两种方式：
//     1.可以采用 MerkleTree的Inclusion Proof做成员证明,需查阅下：https://docs.minaprotocol.com/zkapps/o1js/merkle-tree
//     2.或可以采用普通的三元表达式判断符(用于团队只有几个人的情况)

// 使用Merkle Tree来验证投票者是否属于团队成员，同时使用递归零知识证明来累计每个人的投票。
import {
  DynamicProof,
  FeatureFlags,
  Field,
  MerkleTree,
  MerkleWitness,
  Proof,
  SelfProof,
  Struct,
  VerificationKey,
  ZkProgram,
  verify,
  Provable,
  Bool,
  Poseidon,
  Void,
} from 'o1js';

// MerkleTree树高度
const treeHeight = 64;
const tree = new MerkleTree(treeHeight); // total number of leaves is 2**(treeHeight-1)
class MerkleTreeWitness extends MerkleWitness(treeHeight) {}

class MainProgramState extends Struct({
  treeRoot: Field,
  disagreed: Field,
  agreed: Field,
}) {}

const mainProgram = ZkProgram({
  name: 'mainProgram',
  publicInput: Field,
  publicOutput: MainProgramState,
  methods: {
    baseCase: {
      privateInputs: [Field, Field, MerkleTreeWitness],
      async method(
        totalNumber: Field,
        votingValue: Field, // Field(0) or Field(1)
        privateKey: Field,
        merkleWitness: MerkleTreeWitness
      ) {
        totalNumber.assertEquals(Field(1)); // constraint
        const currentRoot = merkleWitness.calculateRoot(
          Poseidon.hash([privateKey])
        );
        // 这行代码的作用是对 votingValue 进行约束，确保其值不大于1 投票只有0 1两种情况
        votingValue.assertLessThanOrEqual(Field(1));

        const v0: Field = Provable.if(
          //检查一个值是否小于或等于另一个值
          votingValue.lessThanOrEqual(0),
          Field(1),
          Field(0)
        );
        const v1: Field = Provable.if(
          // 检查一个值是否大于或等于另一个值
          votingValue.greaterThanOrEqual(1),
          Field(1),
          Field(0)
        );

        Provable.log(`treeRoot`, currentRoot);
        Provable.log(`disagreed`, v0);
        Provable.log(`agreed`, v1);

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
        votingValue: Field, // Field(0) or Field(1)
        privateKey: Field,
        merkleWitness: MerkleTreeWitness,
        earlierProof: SelfProof<Field, MainProgramState>
      ) {
        // 是否是递归证明
        earlierProof.publicInput.add(1).assertEquals(totalNumber);

        const currentRoot = merkleWitness.calculateRoot(
          Poseidon.hash([privateKey])
        );
        //是否是同一个zk程序
        earlierProof.verify();
        // 是否是MerkleTree成员
        earlierProof.publicOutput.treeRoot.assertEquals(
          currentRoot,
          'Provided merklewitness not correct or leaf not empty'
        );

        votingValue.assertLessThanOrEqual(Field(1));

        const v0: Field = Provable.if(
          votingValue.lessThanOrEqual(0),
          Field(1),
          Field(0)
        );
        const v1: Field = Provable.if(
          votingValue.greaterThanOrEqual(1),
          Field(1),
          Field(0)
        );

        Provable.log(`treeRoot`, currentRoot);
        Provable.log(`disagreed`, earlierProof.publicOutput.disagreed.add(v0));
        Provable.log(`agreed`, earlierProof.publicOutput.agreed.add(v1));

        return new MainProgramState({
          treeRoot: currentRoot,
          disagreed: earlierProof.publicOutput.disagreed.add(v0),
          agreed: earlierProof.publicOutput.agreed.add(v1),
        });
      },
    },
  },
});

// sets a value at position 0n
let key = [1000n, 1001n, 1002n, 1003n, 1004n, 1005n];
tree.setLeaf(0n, Poseidon.hash([Field(key[0])]));
tree.setLeaf(1n, Poseidon.hash([Field(key[1])]));
tree.setLeaf(2n, Poseidon.hash([Field(key[2])]));
tree.setLeaf(3n, Poseidon.hash([Field(key[3])]));
tree.setLeaf(4n, Poseidon.hash([Field(key[4])]));
tree.setLeaf(5n, Poseidon.hash([Field(key[5])]));

const mainVk = (await mainProgram.compile()).verificationKey;

let totalNumber = Field(1); //总票数
let votingValue = Field(1); // agreed
let privateKey = Field(key[0]); //验证私钥
let merkleWitness = new MerkleTreeWitness(tree.getWitness(0n));

let proof = await mainProgram.baseCase(
  totalNumber,
  votingValue,
  privateKey,
  merkleWitness
);
let ok = await mainProgram.verify(proof);
console.log('ok?', ok);

totalNumber = totalNumber.add(1);
votingValue = Field(0); // disagreed
privateKey = Field(key[1]);
merkleWitness = new MerkleTreeWitness(tree.getWitness(1n));
// 递归证明
proof = await mainProgram.inductiveCase(
  totalNumber,
  votingValue,
  privateKey,
  merkleWitness,
  proof
);

ok = await mainProgram.verify(proof);
console.log('ok?', ok);

totalNumber = totalNumber.add(1);
votingValue = Field(0); // disagreed
privateKey = Field(key[3]);
merkleWitness = new MerkleTreeWitness(tree.getWitness(3n));
proof = await mainProgram.inductiveCase(
  totalNumber,
  votingValue,
  privateKey,
  merkleWitness,
  proof
);
ok = await mainProgram.verify(proof);
console.log('ok?', ok);
