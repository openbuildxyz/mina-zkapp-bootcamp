import { Bool, Field, JsonProof, Proof, Provable, verify, ZkProgram } from 'o1js';
// --------------------------------------------------------------------
// 智能合约部分

// 团队成员列表
const teamMembers = [
  Field('0'),
  Field('1'),
  Field('2'),
  Field('3'),
  Field('4'),
];
console.log(`成员列表：${teamMembers}`);

// 赞成票数
let yesVotes = Field('0');

// 反对票数
let noVotes = Field('0');

// 零知识证明电路
let MyProgram = ZkProgram({
  name: 'vote-counting-program',
  publicInput: Field,

  methods: {
    voteCounter: {
      privateInputs: [Bool], // 私有输入，true为投赞成票，false为投反对票
      async method(teamMember: Field, vote: Bool) {
        // 初始化条件
        let isInTheTeam = Bool(false); // 默认teamMember不在teamMembers内

        // 检查teamMember是否在teamMembers内
        teamMembers.forEach((member) => {
          isInTheTeam = Provable.if(
            teamMember.equals(member),
            Bool(true),
            isInTheTeam
          );
        });
        isInTheTeam.assertTrue("You are not in the team!");

        // 如果是团队成员，执行投票计数
        yesVotes = Provable.if(vote, yesVotes.add(1), yesVotes);
        noVotes = Provable.if(vote, noVotes.add(1), noVotes);
      },
    },
  },
});

// 类型检查
MyProgram.publicInputType satisfies typeof Field;
MyProgram.publicOutputType satisfies Provable<void>;


// --------------------------------------------------------------------
// 测试部分

let MyProof = ZkProgram.Proof(MyProgram);
console.log('程序摘要：', await MyProgram.digest);

console.log('编译MyProgram中...');
console.time('MyProgram编译花费时长:');
let { verificationKey } = await MyProgram.compile();
console.timeEnd('MyProgram编译花费时长:');
console.log('verificationKey: ', verificationKey.data.slice(0, 15) + '...');

console.log('证明中');
console.time('证明花费时长:');
const agree = Bool(true); // 证明者投的赞成票(privateInput)
let proof = await MyProgram.voteCounter(teamMembers[0], agree);
console.timeEnd('证明花费时长:');
proof = await testJsonRoundtrip(MyProof, proof);

// 类型检查
proof satisfies Proof<Field, void>;

console.log('验证中...');
console.time('验证花费时长:');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('验证花费时长:');
console.log('ok?', ok)

console.log('另一种验证方法...');
ok = await MyProgram.verify(proof);
console.log('ok (另一种验证方法)?', ok);

function testJsonRoundtrip<
  P extends Proof<any, any>,
  MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'json proof',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '..',
    })
  );
  return MyProof.fromJSON(jsonProof);
}

