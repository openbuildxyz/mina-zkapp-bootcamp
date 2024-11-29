import {
  Provable,
  ZkProgram,
  Field,
  Bool,
  SelfProof,
  Struct,
  MerkleMapWitness,
  MerkleMap,
} from 'o1js';

export let VoteDataType = Struct({
  yesCnt: Field,
  noCnt: Field,
  memberTreeRoot: Field,
});

export class VoteDataCLass extends VoteDataType {}

export let VoteProgram = ZkProgram({
  name: 'vote-zk',
  publicInput: VoteDataCLass, // 只能定义一个公开参数

  methods: {
    init: {
      privateInputs: [],
      async method(input: VoteDataCLass) {
        input.yesCnt.assertEquals(Field(0)); // constraint
        input.noCnt.assertEquals(Field(0)); // constraint
      },
    },
    vote: {
      privateInputs: [Bool, MerkleMapWitness, SelfProof],
      async method(
        input: VoteDataCLass,
        isYes: Bool,
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
          isYes,
          (earlierProof.publicInput as any).yesCnt,
          (earlierProof.publicInput as any).noCnt
        );
        const inputCnt = Provable.if(isYes, input.yesCnt, input.noCnt);
        x.add(1).assertEquals(inputCnt);
      },
    },
  },
});

// const merkleMap = new MerkleMap();
// merkleMap.set(Field(1001), Field(1));
// merkleMap.set(Field(1002), Field(1));
// merkleMap.set(Field(1003), Field(1));
// const memberRoot = merkleMap.getRoot();
// console.log('memberRoot', memberRoot);

// const userWitness = merkleMap.getWitness(Field(1002));
// let [root, key] = userWitness.computeRootAndKey(Field(1));
// console.log('root', root);
// console.log('key', key);
