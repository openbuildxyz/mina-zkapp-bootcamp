# Mina zkApp 训练营

#### 个人信息

- github 用户名：zhaojay-create
- OpenBuild 注册邮箱：zhaojay1211@gmail.com
- Mina 钱包地址：B62qrWwRfrEKDUL5fCC6genTGi1xcJRBe5e9t2qmPn6sAy37RnVtsWa

#### 自我介绍

工作经验 1 年的前端开发, 技术栈:react,typescript

##### ZK 零知识证明

简介: A 向 B 证明,A 具有某些信息,无需提供这些信息.

- 交互式零知识证明

  证明者验证者需要同时在线。证明者面对每个验证者都要证明一次数据的真实性。
  sample:零知识洞穴、色盲游戏

- \*非交互式零知识证明

  证明者和验证者无需同时在线。证明者创健一份证明，任何使用这份证明的人都可以进行验证。
  sample:数独游戏

一个完整的 zkp 系统组成部分：

- 前端系统：负责电路开发语言规范，算术化编译等

  DSL & 嵌入式 DSL & ZkVM/zkEVM
  编译器编译成 R1CS/Plonkish 等约束格式

- 后端证明系统：负责生成证明和验证证明

  Groth16,PLONK,(Kimchi),zkSTARK

前端编写代码,编译后传递给后端,后端生成验证证明.

电路代码, o1js, 电路是编写一套规则, 证明者输入, 验证者验证结果, 无需知道输入值.

**ZK 的一般步骤**

1. 将问题转换成描述
2. 编译电路，并生成 ProverKey 和 VerificationKey 可能需要可信设置 (Trusted Setup)
3. 证明者使用 Prove 函数(需结合 ProverKey)生成证明 proof
4. 验证者使用 Verify 函数(需结合 VerificationKey)验证 proof 的真假

**kimchain**

1. 将问题转换成电路描述(用 o1js 写电路代码)。
2. 将电路编译(complie)成 plonkish 格式，同时生成 PK (proving key),VK(verifying key).
   ~~3. 任何一方使用 Trusted Setups 生成一些随机的参数，包括 PK (preving key),VK(veritying key).~~
3. 证明者使用函数 Prove 函数生成证明(Proof)。
4. 验证者使用 Verify 函数，验证 proof 的真假。

**recursive zkp 递归零知识证明**
验证了,第 N 项合法,N 之前的都合法.

circuit() => p0
circuit(p0) => p1
circuit(p1) => p2

p2 合法,说明 p1 合法,p1 合法,说明 p0 合法.

生成一个新的证明,会把上一次的证明作为参数传递进去,减少了计算量.

##### 构建新区块过程,生成证明

传统区块链的打包

1. 选择一个 block producer
2. 创建一个新的 block
   - 验证每一个交易
   - 根据已经验证交易的 set,和前一个区块的 hash 创建一个新的块.
3. 打包新的块
4. 其他人来验证

mina 跟 POS 区块链的打包步骤一样,多了几个步骤
mina 打包

1. 选择一个 block producer
2. 创建一个新的 block
   - 验证每一个交易 --> 生成 txBatchProof 交易证明
   - 根据已经验证交易的 set,和前一个区块的 hash 创建一个新的块 --> 生成区块证明 blockProof_i(包括验证 txBatchProof)
   - 利用 blockProof_i 和 ChainProof_i-1 生成 ChainProof_i (ChainProof_i 会证明,i 和 i 之前的块是合法的)
3. 打包新的块
4. 其他人来验证

#### zk 命令行工具

https://docs.minaprotocol.com/zkapps/writing-a-zkapp/introduction-to-zkapps/install-zkapp-cli

搭建一个 zk 项目

```
zk project projectName
```

##### o1js 数据类型

Field, // unit256
Bool,
UInt32,Ulnt64
CircuitString
PublicKey,PrivateKey,Signature //公钥,私钥,签名
Group,Scalar //
Poseidon hash // 波塞冬,hash 函数
MerkleTree,MerkleMap

```
let x = new Field(4) // x =4
x = x.add(3); // x = 7
x = x.sub(1); // x = 6
x = x.mul(3); // x = 18
x = x.div(2); // x = 9
x = x.square(); // x = 81
x = x.sqrt(); // x = 9

let b = x.equals(8); // false
b = x.greaterThan(8); // 比8大? true
b = b.not().or(b).and(b); // true ; not 取反, 或运算, 与运算
b.toBoolean(); // true

let hash = Poseidon.hash([x]); // 明文数组,传入,得到哈希值

let privKey = PrivateKey.random(); // 创建一个私钥
let pubKey = PublicKey.fromPrivateKey(privKey); // 生成公钥

let msg = [hash]; // 签名
let sig = Signature.create(privKey, msg); // 基于私钥对指定的消息进行签名
sig.verify(pubKey, msg); // 签名后进行验证签名
```

**没有 if else, 有三元**

```
const x = Provable.if(new Bool(foo), a, b); // foo ? a : b;
```

**使用 Struct 构造新类型**

```
let CompoundType = Struct({
  foo: [Field, Field],
  bar: {x: Field, y: Field}
})
// 使用类型
class CompoundClass extends CompoundType {}

let CompoundObj0 = new CompoundClass({for: [x0, z], bar: {x: 1, y: 2} })
```

第一个参数,是 bool 的数组
第二个参数,是希望返回的是 Int64 类型的数据
第三个参数,是结果数组
在这个例子中,第二个 bool 是 true,x === Int64.from(2)

```
let x = Provable.switch([Bool(false), Bool(true), Bool(false)], Int64, [
  Int64.from(1),
  Int64.from(2),
  Int64.from(3),
]);
x.assertEquals(Int64.from(2));
```

Zero Knowledge Proof

compile(program) -> verification_key:string
prove(program,public_inputs,private_inputs) -> proof:string
verify(proof,public_inputs,verification_key) -> boolean

##### Proof 对象的结构

```
{
"publciInput": Field[], // 电路method的公开入参
"publcioutput": Field[], //电路method的返回值
"maxProofVerified":Integer, // 电路method中验证的proof的个数
"proof":binary type //proof本身,二进制格式
}
```

##### 一个完整的 zkprogram 的结构

```
{
  name:string,
publciInput: any, //电路method的公开入参, 可选,only one
publcioutput: any //电路method的返回值, 可选,only one
methods:{
    customMethod1:{
      privateInput: any, // 当前method 的私有入参,必选, 允许是空数组
      async method(publicInputType, ...privateInputs) {
          //...constrains
          // return, 如果定义了publcioutput就需要return
      }
  },
    customMethod2:{
      privateInput: any, // 当前method 的私有入参,必选, 允许是空数组
      async method(publicInputType, ...privateInputs) {
          //...constrains
          // return, 如果定义了publcioutput就需要return
      }
  }
}
}
```
