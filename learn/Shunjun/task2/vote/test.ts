import {
  Field,
  Bool,
  Signature,
  ZkProgram,
  Proof,
  JsonProof,
  verify,
} from "o1js";
import { VoteCounter, memberPrivateKeys, Voter, CountVotes } from "./vote";

async function main() {
  const VoteCounterProof = ZkProgram.Proof(VoteCounter);

  console.log("compiling VoteCounter...");
  console.time("VoteCounter.compile time cost ");
  let { verificationKey } = await VoteCounter.compile();
  console.timeEnd("VoteCounter.compile time cost ");
  console.log("verification key", verificationKey.data.slice(0, 10) + "..");

  // 初始化投票
  console.time("VoteCounter.initVote time cost ");
  const initialVotes = new CountVotes({
    approveTotalCount: Field(0),
    rejectTotalCount: Field(0),
  });
  let proof = (await VoteCounter.initVote(initialVotes)).proof;
  console.timeEnd("VoteCounter.initVote time cost ");
  proof = await testJsonRoundtrip(VoteCounterProof, proof);

  console.log("verify...");
  console.time("verify VoteCounter time cost ");
  let ok = await verify(proof.toJSON(), verificationKey);
  console.timeEnd("verify VoteCounter` time cost ");
  console.log("ok?", ok);

  console.log("verify alternative...");
  ok = await VoteCounter.verify(proof);
  console.log("ok (alternative)?", ok);

  for (const key of memberPrivateKeys) {
    const option = Math.random() > 0.5;
    const voterMessage = key
      .toPublicKey()
      .toFields()
      .concat(Bool(option).toFields());
    const signature = Signature.create(key, voterMessage);

    if (option) {
      initialVotes.approveTotalCount = initialVotes.approveTotalCount.add(
        Field(1)
      );
    } else {
      initialVotes.rejectTotalCount = initialVotes.rejectTotalCount.add(
        Field(1)
      );
    }

    proof = (
      await VoteCounter.vote(
        initialVotes,
        new Voter({
          id: key.toPublicKey(),
          voteOption: Bool(option),
          signature: signature,
        }),
        proof
      )
    ).proof;
    proof = await testJsonRoundtrip(VoteCounterProof, proof);

    console.log("verify...");
    ok = await verify(proof, verificationKey);
    console.log("ok?", ok);

    console.log("verify alternative...");
    ok = await VoteCounter.verify(proof);
    console.log("ok (alternative)?", ok);
  }

  // 检查投票结果
  console.log("Total Yes Votes:", initialVotes.approveTotalCount.toString());
  console.log("Total No Votes:", initialVotes.rejectTotalCount.toString());
}

function testJsonRoundtrip<
  P extends Proof<any, any>,
  MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    "json proof",
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + "..",
    })
  );
  return MyProof.fromJSON(jsonProof);
}

main().catch(console.error);
