import {
  Bool,
  Field,
  JsonProof,
  Proof,
  Provable,
  SelfProof,
  Struct,
  verify,
  ZkProgram,
} from 'o1js';

class Voter extends Struct({
  address: Field,
  voteType: Bool,
}) {}

const teamMembers: Field[] = [Field(1), Field(2), Field(3), Field(4)];

export class VoteCount extends Struct({
  approveCount: Field,
  rejectCount: Field,
}) {}

const VoteProgram = ZkProgram({
  name: 'Vote-Counter',
  publicInput: VoteCount,

  methods: {
    init: {
      privateInputs: [],

      async method(inputPub: VoteCount) {
        const { approveCount, rejectCount } = inputPub;
        approveCount.assertEquals(Field(0));
        rejectCount.assertEquals(Field(0));
      },
    },

    vote: {
      privateInputs: [Voter, SelfProof],

      async method(
        publicInput: VoteCount,
        privateInput: Voter,
        earlierProof: SelfProof<VoteCount, void>
      ) {
        // 验证之前的电路
        earlierProof.verify();

        // 验证投票者是否是团队成员
        const { address, voteType } = privateInput;
        const isValidMember = teamMembers
          .map((key) => key.equals(address)) // 生成一个 Bool[] 数组
          .reduce((acc, cur) => acc.or(cur), Bool(false));

        isValidMember.assertTrue('He/she is not part of the team!');

        // 检查计数器
        const { approveCount, rejectCount } = earlierProof.publicInput;
        const {
          approveCount: inputApproveCount,
          rejectCount: inputRejectCount,
        } = publicInput;

        const prev = Provable.if(voteType, approveCount, rejectCount);

        const current = Provable.if(
          voteType,
          inputApproveCount,
          inputRejectCount
        );

        prev.add(1).assertEquals(current);
      },
    },
  },
});

VoteProgram.publicInputType satisfies typeof VoteCount;
VoteProgram.publicOutputType satisfies Provable<void>;

// -------- test --------
let MyProof = ZkProgram.Proof(VoteProgram);

console.log('programe hash', await VoteProgram.digest());

console.log('compile VoteProgram...');
console.time('VoteProgram.complie time cost');
let { verificationKey } = await VoteProgram.compile();
console.timeEnd('VoteProgram.complie time cost');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('proving...');
console.time('VoteProgram.init time cost');
// 初始化投票状态
const initialCount = new VoteCount({
  approveCount: Field(0),
  rejectCount: Field(0),
});
let { proof } = await VoteProgram.init(initialCount);
console.timeEnd('VoteProgram.init time cost');
proof = await testJsonRoundtrip(MyProof, proof);

console.log('verify...');
console.time('verify VoteProgram time cost');
let ok = await verify(proof.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time cost');
console.log('initVote is ok ?', ok);
ok = await VoteProgram.verify(proof);
console.log('initVote verify ok ?', ok);

console.log('========== approve by user1 ============');
let voter1 = new Voter({
  address: Field(1),
  voteType: Bool(true),
});
let voteCount1 = new VoteCount({
  approveCount: Field(1),
  rejectCount: Field(0),
});

console.log('proving...');
console.time('VoteProgram.vote approve time cost');
let { proof: voteProof1 } = await VoteProgram.vote(voteCount1, voter1, proof);
console.timeEnd('VoteProgram.vote approve time cost');

voteProof1 = await testJsonRoundtrip(MyProof, voteProof1);

console.log('verify...');
console.time('verify VoteProgram time cost');
ok = await verify(voteProof1.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time cost');
console.log('vote is ok ?', ok);
ok = await VoteProgram.verify(voteProof1);
console.log('vote verify ok ?', ok);

console.log('========== reject by user2 ============');
let voter2 = new Voter({
  address: Field(2),
  voteType: Bool(false),
});

let voteCount2 = new VoteCount({
  approveCount: Field(1),
  rejectCount: Field(1),
});

let { proof: voteProof2 } = await VoteProgram.vote(
  voteCount2,
  voter2,
  voteProof1
);
voteProof2 = await testJsonRoundtrip(MyProof, voteProof2);

console.log('verify...');
console.time('verify VoteProgram time cost');
ok = await verify(voteProof2.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time cost');
console.log('vote is ok ?', ok);
ok = await VoteProgram.verify(voteProof2);
console.log('vote verify ok ?', ok);

console.log('========== reject by not member of team ============');
let voter3 = new Voter({
  address: Field(6),
  voteType: Bool(false),
});

let voteCount3 = new VoteCount({
  approveCount: Field(1),
  rejectCount: Field(2),
});

let { proof: voteProof3 } = await VoteProgram.vote(
  voteCount3,
  voter3,
  voteProof2
);
voteProof3 = await testJsonRoundtrip(MyProof, voteProof3);

console.log('verify...');
console.time('verify VoteProgram time cost');
ok = await verify(voteProof3.toJSON(), verificationKey);
console.timeEnd('verify VoteProgram time cost');
console.log('vote is ok ?', ok);
ok = await VoteProgram.verify(voteProof3);
console.log('vote verify ok ?', ok);

// helper tool
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
