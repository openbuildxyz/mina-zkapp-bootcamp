# Mina zkApp 训练营 - Task 2

## 1. Mina电路前置知识 

### 数据类型

Mina的证明系统跟其他zk系统一样，最底层的数据类型是有限域元素，定义为 Field，这个数据类型需要 256 bit（但最大值小于 $2^{256}-1$）。电路中所有的运算都是基于这个数据类型，目前 Field 所支持的运算有：add, sub, mul, div, square, sqrt, equals, greaterThan, not, or, and, toBoolean, toBits.

为了便于编程，O1JS还封装了其他的数据类型：Bool, UInt32, UInt64, CircuitString, PublicKey, PrivateKey, Signature, Group, Scalar, Poseidon, MerkelTree, MerkleMap. 其中比较常用的使用方法包括：

```ts
let hash = Poseidon.hash([x]);
let privKey = PrivateKey.random();
let pubKey = PublicKey.fromPrivateKey(privKey);
let msg = [hash]
let sig = Signature.create(privKey, msg);
sig.verify(pubKey, sig);
```

O1JS 还支持使用 Struct 自定义符合类型：

```ts
let CompoundType = Struct({
    foo: [Field, Field],
    bar: [x: Field, b: Bool],
});

// note: 必须通过一个类继承这个类型，才可以使用
class CompoundClass extends CompoundType {};
let obj = CompoundClass({foo: [x0, z], bar: {x: x1, b: b1}})
```

特别的，如果是递归证明电路，O1JS 提供 `SelfProof` 数据类型用于表示电路中某个计算逻辑约束的证明。

### 约束

在零知识证明领域，我们对计算过程施加约束，确保计算过程符合预期。O1JS 里面，主要是通过 `assertEquals()` 施加等价约束，进一步的还有 Provable.if() 和 Provable.switch 也可以进行条件约束。

### 电路撰写

一个平凡的Mina电路框架：

```ts
let MyProgram = ZkProgram({
    name: "Hash-Prover",
    publicInput: Field,
    publicOuput: Field,
    methods: {
        proveHash: {
            privateInputs: [Field],
            async method(targetHash: Field, privInput: Field) {
                const hashX = Poseidon.hash([privInput]);
                targetHash.assertEquals(hashX); // constraint
            },
        }
    },
});
```
可以看到一个电路就是就是一个 ZkProgram 对象，它有 name，publicInput，publicOutput, methods 四个字段，分别表示电路名称，公共输入，公共输出，以及具体的具体的计算约束。其中 publicInput 和 publicOutput 作用于所有的计算约束，并且就对应于 methods 中所有的计算约束的第一、二个传参。

> 当然，并不是所有的 ZkProgram 都有公共输入和公共输出，但如果有，则只能出现一个，如果有多个公共输入/公共输出，则应该自定义复杂类型。

进一步的看 methods 中的计算约束，O1JS 允许定义多个计算约束。每一个计算约束是一个对象，对象中包含相应的 privateInputs 和逻辑约束，其中逻辑约束必须是是异步（async）函数。 

## 2. zkVote

Task 2 要求我们设计一个简单的投票统计器，这显然需要使用到递归证明。拆解为 3 个需求：

- 投票隐私：确保单个用户的投票内容无法被公开。
- 投票验证：确保只有合法用户才能参与，且每人只能投一次。
- 结果统计：以零知识的方式验证统计结果的正确性。


