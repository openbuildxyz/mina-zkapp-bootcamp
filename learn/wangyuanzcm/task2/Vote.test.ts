import {
  AccountUpdate,
  Bool,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  verify,
  MerkleMap,
} from 'o1js';
import { VoteProgram, VoteResult } from './Vote.js';

let proofsEnabled = false;

describe('Vote', () => {
  let initVoteResult: VoteResult,
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
      const { verificationKey } = await VoteProgram.compile();
      vK = verificationKey;

      // 创建merkleMap,用来记录团队成员和他们是否已经投票的状态
      merkleMap = new MerkleMap();
      merkleMap.set(Field(1001), Field(1));
      merkleMap.set(Field(1002), Field(1));
      merkleMap.set(Field(1003), Field(1));
      const memberTreeRoot = merkleMap.getRoot();

      initVoteResult = new VoteResult({
        yes: Field(0),
        no: Field(0),
        voter: memberTreeRoot,
      });
    }
  });

  it(' init vote application', async () => {
    initProf = await VoteProgram.init(initVoteResult);
    let initVerify = await VoteProgram.verify(initProf);
    console.log('initVerify', initVerify);
    expect(initVerify).toEqual(true);
  });

  it('Accumulate the number of votes in favor and against', async () => {
    let voteResult = new VoteResult({
      yes: initProf.publicInput.yes.add(1),
      no: initProf.publicInput.no,
      voter: initProf.publicInput.voter,
    });
    let currentProof = await VoteProgram.vote(
      voteResult,
      new Bool(true),
      merkleMap.getWitness(Field(1001)),
      initProf
    );
// @ts-expect-error
    let voteVerify = await VoteProgram.verify(currentProof);
    expect(voteVerify).toEqual(true);
    initVoteResult = voteResult;
    preProof = currentProof;
  });
});
