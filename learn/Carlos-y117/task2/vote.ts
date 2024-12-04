/**
 * task2 ：设计一个简单的投票统计器
1. 设计一个简单的投票统计器用于小团队内部投票，要求能累积统计出赞成票和反对票的票数。
2. 考虑检查投票者属于团队成员，假设队员不会重复投票。
 * 
 */
import {
  Bool,
  Field,
  Proof,
  JsonProof,
  Provable,
  Struct,
  ZkProgram,
  verify,
  SelfProof,
} from 'o1js';

function testJsonRoundtrip<
  P extends Proof<any, any>,
  VoteProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(VoteProof: VoteProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'json proof',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '..',
    })
  );
  return VoteProof.fromJSON(jsonProof);
}

const teamMembers: Field[] = [Field(0), Field(1), Field(2), Field(3), Field(4)];

let Voter = Struct({
  address: Field,
  voteType: Bool,
});
class VoterClass extends Voter {}

let VoteCount = Struct({
  approveCount: Field, // 赞成计数
  rejectCount: Field, // 反对计数
});

class VoteCountClass extends VoteCount {}

let MyVoteProgram = ZkProgram({
  name: 'vote-counter',
  publicInput: VoteCountClass,
  //publicOutput: Field,

  methods: {
    init: {
      privateInputs: [],

      async method(input: VoteCountClass) {
        const { approveCount, rejectCount } = input;
        approveCount.assertEquals(Field(0));
        rejectCount.assertEquals(Field(0));
      },
    },

    vote: {
      privateInputs: [VoterClass, SelfProof],

      async method(
        publicInput: VoteCountClass,
        privateInput: VoterClass,
        earlierProof: SelfProof<VoteCountClass, void>
      ) {
        earlierProof.verify();

        // 验证投票者是否是当前的团队成员
        // 从proof拿到之前的总票数和传入的现在总票数
        const earApprove = earlierProof.publicInput.approveCount;
        const earReject = earlierProof.publicInput.rejectCount;
        const { approveCount, rejectCount } = publicInput;
        const { address, voteType } = privateInput;

        // 判断当前人员是不是组内成员
        const isMember = teamMembers.reduce(
          (acc, i) => acc.or(address.equals(i)),
          Bool(false)
        );
        isMember.assertTrue('The voter is not a member of the current team!');

        // 根据投票结果来确定校验赞成票还是反对票
        const earlier = Provable.if(voteType, earApprove, earReject);
        const current = Provable.if(voteType, approveCount, rejectCount);
        earlier.add(1).assertEquals(current);
      },
    },
  },
});
// type sanity checks
MyVoteProgram.publicInputType satisfies typeof VoteCount;
MyVoteProgram.publicOutputType satisfies Provable<void>;

/** test code */
let MyProof = ZkProgram.Proof(MyVoteProgram);
console.log('program digest', await MyVoteProgram.digest());

console.log('compiling MyVoteProgram...');
console.time('MyVoteProgram.compile time cost ');

// 生成 VK
let { verificationKey } = await MyVoteProgram.compile();
console.timeEnd('MyVoteProgram.compile time cost ');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('proving MyVoteProgram init...');
console.time('MyVoteProgram.init time cost ');

// 初始化投票数据
const countData = new VoteCountClass({
  approveCount: Field(0),
  rejectCount: Field(0),
});

// 初始化数据证明
let proof = await MyVoteProgram.init(countData);
console.timeEnd('MyVoteProgram.init time cost ');
proof = await testJsonRoundtrip(MyProof, proof);

// 验证
console.log('verify...');
console.time('verify MyVoteProgram time cost ');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify MyVoteProgram time cost ');
console.log('ok?', ok);

/** 成员验证示例 */
// member0
let voter0 = new VoterClass({
  address: Field(0),
  voteType: Bool(true),
});
let voteData0 = new VoteCountClass({
  approveCount: Field(1),
  rejectCount: Field(0),
});
// 生成证明0
let proof0 = await MyVoteProgram.vote(voteData0, voter0, proof);
// 验证0
let ok0 = await verify(proof0.toJSON(), verificationKey);
console.log('ok0', ok0);

// member1
let voter1 = new VoterClass({
  address: Field(1),
  voteType: Bool(false),
});
let voteData1 = new VoteCountClass({
  approveCount: Field(1),
  rejectCount: Field(1),
});
// 传入证明0 生成证明1
let proof1 = await MyVoteProgram.vote(voteData1, voter1, proof0);
// 验证1
let ok1 = await verify(proof1.toJSON(), verificationKey);
console.log('ok1', ok1);

/** 依次递归进行证明 */
