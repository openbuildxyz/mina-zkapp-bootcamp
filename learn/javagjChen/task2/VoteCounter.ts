import {
    Provable,
    ZkProgram,
    Field,
    Bool,
    SelfProof,
    Struct,
    MerkleMapWitness,
} from 'o1js';

export let VoteDataStruct = Struct({
    agreeCnt: Field,
    disagreeCnt: Field,
    memberTreeRoot: Field,
});

export class VoteDataCLass extends VoteDataStruct { }

export let VoteProgram = ZkProgram({
    name: 'vote-counter',
    publicInput: VoteDataCLass, // public input

    methods: {
        // init
        init: {
            privateInputs: [],
            async method(input: VoteDataCLass) {
                input.agreeCnt.assertEquals(Field(0)); 
                input.disagreeCnt.assertEquals(Field(0));
            },
        },
        vote: {
            privateInputs: [Bool, MerkleMapWitness, SelfProof],
            async method(
                input: VoteDataCLass,
                isAgree: Bool,
                userWitness: MerkleMapWitness,
                earlierProof: SelfProof<Field, void>
            ) {
                // verify
                earlierProof.verify();

                // check user is member
                let [root, key] = userWitness.computeRootAndKey(Field(1));
                root.assertEquals((earlierProof.publicInput as any).memberTreeRoot)

                // check vote
                const x = Provable.if(
                    isAgree,
                    (earlierProof.publicInput as any).agreeCnt,
                    (earlierProof.publicInput as any).disagreeCnt
                );
                const inputCnt = Provable.if(isAgree, input.agreeCnt, input.disagreeCnt);
                x.add(1).assertEquals(inputCnt);
            },
        },
    },
});
