import { VoteProgram, VoteDataCLass } from './VoteZK';
import { MerkleMap, Bool, Field } from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

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

      voteData = new VoteDataCLass({
        yesCnt: Field(0),
        noCnt: Field(0),
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

  it('member vote yes', async () => {
    let voteData2 = new VoteDataCLass({
      yesCnt: initProf.publicInput.yesCnt.add(1),
      noCnt: initProf.publicInput.noCnt,
      memberTreeRoot: initProf.publicInput.memberTreeRoot,
    });
    let proof2 = await VoteProgram.vote(
      voteData2,
      new Bool(true),
      merkleMap.getWitness(Field(1001)),
      initProf
    );
    // console.log('proof2', proof2);

    let voteVerify = await VoteProgram.verify(proof2);
    console.log('member vote yes voteVerify', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = voteData2;
    preProof = proof2;
  });

  it('member vote no', async () => {
    let voteData2 = new VoteDataCLass({
      yesCnt: preProof.publicInput.yesCnt,
      noCnt: preProof.publicInput.noCnt.add(1),
      memberTreeRoot: preProof.publicInput.memberTreeRoot,
    });
    let proof2 = await VoteProgram.vote(
      voteData2,
      new Bool(false),
      merkleMap.getWitness(Field(1002)),
      preProof
    );
    // console.log('proof2', proof2);

    let voteVerify = await VoteProgram.verify(proof2);
    console.log('member vote no voteVerify', voteVerify);
    expect(voteVerify).toEqual(true);
    voteData = voteData2;
    preProof = proof2;
  });

  // it('not member vote no, should fail', async () => {
  //   let voteData2 = new VoteDataCLass({
  //     yesCnt: preProof.publicInput.yesCnt,
  //     noCnt: preProof.publicInput.noCnt.add(1),
  //     memberTreeRoot: preProof.publicInput.memberTreeRoot,
  //   });
  //   let proof2 = await VoteProgram.vote(
  //     voteData2,
  //     new Bool(false),
  //     merkleMap.getWitness(Field(1010)),
  //     preProof
  //   );
  //   // console.log('proof2', proof2);

  //   let voteVerify = await VoteProgram.verify(proof2);
  //   console.log('member vote no voteVerify', voteVerify);
  //   expect(voteVerify).toEqual(true);
  //   voteData = voteData2;
  //   preProof = proof2;
  // });
});
