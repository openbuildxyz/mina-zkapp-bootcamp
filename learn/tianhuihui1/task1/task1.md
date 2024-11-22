# 创建Auro wallet账户，完成水龙头领水

#### 1. 概述Mina所采用的证明系统(包括名称、特点)
答：
Mina

1. 22kb 固定大小，递归零知识证明，低资源，高效
2. 去中心化，用零知识证明来解决隐私和扩展问题

#### 2. 概述递归零知识证明在 Mina 共识过程中的应用

答：
1. 隐私验证保护，验资、匿名投票、隐私交易
2. 计算压缩，区块链扩容

数字签名、哈希原像、红绿色盲、地图三色问题

交互式零知识证明：证明者和验证者同时在线，证明者对每个验证者都要证明一次数据的真实性，eg: 零知识洞穴、色盲游戏
非交互式零知识证明：无需同时在线，证明者创建一份证明，任何使用这份证明的人都可以验证，eg: 数独游戏

步骤：
将问题转换成描述（o1js 写电路代码）
编译电路成 plonkish 格式，生成 Proverkey, VerificationKey
证明者结合 ProverKey 用 Prove 函数生成证明 Proof
验证者结合 VerificationKey 用 Veriffy 函数验证 proof 真假

递归压缩证明：
Proof(n) of Proof(n-1) of ... Proof(i) of ... of Proof(0)
验证最终的 Proof(n) 为真，即前面的都为真

POS-Chain's 共识
1. 选出 Block Producer
2. 构造新的 Block
  2.a 验证交易计算出哈希
  2.b 基于上一个交易验证后的区块哈希，构造出新的区块
3. 广播这个新区快
4. 其他验证者验证新区快

[./WX20241118-222535@2x.png]

#### 3. 下载安装 [Auro wallet](https://www.aurowallet.com/download/)，创建账户，并完成[领水](https://faucet.minaprotocol.com/)

答：

[./WX20241118-225351.png]

**tx hash**: 5JuTAQhvaKLQov2qFZ5cfhKNzAurKKYyHC7e6yBvgEVAJaPHcw1x

![alt text](1122.png)

