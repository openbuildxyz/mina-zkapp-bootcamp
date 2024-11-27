import {
  Bool,
  Field,
  JsonProof,
  Poseidon,
  Proof,
  provable,
  Provable,
  ProvableType,
  SelfProof,
  verify,
  ZkProgram,
} from "o1js";

const team = [Field(1), Field(2), Field(3)] as const;
const teamHashes = team.map((key) => Field(Poseidon.hash([key])));

let agree = Field(0);
let disagree = Field(0);

let myProgram = ZkProgram({
  name: "ticket",
  publicInput: Field,
  methods: {
    baseAgree: {
      privateInputs: [],
      async method(agree: Field) {
        agree.assertEquals(Field(0));
      },
    },
    baseDisagree: {
      privateInputs: [],
      async method(disagree: Field) {
        disagree.assertEquals(Field(0));
      },
    },
    vote: {
      privateInputs: [SelfProof, Field], // SelfProof 是当前ZkProgram，method产生的proof，作为另一个method的privateInputs
      async method(input: Field, earlierProof: SelfProof<Field, void>, voterKeyHash: Field) {
        // 1. 验证之前的合约
        earlierProof.verify();
        // 2.判断，是否在team中，是的话，票数加1，不是的话，票数不变
        // 判断 voterKeyHash 是否在 team 中
        const isVoterInTeam = teamHashes.reduce(
          (acc, hash) => acc.or(voterKeyHash.equals(hash)), // 使用 Bool 的 or 方法
          Bool(false) // 初始化为 false
        );
        const final = Provable.if(isVoterInTeam, Field(1), Field(0));
        // 3.验证之前的合约，传入的值是否正确
        earlierProof.publicInput.add(final).assertEquals(input);
      },
    },
  },
});

console.log("1.得到合约的hash值", await myProgram.digest()); // 得到合约的hash值

console.log("2.编译合约...");
console.time("编译合约 cost time:");
let { verificationKey } = await myProgram.compile();
console.timeEnd("编译合约 cost time:");

console.log("3.生成证明 baseAgree...");
let agreeProof = await myProgram.baseAgree(agree);

console.log("4.生成证明 baseDisagree...");
let disagreeProof = await myProgram.baseDisagree(disagree);

let ok = await verify(agreeProof.proof.toJSON(), verificationKey);
console.log(`5.verify验证 baseAgree...,验证结果:${ok}`);

ok = await verify(disagreeProof.proof.toJSON(), verificationKey);
console.log(`6.verify验证 baseDisagree...,验证结果:${ok}`);

console.log("7.成员0,投票同意,生成证明 vote...");

agree = agree.add(Field(1));
agreeProof = await myProgram.vote(agree, agreeProof.proof, teamHashes[0]);

ok = await verify(agreeProof.proof.toJSON(), verificationKey);
console.log(`8.verify验证 vote 成员0,投票同意...,验证结果:${ok}`);

disagree = disagree.add(Field(1));
disagreeProof = await myProgram.vote(disagree, disagreeProof.proof, teamHashes[1]);
console.log("9.成员1,投票反对,生成证明 vote...");

ok = await verify(disagreeProof.proof.toJSON(), verificationKey);
console.log(`10.verify验证 vote 成员1,投票反对...,验证结果:${ok}`);

disagree = disagree.add(Field(1));
disagreeProof = await myProgram.vote(disagree, disagreeProof.proof, teamHashes[2]);
console.log("11.成员2,投票反对,生成证明 vote...");

ok = await verify(disagreeProof.proof.toJSON(), verificationKey);
console.log(`12.verify验证 vote 成员2,投票反对...,验证结果:${ok}`);

console.log("finish!!!, 最终结果:");
console.log("agree:", agree.value);
console.log("disagree:", disagree.value);
