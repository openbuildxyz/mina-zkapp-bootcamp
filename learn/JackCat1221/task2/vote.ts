import {
  Bool,
  SelfProof,
  Field,
  ZkProgram,
  verify,
  Proof,
  JsonProof,
  Provable,
} from 'o1js';


let MyProgram = ZkProgram({
  name: 'Vote',
  publicInput: Field,
  //publicOutput: Field,

  methods: {
    baseCase: {
      privateInputs: [],
      async method(input: Field) {
        input.assertEquals(Field(0));// constraint
      },
    },

    inductiveCase: {
      privateInputs: [SelfProof],
      async method(input: Field, earlierProof: SelfProof<Field, void>) {
        Provable.log(`1) earlierProof.verify`);
        earlierProof.verify();
        Provable.log(`2) earlierProof.publicInput.add`);
        earlierProof.publicInput.add(1).assertEquals(input);
      },
    },
  },
});
// type sanity checks
MyProgram.publicInputType satisfies typeof Field;
MyProgram.publicOutputType satisfies Provable<void>;

let MyProof = ZkProgram.Proof(MyProgram);

let MyProgram1 = ZkProgram({
  name: 'Vote',
  publicInput: Field,
  //publicOutput: Field,

  methods: {
    baseCase: {
      privateInputs: [],
      async method(input: Field) {
        input.assertEquals(Field(0));// constraint
      },
    },

    inductiveCase: {
      privateInputs: [SelfProof],
      async method(input: Field, earlierProof: SelfProof<Field, void>) {
        Provable.log(`1) earlierProof.verify`);
        earlierProof.verify();
        Provable.log(`2) earlierProof.publicInput.add`);
        earlierProof.publicInput.add(1).assertEquals(input);
      },
    },
  },
});
// type sanity checks
MyProgram1.publicInputType satisfies typeof Field;
MyProgram1.publicOutputType satisfies Provable<void>;

let MyProof1 = ZkProgram.Proof(MyProgram);


let MyProgram2 = ZkProgram({
  name: 'Vote',
  publicInput: Field,
  //publicOutput: Field,

  methods: {
    baseCase: {
      privateInputs: [],
      async method(input: Field) {
        input.assertEquals(Field(0));// constraint
      },
    },

    inductiveCase: {
      privateInputs: [SelfProof],
      async method(input: Field, earlierProof: SelfProof<Field, void>) {
        Provable.log(`1) earlierProof.verify`);
        earlierProof.verify();
        Provable.log(`2) earlierProof.publicInput.add`);
        earlierProof.publicInput.add(1).assertEquals(input);
      },
    },
  },
});
// type sanity checks
MyProgram2.publicInputType satisfies typeof Field;
MyProgram2.publicOutputType satisfies Provable<void>;

let MyProof2 = ZkProgram.Proof(MyProgram);

console.log('program digest', await MyProgram.digest());

console.log('compiling MyProgram...');
console.time('MyProgram.compile time cost ');
let { verificationKey } = await MyProgram.compile();
let { verificationKey: verificationKey1 } = await MyProgram1.compile();
let { verificationKey: verificationKey2 } = await MyProgram2.compile();
console.timeEnd('MyProgram.compile time cost ');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('proving base case...');
console.time('MyProgram.baseCase time cost ');
let input = Field(0);
let input1 = Field(0);
let input2 = Field(0);
let proof = await MyProgram.baseCase(input);
let proof1 = await MyProgram1.baseCase(input);
let proof2 = await MyProgram2.baseCase(input);
console.timeEnd('MyProgram.baseCase time cost ');
proof = await testJsonRoundtrip(MyProof, proof);
proof1 = await testJsonRoundtrip(MyProof1, proof);
proof2 = await testJsonRoundtrip(MyProof2, proof);

// type sanity check
proof satisfies Proof<Field, void>;
proof1 satisfies Proof<Field, void>;
proof2 satisfies Proof<Field, void>;

console.log('verify...');
console.time('verify MyProgram time cost ');
let ok = await verify(proof.toJSON(), verificationKey);
let ok1 = await verify(proof1.toJSON(), verificationKey1);
let ok2 = await verify(proof2.toJSON(), verificationKey2);
console.timeEnd('verify MyProgram time cost ');
console.log('ok?', ok);

console.log('verify alternative...');
ok = await MyProgram.verify(proof);
ok1 = await MyProgram.verify(proof);
ok2 = await MyProgram.verify(proof);
console.log('ok (alternative)?', ok);

console.log('proving step 1...');
console.time('MyProgram.inductiveCase time cost ');


// 投票 true
input = input.add(1)
input1 = input1.add(1)
proof = await MyProgram.inductiveCase(input, proof)
proof1 = await MyProgram1.inductiveCase(input, proof1)
console.timeEnd('MyProgram.inductiveCase time cost ');
proof = await testJsonRoundtrip(MyProof, proof);
proof1 = await testJsonRoundtrip(MyProof1, proof1);

console.log('verify...');
ok = await verify(proof, verificationKey);
ok = await verify(proof1, verificationKey1);
console.log('ok?', ok);

console.log('verify alternative...');
ok = await MyProgram.verify(proof);
ok = await MyProgram1.verify(proof1);
console.log('ok (alternative)?', ok);

console.log('proving step 2...');

// 投票 false
input = input.add(1)
input2 = input2.add(1)
proof = await MyProgram.inductiveCase(input, proof);
proof2 = await MyProgram2.inductiveCase(input2, proof2);

proof = await testJsonRoundtrip(MyProof, proof);
proof2 = await testJsonRoundtrip(MyProof2, proof2);

console.log('verify...');
ok = await verify(proof.toJSON(), verificationKey);
ok = await verify(proof2.toJSON(), verificationKey2);

console.log('ok?', ok);

function testJsonRoundtrip<
  P extends Proof<any, any>,
  MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'json proof',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '..',
    })
  );
  return MyProof.fromJSON(jsonProof);
}

