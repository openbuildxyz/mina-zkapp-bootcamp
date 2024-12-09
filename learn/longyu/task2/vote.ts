import { ZkProgram, Field, Bool, Hash, Struct, PrivateKey, PublicKey, Signature, SelfProof, Provable } from 'o1js'

// 生成私钥
const privKey = PrivateKey.random();
const pubKey = PublicKey.fromPrivateKey(privKey);
const uniqKey = Field(0x1111);
// 生成身份 
const groups = [Field(0), Field(1), Field(2)].map(field => {
    return Signature.create(privKey, [field]);
});

// 设定一个投票器
const VoterStruct = Struct({
    approve: Field,
    against: Field
});

// 投票构造器
export class VoterClass extends VoterStruct { }

// 实例构造器
const Voter = new VoterClass({
    approve: Field(0),
    against: Field(0)
});

export const VoterProgram = ZkProgram({
    name: "Voter",
    publicInput: VoterClass,
    methods: {
        baseVoter: {
            privateInputs: [],
            async method(publicInput: VoterClass) {
                publicInput.approve.assertEquals(Field(0));
                publicInput.against.assertEquals(Field(0));
            }
        },
        voter: {
            privateInputs: [Field, Bool, SelfProof],
            async method(vote: VoterClass, publicInput: Field, tick: Bool, earlierProof: SelfProof<Field, void>) {
                earlierProof.verify();
                const sign = groups.some(group => {
                    return group.verify(pubKey, [publicInput]).toBoolean()
                });

                Bool(sign).assertEquals(true);

                const field = Provable.if(tick, vote.approve, vote.against);

                field.add(Field(1));
            }
        }
    }
});

const { verificationKey } = await VoterProgram.compile();
const { proof } = await VoterProgram.baseVoter(Voter);

[Field(0), Field(1), Field(2)].forEach(f => {
    VoterProgram.voter(Voter, f, Bool(true), proof)
});