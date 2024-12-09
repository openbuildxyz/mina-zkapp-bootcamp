
## 1.ZKP(Zero knowledge Proof-零知识证明)
* 由 S.Goldwasser、S.Micali 及 C.Rackoff 在 20 世纪 80 年代初提出的。
* 它指的是证明者（prover）能够在不向验证者（verifier）提供任何有用的信息的情况下，使验证者相信某个论断是正确的，即它使证明者能够说服验证者相信他拥有某些信息（或符合指定条件、门槛），而无需透露实际信息（或数据）本身。
* 特点
  * 私密（Private）
  * 无需信任（Trustless）
  * 高效（Efficient）
  * 去中心化（Decentralized）
  * 应用场景：隐私保护（验资、匿名投票、隐私交易）、计算压缩（区块链扩容）
* ZKP属于 概率性证明, 而非数学上的严谨证明
* 交互式零知识证明
  * 证明者和验证者需要同时在线。证明者面对每个验证者都要证明一次数据的真实性。
* 非交互式零知识证明
  * 证明者和验证者无需同时在线。证明者创建一份证明，任何使用这份证明的人都可以进行验证。

## 2.零知识证明步骤
1. 将问题转换成描述
2. 编译电路，并生成ProverKey和VerificationKey
   * 可能需要可信设置(Trusted Setup)
3. 证明者使用Prove函数（需结合ProverKey）生成证明（Proof）
4. 验证者使用Verify函数（需结合VerificationKey）验证Proof真假

## 3.Kimchi -Based的Mina’s zkApp的开发流程:
1. 将问题转换成电路描述(用o1js写电路代码)。
2. 将电路编译 (complie) 成plonkish格式, 同时生成PK (proving key)，VK(verifying key)。
3. 证明者使用函数 Prove 函数生成证明(Proof)。
4. 验证者使用 Verify 函数，验证proof的真假。    

## 4.Mina Kimchi
* 大小只有22Kb，账本会一直保持在22kb，之所以能这么小是因为递归 zkSNARK。递归 zkSNARK的每一个电路生成的证明会作为参数，传到另外的电路中，并且进行验证，另外的电路会生成第二个证明。另外生成的证明会被传到第三个电路中。

## 5.Pos-china共识的步骤
1. 选择见证人（Choose Block Producer）
2. 构建新区块（Construct a new Block）
   1. 验证一组交易（Validate a set of Tx）
   2. 根据验证的交易集和前一个区块的哈希值构建新区块（Construct a new Block based on the validated Tx set & Previous Block’s hash）
   * Mina为以上步骤分别写零知识电路，并生成对应的证明
3. 广播新区块（Broadcast the new block）
4. 其他验证者验证新区块（Other validators validate the new block）

## 6.Mina学习资源
1. [Mina官网](https://minaprotocol.com)
2. [Mina Github](https://github.com/minaProtocol) 
3. [Mina开发者文档](https://docs.minaprotocol.com)
4. [o1lab官网](https://www.o1labs.org)
5. [o1lab Github](https://github.com/o1-labs)
6. [Mina Chain Explorer](https://minascan.io/mainnet/home)
7. [Auro Wallet](https://www.aurowallet.com/)
8. [Pallad Wallet](https://pallad.co/)
9. [Mina DevNet Faucet](https://faucet.minaprotocol.com/)