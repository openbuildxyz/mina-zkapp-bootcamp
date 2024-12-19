import { VoteProgram, VoteDataCLass } from './VoteCounter';
import { MerkleMap, Bool, Field } from 'o1js';


let proofsEnabled = true;

describe('Add', () => {
  let voteData: VoteDataCLass,
    vK: {
      data: string;
      hash: Field;
    },
    initProf: any,
    preProof: any,
    merkleMap: MerkleMap;
  // 
  beforeAll(async () => {
    if (proofsEnabled) {
      console.log('compile start');
      let { verificationKey } = await VoteProgram.compile();
      console.log('verificationKey', verificationKey);
      vK = verificationKey;

      // init merkleMap
      merkleMap = new MerkleMap();
      merkleMap.set(Field(1001), Field(1));
      merkleMap.set(Field(1002), Field(1));
      merkleMap.set(Field(1003), Field(1));
      const memberTreeRoot = merkleMap.getRoot();
      console.log('memberRoot', memberTreeRoot);

      voteData = new VoteDataCLass({
        agreeCnt: Field(0),
        disagreeCnt: Field(0),
        memberTreeRoot: memberTreeRoot,
      });
    }
  });

  it('init VoteProgram', async () => {
    initProf = await VoteProgram.init(voteData);
    let initVerify = await VoteProgram.verify(initProf);
    console.log('initVerify', initVerify);
    expect(initVerify).toEqual(true);
  });

  it('vote agree', async () => {
    let voteDataAgree = new VoteDataCLass({
      agreeCnt: initProf.publicInput.agreeCnt.add(1),
      disagreeCnt: initProf.publicInput.disagreeCnt,
      memberTreeRoot: initProf.publicInput.memberTreeRoot,
    });
    let proofAgree = await VoteProgram.vote(
      voteDataAgree,
      new Bool(true),
      merkleMap.getWitness(Field(1001)),
      initProf
    );
    console.log('proofAgree', proofAgree);

    let voteVerify = await VoteProgram.verify(proofAgree);
    console.log('vote agree voteVerify', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = voteDataAgree;
    preProof = proofAgree;
  });

  it('vote disagree', async () => {
    let voteDataDisagree = new VoteDataCLass({
      agreeCnt: preProof.publicInput.agreeCnt,
      disagreeCnt: preProof.publicInput.disagreeCnt.add(1),
      memberTreeRoot: preProof.publicInput.memberTreeRoot,
    });
    let proofDisagree = await VoteProgram.vote(
      voteDataDisagree,
      new Bool(false),
      merkleMap.getWitness(Field(1002)),
      preProof
    );

    let voteVerify = await VoteProgram.verify(proofDisagree);
    console.log('vote disagree voteVerify', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = proofDisagree;
    preProof = proofDisagree;
  });
});