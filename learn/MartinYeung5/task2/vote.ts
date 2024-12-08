import {
  Bool, Field, JsonProof, Proof, Provable, PublicKey, SelfProof, Struct, verify, ZkProgram
} from 'o1js';

// Voter: 包含投票成員的 id 及投票的選擇
export class Voter extends Struct({
  id: Field,              // 投票成員的 id
  voteOption: Bool,       // 投票的選擇只有 true 或 false
}) { }

// VoteResults: 投票結果，會有投"贊成" (true) 及投"反對" (false)
export class VoteResults extends Struct({
  voteTrue: Field,
  voteFalse: Field,
}) { }

// memberIds: 投票成員數目是5人，分別對應5個不同 id
const memberIds = [Field(10), Field(52), Field(2), Field(3), Field(4)];

// Task2VoteStatistics: ZkProgram 的名稱
const Task2VoteStatistics = ZkProgram({
  name: 'vote',
  publicInput: VoteResults,

  methods: {
    // 初始化投票結果
    initVote: {
      privateInputs: [],

      async method(publicInput: VoteResults) {
        publicInput.voteTrue.assertEquals(Field(0)); // "贊成" (true) 預設為0
        publicInput.voteFalse.assertEquals(Field(0)); // "反對" (false) 預設為0
      },

    },

    // 接收一個 Voter 及其 SelfProof，並將投票數加 1
    vote: {
      // 輸入的參數
      privateInputs: [Voter, SelfProof],
      
      async method(
        publicInput: VoteResults, privateInput: Voter, earlierProof: SelfProof<Field, void>,
      ) {
        earlierProof.verify();
        const earlierProofvoteTrue = (earlierProof.publicInput as any).voteTrue;
        const earlierProofvoteFalse = (earlierProof.publicInput as any).voteFalse;
        const { voteTrue, voteFalse } = publicInput;
        const { id, voteOption } = privateInput;

        // 檢查 id 是否屬於 memberIds 內的 id
        const isMember = memberIds.reduce((acc, i) => acc.or(id.equals(i)), Bool(false));
        isMember.assertTrue();

        // 檢查投票結果
        const earlier = Provable.if(voteOption, earlierProofvoteTrue, earlierProofvoteFalse);
        const now = Provable.if(voteOption, voteTrue, voteFalse);

        earlier.add(1).assertEquals(now);
      },
    },

  },
});

// 檢查 type (輸入)
Task2VoteStatistics.publicInputType satisfies typeof VoteResults;

let VoteProof = ZkProgram.Proof(Task2VoteStatistics);
let { verificationKey } = await Task2VoteStatistics.compile();

// 創建新的 VoteResults 而名稱為 initialVotes
const initialVotes = new VoteResults({
  voteTrue: Field(0),
  voteFalse: Field(0),
});

// 初始化投票結果
let initProof = await Task2VoteStatistics.initVote(initialVotes);
let proof = initProof.proof;

// 開始設置
proof = await testJsonRoundtrip(VoteProof, proof);

let ok = await verify(proof.toJSON(), verificationKey);
console.log('setting: initVote ================== ', ok);

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

// 成員 "10" 會投贊成票
let voter = new Voter({
  id: Field(10),
  voteOption: Bool(true),
});

let updatedVotes = new VoteResults({
  voteTrue: Field(1),
  voteFalse: Field(0),
});

let voteProof = await Task2VoteStatistics.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote success ? =========== ', ok);
console.log('Updated voteResults = True : False = ', updatedVotes.voteTrue.toBigInt(), ' : ', updatedVotes.voteFalse.toBigInt());

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

// 成員 "52" 會投贊成票
voter.id = Field(52);
voter.voteOption = Bool(true);
updatedVotes.voteTrue = Field(2);
updatedVotes.voteFalse = Field(0);

voteProof = await Task2VoteStatistics.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote success ? =========== ', ok);
console.log('Updated voteResults = True : False = ', updatedVotes.voteTrue.toBigInt(), ' : ', updatedVotes.voteFalse.toBigInt());

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

// 成員 "3" 會投贊成票
voter.id = Field(3);
voter.voteOption = Bool(false);
updatedVotes.voteTrue = Field(2);
updatedVotes.voteFalse = Field(1);

voteProof = await Task2VoteStatistics.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote success ? ============ ', ok);
console.log('Updated voteResults = True : False = ', updatedVotes.voteTrue.toBigInt(), ' : ', updatedVotes.voteFalse.toBigInt());

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

// 成員 "2" 會投反對票
voter.id = Field(2);
voter.voteOption = Bool(false);
updatedVotes.voteTrue = Field(2);
updatedVotes.voteFalse = Field(2);

voteProof = await Task2VoteStatistics.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote success ? ============ ', ok);
console.log('Updated voteResults = True : False = ', updatedVotes.voteTrue.toBigInt(), ' : ', updatedVotes.voteFalse.toBigInt());

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

// 成員 "4" 會投贊成票
voter.id = Field(4);
voter.voteOption = Bool(true);
updatedVotes.voteTrue = Field(3);
updatedVotes.voteFalse = Field(2);

voteProof = await Task2VoteStatistics.vote(updatedVotes, voter, proof);
proof = voteProof.proof;
proof = await testJsonRoundtrip(VoteProof, proof);

ok = await verify(proof.toJSON(), verificationKey);
console.log('id: ', voter.id.toBigInt(), ' vote success ? ============ ', ok);
console.log('Updated voteResults = True : False = ', updatedVotes.voteTrue.toBigInt(), ' : ', updatedVotes.voteFalse.toBigInt());

ok = await Task2VoteStatistics.verify(proof);
console.log('verify ============================= ', ok, '\n====================================');

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