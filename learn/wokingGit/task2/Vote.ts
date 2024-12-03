// task2： 设计一个简单的投票统计器
// 1. 设计一个简单的投票统计器用于小团队内部投票，要求能累积统计出赞成票和反对票的票数
// 2. 考虑检查投票者属于团队成员，假设队员不会重复投票
// 请提交电路代码和测试代码。

import {
  SelfProof,
  Field,
  ZkProgram,
  verify,
  Proof,
  JsonProof,
  Provable,
  Struct,
  Bool,
} from 'o1js';

export let VoterData = Struct({
  voteItem: Bool,
  memberId: Field,
});

export class VoterClass extends VoterData {}

export let TotalData = Struct({
  yesTotal: Field,
  noTotal: Field,
});

export class TotalClass extends TotalData {}

// 会员列表
export let MemberList = [Field(0), Field(1), Field(2), Field(4)];

let VoteProgram = ZkProgram({
  name: 'vote-program',
  publicInput: TotalClass,
  methods: {
    init: {
      privateInputs: [],
      async method(input: TotalClass) {
        input.yesTotal.assertEquals(Field(0));
        input.noTotal.assertEquals(Field(0));
      },
    },
    vote: {
      privateInputs: [VoterClass, SelfProof],
      async method(
        publicInput: TotalClass,
        Voter: VoterClass,
        earlierProof: SelfProof<Field, void>
      ) {
        earlierProof.verify();

        // 从proof拿到之前的总票数和传入的现在总票数
        const earYesTotal = (earlierProof.publicInput as any).yesTotal;
        const earNoTotal = (earlierProof.publicInput as any).noTotal;
        const { yesTotal, noTotal } = publicInput;
        const { voteItem, memberId } = Voter;

        // 判断当前人员是不是组内成员
        const isMember = MemberList.reduce(
          (acc, i) => acc.or(memberId.equals(i)),
          Bool(false)
        );
        isMember.assertTrue();

        // 根据投票结果来确定校验赞成票还是反对票
        const earlier = Provable.if(voteItem, earYesTotal, earNoTotal);
        const now = Provable.if(voteItem, yesTotal, noTotal);
        earlier.add(1).assertEquals(now);
      },
    },
  },
});

let MyProof = ZkProgram.Proof(VoteProgram);

// 生成 VK 校验秘钥
let { verificationKey } = await VoteProgram.compile();

// 初始化数据
const totalDataI = new TotalClass({
  yesTotal: Field(0),
  noTotal: Field(0),
});

// 生成证明
let proofInit = await VoteProgram.init(totalDataI);

// 验证
let ok = await verify(proofInit.toJSON(), verificationKey);
console.log('ok', ok);

// ----------成员0-------------
let voter0 = new VoterClass({
  memberId: Field(0),
  voteItem: Bool(true),
});
let totalData0 = new TotalClass({
  yesTotal: Field(1),
  noTotal: Field(0),
});
// 生成证明
let proof0 = await VoteProgram.vote(totalData0, voter0, proofInit);
// 验证
let ok0 = await verify(proof0.toJSON(), verificationKey);
console.log('ok0', ok0);

// ----------成员1-------------
let voter1 = new VoterClass({
  memberId: Field(1),
  voteItem: Bool(false),
});
let totalData1 = new TotalClass({
  yesTotal: Field(1),
  noTotal: Field(1),
});
// 生成证明
let proof1 = await VoteProgram.vote(totalData1, voter1, proof0);
// 验证
let ok1 = await verify(proof1.toJSON(), verificationKey);
console.log('ok1', ok1);
