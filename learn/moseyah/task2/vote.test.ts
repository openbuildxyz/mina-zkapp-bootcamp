import { VoteProgram, VoteClass } from './vote';
import { MerkleMap, Bool, Field, Proof } from 'o1js';

let proofsEnabled = true;

describe('Vote', () => {
  let voteData: VoteClass,
    vK: {
      data: string;
      hash: Field;
    },
    initProf: Proof<VoteClass, void>,
    preProof: Proof<VoteClass, void>,
    merkleMap: MerkleMap;

  beforeAll(async () => {
    if (proofsEnabled) {
      console.log('compile start');
      let { verificationKey } = await VoteProgram.compile();
      console.log('verificationKey', verificationKey);
      vK = verificationKey;

      // create merkleMap
      merkleMap = new MerkleMap();
      merkleMap.set(Field(1001), Field(1));
      merkleMap.set(Field(1002), Field(1));
      merkleMap.set(Field(1003), Field(1));
      const memberTreeRoot = merkleMap.getRoot();
      console.log('memberRoot', memberTreeRoot);

      voteData = new VoteClass({
        agreeCount: Field(0),
        disAgreeCount: Field(0),
        memberTreeRoot: memberTreeRoot,
      });
    }
  });

  it('init VoteProgram', async () => {
    const initProfData = await VoteProgram.init(voteData);
    initProf = initProfData.proof;
    let initVerify = await VoteProgram.verify(initProf);
    console.log('initVerify', initVerify);
    expect(initVerify).toEqual(true);
  });

  it('member vote agree', async () => {
    let voteData2 = new VoteClass({
      agreeCount: initProf.publicInput.agreeCount.add(1),
      disAgreeCount: initProf.publicInput.disAgreeCount,
      memberTreeRoot: initProf.publicInput.memberTreeRoot,
    });
    let proof2 = await VoteProgram.vote(
      voteData2,
      new Bool(true),
      merkleMap.getWitness(Field(1001)),
      initProf
    );

    let voteVerify = await VoteProgram.verify(proof2.proof);
    console.log('verify agree vote', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = voteData2;
    preProof = proof2.proof;
  });

  it('member vote disAgree', async () => {
    let voteData2 = new VoteClass({
      agreeCount: preProof.publicInput.agreeCount,
      disAgreeCount: preProof.publicInput.disAgreeCount.add(1),
      memberTreeRoot: preProof.publicInput.memberTreeRoot,
    });
    let proof2 = await VoteProgram.vote(
      voteData2,
      new Bool(false),
      merkleMap.getWitness(Field(1002)),
      preProof
    );

    let voteVerify = await VoteProgram.verify(proof2.proof);
    console.log('verify disAgree vote', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = voteData2;
    preProof = proof2.proof;
  });

  it('wrong member vote', async () => {
    let voteData2 = new VoteClass({
      agreeCount: preProof.publicInput.agreeCount,
      disAgreeCount: preProof.publicInput.disAgreeCount.add(1),
      memberTreeRoot: preProof.publicInput.memberTreeRoot,
    });
    try {
      await VoteProgram.vote(
        voteData2,
        new Bool(false),
        merkleMap.getWitness(Field(1008)),
        preProof
      );
    } catch (error: any) {
      const hasError = !!error
      expect(hasError).toEqual(true);
    }
  });
});
