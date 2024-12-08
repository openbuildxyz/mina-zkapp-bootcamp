import { Bool, Field, MerkleMap, MerkleMapWitness, Provable, SelfProof, Struct, ZkProgram } from 'o1js';

export let VoteDate = Struct({
    yesCnt: Field,
    noCnt: Field,
    memberTreeRoot: Field
});//创建投票数据储存的结构体，包括Yes与No的计数和用户默克尔树的根

export class VoteDataClass extends VoteDate { }

export let voteProgram = ZkProgram({
    name: 'vote_app',
    publicInput: VoteDataClass,//将投票数据作为publicInput

    methods: {
        init: {
            privateInputs: [],
            async method(input: VoteDataClass) {
                input.yesCnt.assertEquals(Field(0));
                input.noCnt.assertEquals(Field(0));
            }
        },//初始化，将publicInput的Yes和No计数均设为0。
        vote: {
            privateInputs: [Bool, MerkleMapWitness, SelfProof],
            async method(input: VoteDataClass, isYes: Bool, userWitness: MerkleMapWitness, earlierProof: SelfProof<Field, void>) {//传入投票数据结构体(为投票后的结果)，投票结果，用户的节点信息，先前的Proof
                earlierProof.verify();
                let [root, key] = userWitness.computeRootAndKey(Field(1));
                root.assertEquals((earlierProof.publicInput as any).memberTreeRoot)//验证用户是否正确

                const x = Provable.if(
                    isYes,
                    (earlierProof.publicInput as any).yesCnt,
                    (earlierProof.publicInput as any).noCnt
                );//判断用户投票内容
                const inputCnt = Provable.if(isYes, input.yesCnt, input.noCnt);
                x.add(1).assertEquals(inputCnt);//检验用户投票内容和传入的投票结果是否正确。
            }
        }
    }
})


console.log("hello");
let Votedata: VoteDataClass,
    vk: {
        data: string,
        hash: Field;
    },
    initProof: any,
    preRpoof: any,
    merkleMap: MerkleMap;
let { verificationKey } = await voteProgram.compile();
vk = verificationKey
console.log(vk)

merkleMap = new MerkleMap();
merkleMap.set(Field(2000), Field(1));
merkleMap.set(Field(2001), Field(1));
merkleMap.set(Field(2002), Field(1));
merkleMap.set(Field(2003), Field(1));
const memberRoot = merkleMap.getRoot();
console.log(memberRoot);

Votedata = new VoteDataClass({
    yesCnt: Field(0),
    noCnt: Field(0),
    memberTreeRoot: memberRoot,
});

initProof = await voteProgram.init(Votedata);
let verification = await voteProgram.verify(initProof.proof);
console.log('initVer', verification);

let voteData2 = new VoteDataClass({
    yesCnt: initProof.proof.publicInput.yesCnt.add(1),
    noCnt: initProof.proof.publicInput.noCnt,
    memberTreeRoot: initProof.proof.publicInput.memberTreeRoot,
  });
  let proof2 = await  voteProgram.vote(
    voteData2,new Bool(true),merkleMap.getWitness(Field(2001)),
    initProof.proof
  );
  
  let voteVerify = await voteProgram.verify(proof2.proof );
  console.log(voteVerify);
  console.log('yes Ver', voteVerify);
  Votedata = voteData2;
  preRpoof = proof2;
