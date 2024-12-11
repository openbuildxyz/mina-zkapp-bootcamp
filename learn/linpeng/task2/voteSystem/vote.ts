import {
    SelfProof,
    Field,
    ZkProgram,
    verify,
    Proof,
    JsonProof,
    Provable,
    Poseidon,
    PublicKey,
    Struct,
    Bool,
    MerkleWitness,
    Mina,
    MerkleTree,
    PrivateKey,
} from 'o1js';

const MEMBER_COUNT = 3; // 团队队员数量

class ProgramState extends Struct({
    memberList: Provable.Array(PublicKey, MEMBER_COUNT),
    approvalNum: Field,
    rejectedNum: Field,
}) { }

let VoteProgram = ZkProgram({
    name: 'vote-system',
    publicInput: ProgramState,

    methods: {
        baseCase: {
            privateInputs: [],
            async method(curState: ProgramState) {
                for (let i = 0; i < MEMBER_COUNT; i++) {
                    const member = curState.memberList[i];
                    member.equals(PublicKey.empty()).assertFalse();
                }
                curState.approvalNum.equals(Field(0))
                curState.rejectedNum.equals(Field(0))
            },
        },
        voteApprovalCase: {
            privateInputs: [PrivateKey, SelfProof],
            async method(curState: ProgramState, member: PrivateKey, preProof: SelfProof<ProgramState, void>) {
                Provable.log(`1) voteApprovalCase: preProof.verify`);
                preProof.verify();

                Provable.log(`2) voteApprovalCase: verify member in memberList`);
                let valid = Bool(false);
                for (let i = 0; i < MEMBER_COUNT; i++) {
                    const curMember = curState.memberList[i];
                    valid = valid.or(Bool(member.toPublicKey().equals(curMember)));
                    // valid.or(member.toPublicKey().equals(curMember)); // Error: Bool.assertTrue(): false != true
                }
                valid.assertTrue()

                Provable.log(`3) voteApprovalCase: accumulate the vote`);
                const preState = preProof.publicInput
                for (let i = 0; i < MEMBER_COUNT; i++) {
                    const curMember = curState.memberList[i];
                    preState.memberList[i].assertEquals(curMember)
                }
                preState.approvalNum.add(1).assertEquals(curState.approvalNum)
                preState.rejectedNum.assertEquals(curState.rejectedNum)
            },
        },
        voteRejectedCase: {
            privateInputs: [PrivateKey, SelfProof],
            async method(curState: ProgramState, member: PrivateKey, preProof: SelfProof<ProgramState, void>) {
                Provable.log(`1) voteRejectedCase: preProof.verify`);
                preProof.verify();

                Provable.log(`2) voteRejectedCase: verify member in memberList`);
                let valid = Bool(false);
                for (let i = 0; i < MEMBER_COUNT; i++) {
                    const curMember = curState.memberList[i]
                    valid = valid.or(Bool(curMember.equals(member.toPublicKey())))
                    // valid.or(curMember.equals(member.toPublicKey())) // Error: Bool.assertTrue(): false != true
                }
                valid.assertEquals(Bool(true))
                // valid.assertTrue()

                Provable.log(`3) voteRejectedCase: accumulate the vote`);
                const preState = preProof.publicInput
                for (let i = 0; i < MEMBER_COUNT; i++) {
                    const curMember = curState.memberList[i]
                    preState.memberList[i].equals(curMember)
                }
                preState.approvalNum.assertEquals(curState.approvalNum)
                preState.rejectedNum.add(1).assertEquals(curState.rejectedNum)
            },
        },
    },
});

await VoteProgram.compile();

const member0Key = PrivateKey.random();
const member0Addr = member0Key.toPublicKey();
const member1Key = PrivateKey.random();
const member1Addr = member1Key.toPublicKey();
const member2Key = PrivateKey.random();
const member2Addr = member2Key.toPublicKey();

const memberList = [member0Addr, member1Addr, member2Addr];

const state0 = new ProgramState({
    memberList,
    approvalNum: Field(0),
    rejectedNum: Field(0),
});


console.log(`get baseCaseProof ...`);
const baseCaseProof = await VoteProgram.baseCase(state0);

console.log(`get member0 voteApprovalCaseProof ...`);
// 电路外计算好并收集好需要送入电路的数据
// 送入电路中生成证明
let member0ApprovalCaseProof = await VoteProgram.voteApprovalCase(
    new ProgramState({
        memberList: state0.memberList,
        approvalNum: state0.approvalNum.add(1),
        rejectedNum: state0.rejectedNum,
    }),
    member0Key,
    baseCaseProof
);

console.log(`get member1 voteRejectedCaseProof ...`);
let member1ApprovalCaseProof = await VoteProgram.voteRejectedCase(
    new ProgramState({
        memberList: member0ApprovalCaseProof.publicInput.memberList,
        approvalNum: member0ApprovalCaseProof.publicInput.approvalNum,
        rejectedNum: member0ApprovalCaseProof.publicInput.rejectedNum.add(1),
    }),
    member1Key,
    member0ApprovalCaseProof
);

console.log(`get member2 voteRejectedCaseProof ...`);
let member2ApprovalCaseProof = await VoteProgram.voteRejectedCase(
    new ProgramState({
        memberList: member1ApprovalCaseProof.publicInput.memberList,
        approvalNum: member1ApprovalCaseProof.publicInput.approvalNum,
        rejectedNum: member1ApprovalCaseProof.publicInput.rejectedNum.add(1),
    }),
    member2Key,
    member1ApprovalCaseProof
);
console.log(`
    get lastRes:(
    approvalNum: ${member2ApprovalCaseProof.publicInput.approvalNum},
    rejectedNum: ${member2ApprovalCaseProof.publicInput.rejectedNum}
)`);