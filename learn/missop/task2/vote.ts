import { Field,MerkleWitness, MerkleTree, ZkProgram, Poseidon, Struct, Provable, SelfProof, Bool } from 'o1js';

class MerkleTreeWitness extends MerkleWitness(64) {}
class VoteResult extends Struct({
  // 用于验证团队成员
  treeRoot: Field,
  approveNum:Field,
  disApproveNum:Field
}) {}

const Vote = ZkProgram({
  name: 'vote',
  publicInput:Field, // publicInput 是团队成员的个数
  publicOutput:VoteResult,
  methods: {
    init:{
      privateInputs:[Field], // 输入一个 treeRoot
      async method(total:Field,treeRoot:Field){
        total.assertEquals(Field(0));
        
        return new VoteResult({
          treeRoot,
          approveNum:Field(0),
          disApproveNum:Field(0)
        })
      }
    },
    execute:{
      privateInputs:[
        Field,
        Field,
        MerkleTreeWitness,
        SelfProof<Field,VoteResult>
      ],
      async method(
        total:Field,
        voteStatus:Field,
        account:Field,
        path:MerkleTreeWitness,
        earierProof:SelfProof<Field,VoteResult>
      ){
        earierProof.verify();
        // total是最外层声明的 publicInput，这里是上一次的输入
        earierProof.publicInput.add(1).assertEquals(total);
        // voteStatus 是投票状态，0 表示反对，1 表示赞成
        Bool.or(voteStatus.equals(Field(0)),voteStatus.equals(Field(1))).assertTrue();
        // 验证 account
        const {publicOutput} = earierProof;
        path.calculateRoot(Poseidon.hash([account])).assertEquals(publicOutput.treeRoot);

        const newApproveNum = Provable.if(
          voteStatus.equals(Field(1)),
          publicOutput.approveNum.add(1),
          publicOutput.approveNum
        );
        const newDisApproveNum = Provable.if(
          voteStatus.equals(Field(0)),
          publicOutput.disApproveNum.add(1),
          publicOutput.disApproveNum
        );
        return new VoteResult({
          treeRoot:publicOutput.treeRoot,
          approveNum:newApproveNum,
          disApproveNum:newDisApproveNum
        })
      }
    }
  },
});

// 测试用例
async function test() {
  const tree = new MerkleTree(64);
  const memberKeys = new Array(10).fill(0).map((_,i)=>Field(i));
  memberKeys.forEach((el,idx)=> tree.setLeaf(BigInt(idx),Poseidon.hash(el.toFields())));
  const memeberNum = memberKeys.length;
  const root = tree.getRoot();

  await Vote.compile();
  console.log("loading base case");
  const baseProof = await Vote.init(Field(0),root);
  console.log("verify base case.......");
  const baseOk = await Vote.verify(baseProof);
  console.log("base case ok",baseOk);

  console.log("loading execute");
  let proof = baseProof;
  for(let i=0;i<memeberNum;i++){
    const merkleWitness = new MerkleTreeWitness(tree.getWitness(BigInt(i)));
    const voteStatus = Provable.if(
      Field(Math.random()*100 | 0).greaterThan(50),
      Field(1),
      Field(0)
    )
    proof = await Vote.execute(
      Field(i).add(1),
      voteStatus,
      memberKeys[i],
      merkleWitness,
      proof
    );
    console.log("verify execute.......");
    const ok = await Vote.verify(proof);
    console.log("execute ok",ok);
  }
  console.log("赞成票",proof.publicOutput.approveNum.toBigInt());
  console.log("反对票",proof.publicOutput.disApproveNum.toBigInt());
  
}

test()
