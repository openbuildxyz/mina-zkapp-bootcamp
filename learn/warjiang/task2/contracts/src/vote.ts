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

// 假设一共3个成员参与投票
const MEMBER_CNT = 3;
class VoteState extends Struct({
    teammates: Provable.Array(PublicKey, MEMBER_CNT),
    voteFor: Field,
    voteAgainst: Field
}) {
    static applyVote(
        state: VoteState,
        voteFor: Bool,
        privateKey: PrivateKey
    ) {
        const publicKey = privateKey.toPublicKey();

        // 对于大团队的场景，应该优化：采用merkle tree做成员证明
        let isMember = Bool(false);
        for (let i = 0; i < MEMBER_CNT; i++) {
            isMember = isMember.or(Provable.if(state.teammates[i].equals(publicKey), Bool(true), Bool(false)));
        }
        isMember.assertTrue();

        return new VoteState({
            teammates: state.teammates,
            voteFor: state.voteFor.add(Provable.if(voteFor, Field(1), Field(0))),
            voteAgainst: state.voteAgainst.add(Provable.if(voteFor, Field(0), Field(1)))
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

    static checkSameTeam(state0: VoteState, state1: VoteState) {
        for (let i = 0; i < MEMBER_CNT; i++) {
            state0.teammates[i].assertEquals(state1.teammates[i]);
        }
    }
}

let VoteProgram = ZkProgram({
    name: 'zk-vote',
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
            async method(voteState: VoteState, earlierProof: SelfProof<VoteState, void>, voteFor: Bool, privKey: PrivateKey) {
                Provable.log(`1) earlierProof.verify`);
                earlierProof.verify();

                Provable.log(`2) check if the same team`);
                VoteState.checkSameTeam(voteState, earlierProof.publicInput);

                Provable.log(`3) accumulate the vote`);

                VoteState.applyVote(voteState, voteFor, privKey);
            },
        },
    },
});

let applyVoteAndProve = async (lastProof: Proof<VoteState, void>, voteFor: Bool, teammateKey: PrivateKey) => {
    let lastVoteState = lastProof.publicInput;
    let voteState = new VoteState({
        teammates: lastVoteState.teammates,
        voteFor: Provable.if(voteFor, lastVoteState.voteFor.add(1), lastVoteState.voteFor),
        voteAgainst: Provable.if(voteFor, lastVoteState.voteAgainst, lastVoteState.voteAgainst.add(1)),
    });
    let proof = await VoteProgram.applyVote(voteState, lastProof, voteFor, teammateKey);

    return proof;
}


await VoteProgram.compile();




/** 
 * 初始化 VoteState
 * team：记录成员的公钥，用于检测选票是否为团队成员的
*/
console.log('generate vote data ramdomly')
const teams: Array<{
    key: PrivateKey,
    addr: PublicKey,
    name: string,
    voteForOrAgaint: boolean,
}> = []
for (let i = 0; i < MEMBER_CNT; i++) {
    let key = PrivateKey.random();
    let addr = key.toPublicKey();
    teams.push({
        key: key,
        addr: addr,
        name: `teammate${i}`,
        voteForOrAgaint: Math.random() > 0.5 ? true : false,
    });
}

const voteResult = teams.reduceRight((acc, cur) => {
    if (cur.voteForOrAgaint) {
        return {
            voteFor: acc.voteFor + 1,
            voteAgainst: acc.voteAgainst
        }
    } else {
        return {
            voteFor: acc.voteFor,
            voteAgainst: acc.voteAgainst + 1
        }
    }
}, {
    voteFor: 0,
    voteAgainst: 0
});
const { voteFor, voteAgainst } = voteResult;
console.log(`generate vote stats:
    voteFor counts: ${voteFor},
    voteAgainst counts: ${voteAgainst}
`);

console.log(`>>>start voting>>>`);
const teammates = teams.map((t) => t.addr);
let voteStateInit = new VoteState({
    teammates: teammates,
    voteFor: Field(0),
    voteAgainst: Field(0)
});
let proof = await VoteProgram.initVoteState(voteStateInit);

for(let i = 0; i < MEMBER_CNT; i++) {
    const { key, name, voteForOrAgaint } = teams[i];
    console.log(`${name} is voting...`);
    const voteFor = Bool(voteForOrAgaint);
    proof = await applyVoteAndProve(proof.proof, voteFor, key);
}
console.log(`>>>finish voting>>>`);
console.log(`total vote stats:
    voteFor counts: ${proof.proof.publicInput.voteFor},
    voteAgainst counts: ${proof.proof.publicInput.voteAgainst}
`);