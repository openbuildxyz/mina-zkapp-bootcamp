import {
    SelfProof,
    Field,
    ZkProgram,
    Proof,
    Provable,
    Struct,
    PublicKey,
    Bool,
    PrivateKey
} from 'o1js';


/**
 * 注意：下面投票案例基于不存在重复投票的假设。
 */
const MEMBER_CNT = 3;// 定义好团队队员数量
class VoteState extends Struct({
    teammates: Provable.Array(PublicKey, MEMBER_CNT),// 初始化时固定了队员个数为MEMBER_CNT
    voteFor: Field,
    voteAgainst: Field
}) {
    static applyVote(
        state0: VoteState,
        voteFor: Bool,
        privateKey: PrivateKey
    ) {
        state0.voteAgainst.add(state0.voteFor).assertLessThan(MEMBER_CNT);

        const publicKey = privateKey.toPublicKey();

        // 对于大团队的场景，应该优化：采用merkle tree做成员证明
        let isMember = Bool(false);
        for (let i = 0; i < MEMBER_CNT; i++) {
            isMember = isMember.or(Provable.if(state0.teammates[i].equals(publicKey), Bool(true), Bool(false)));
        }
        isMember.assertTrue();

        return new VoteState({
            teammates: state0.teammates,
            voteFor: state0.voteFor.add(Provable.if(voteFor, Field(1), Field(0))),
            voteAgainst: state0.voteAgainst.add(Provable.if(voteFor, Field(0), Field(1)))
        });
    }

    static assertInitialState(state: VoteState) {
        for (let i = 0; i < MEMBER_CNT; i++) {
            const e = state.teammates[i];
            e.equals(PublicKey.empty()).assertFalse();
        }
        state.voteFor.assertEquals(Field(0))
        state.voteAgainst.assertEquals(Field(0))
    }

    static checkEqual(state0: VoteState, state1: VoteState) {
        for (let i = 0; i < MEMBER_CNT; i++) {
            state0.teammates[i].assertEquals(state1.teammates[i]);
        }
        state0.voteFor.assertEquals(state1.voteFor)
        state0.voteAgainst.assertEquals(state1.voteAgainst)
    }
}

let VoteProgram = ZkProgram({
    name: 'example-with-vote',
    publicInput: VoteState,

    methods: {
        initVoteState: {
            privateInputs: [],
            async method(voteState: VoteState) {
                VoteState.assertInitialState(voteState);
            },
        },

        applyVote: {
            privateInputs: [SelfProof, Bool, PrivateKey],
            async method(appliedVoteState: VoteState, earlierProof: SelfProof<VoteState, void>, voteFor: Bool, privKey: PrivateKey) {
                Provable.log(`1) earlierProof.verify`);
                earlierProof.verify();

                Provable.log(`2) accumulate the vote`);
                const state1 = VoteState.applyVote(earlierProof.publicInput, voteFor, privKey);

                Provable.log(`3) check if the same team & total votes is <= team members`);
                VoteState.checkEqual(state1, appliedVoteState);

            },
        },
    },
});

let applyVoteAndProve = async (lastProof: Proof<VoteState, void>, voteFor: Bool, teammateKey: PrivateKey) => {
    // 电路外计算好并收集好需要送入电路的数据
    let lastVoteState = lastProof.publicInput;
    let voteState = new VoteState({
        teammates: lastVoteState.teammates,
        voteFor: Provable.if(voteFor, lastVoteState.voteFor.add(1), lastVoteState.voteFor),
        voteAgainst: Provable.if(voteFor, lastVoteState.voteAgainst, lastVoteState.voteAgainst.add(1)),
    });

    // 送入电路中生成证明
    let proof = await VoteProgram.applyVote(voteState, lastProof, voteFor, teammateKey);

    return proof;
}


await VoteProgram.compile();

const teammate0Key = PrivateKey.random();
const teammate0Addr = teammate0Key.toPublicKey();
const teammate1Key = PrivateKey.random();
const teammate1Addr = teammate1Key.toPublicKey();
const teammate2Key = PrivateKey.random();
const teammate2Addr = teammate2Key.toPublicKey();

const team0 = [teammate0Addr, teammate1Addr, teammate2Addr];


let voteStateInit = new VoteState({
    teammates: team0,
    voteFor: Field(0),
    voteAgainst: Field(0)
});
let { proof: proofInit } = await VoteProgram.initVoteState(voteStateInit);

console.log(`teammate0 is voting...`);
const voteFor0 = Bool(true);
const { proof: proof0 } = await applyVoteAndProve(proofInit, voteFor0, teammate0Key);
console.log('\n');

console.log(`teammate1 is voting...`);
const voteFor1 = Bool(false);
const { proof: proof1 } = await applyVoteAndProve(proof0, voteFor1, teammate1Key);
console.log('\n');

console.log(`teammate2 is voting...`);
const voteFor2 = Bool(true);
const { proof: proof2 } = await applyVoteAndProve(proof1, voteFor2, teammate2Key);
console.log('\n');

console.log(`total vote stats:
        voteFor counts: ${proof2.publicInput.voteFor},\n
        voteAgainst counts: ${proof2.publicInput.voteAgainst}
    `);
