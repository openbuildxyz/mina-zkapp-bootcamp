import { Field,MerkleWitness, MerkleTree, verify, ZkProgram, SelfProof, Poseidon, Struct, Provable, } from 'o1js';

class MerkleTreeWitness extends MerkleWitness(64) {}
class MainProgramState extends Struct({
  treeRoot: Field,
  approveNum: Field,
  rejectNum:Field
}) {}

const Vote = ZkProgram({
  name: 'vote',
  publicInput:MainProgramState,
  publicOutput:MainProgramState,
  methods: {
    baseCase:{
      privateInputs:[],
      // 先证明 approveNum 和 rejectNum 都是从 0 开始计数
      async method(publicInput:MainProgramState){
        publicInput.approveNum.assertEquals(Field(0))
        publicInput.rejectNum.assertEquals(Field(0))
        return {
          publicOutput:publicInput
        }
      }
    },
    execute:{
      privateInputs:[Field,Field,Field,Field,MerkleTreeWitness],
      async method(
        publicInput:MainProgramState,
        voteValue:Field,
        approveNum:Field,
        rejectNum:Field,
        account:Field,
        path:MerkleTreeWitness
      ){
        // 1. 投票值只能是 0 或 1
        voteValue.assertLessThanOrEqual(Field(1));
        // 2. 证明账号在团队名单上
        path.calculateRoot(Poseidon.hash([account])).assertEquals(publicInput.treeRoot);
        // 3. 投票值为 0 时，approveNum 加 1；投票值为 1 时，rejectNum 加 1
       const newApproveNum  = Provable.if(
          voteValue.equals(Field(0)),
          publicInput.approveNum,
          publicInput.approveNum.add(1)
        )
        newApproveNum.assertEquals(approveNum)
        const newRejectNum = Provable.if(
          voteValue.equals(Field(1)),
          publicInput.rejectNum,
          publicInput.rejectNum.add(1)
        )
        newRejectNum.assertEquals(rejectNum)

        return {
          publicOutput:new MainProgramState({
            treeRoot:publicInput.treeRoot,
            approveNum:newApproveNum,
            rejectNum:newRejectNum
          })
        }
      }
    }
  },
});

// 测试用例
async function test() {
  const tree = new MerkleTree(64);
  const root = tree.getRoot();
  tree.setLeaf(1n,Poseidon.hash([Field(1)]))
  console.log("tree root",Poseidon.hash([Field(1)]));
  
  const witness = new MerkleTreeWitness(tree.getWitness(1n));
  console.log("witness.calculateRoot(Poseidon.hash([Field(1)]))",witness.calculateRoot(Poseidon.hash([Field(1)])),root);

  const {verificationKey} = await Vote.compile();
  const baseCaseState = new MainProgramState({
    treeRoot:root,
    approveNum:Field(0),
    rejectNum:Field(0)
  })
  console.log("loading base case");
  const baseCaseResult = await Vote.baseCase(baseCaseState)
  console.log("verify base case.......");
  const baseCaseOk = await verify(baseCaseResult.proof,verificationKey);
  console.log("base case ok",baseCaseOk);
  console.log("loading execute");
  const excuteResult = await Vote.execute(baseCaseState,Field(0),Field(0),Field(1),Field(1),witness)
  console.log("verify execute.......");
  const excuteOk = await verify(excuteResult.proof,verificationKey);
  console.log("execute ok",excuteOk);
}

test()