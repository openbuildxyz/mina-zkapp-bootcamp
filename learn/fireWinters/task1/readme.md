### task1：创建 auro wallet 账户，完成水龙头领水

1. 概述Mina所采用的证明系统(包括名称、特点)
Mina 使用无限递归零知识证明来创建 22KB 区块链，用于证明任何事物并启用隐私优先的应用程序。
zk-SNARKs
全称：Zero-Knowledge Succinct Non-Interactive Argument of Knowledge。
Mina的 zk-SNARKs 证明系统以其零知识、简洁性和高效性为特点，使得 Mina 成为一种资源友好型和隐私保护型的区块链协议.

2. 概述递归零知识证明在 Mina 共识过程中的应用
- 保持去中心化，避免状态膨胀而造成的中心化趋势。
- 解决隐私和可扩展性
- 能够存储价值，低成本的无需许可的交易。
step1) validate a batch of Tx;    ->  generate TxBatchProof
step2) construct new Block_i based on Tx Batch & lastBlock’s hash   ->  generate BlockProof_i  (including verify TxBatchProof  internally)
step3) generate ChainProof_i  based on ChainProof_i -1  & BlockProof_i  
Each ChainProof_i  means : The Whole Chain History from GenesisBlock to Block_i  is Valid.


3. 下载安装 [Auro wallet]，创建账户，并完成[领水](https://faucet.minaprotocol.com/)

请提交回答，钱包账户截图和领水 `tx hash`。

tx hash:
5JvHWiZTgkk63vYVBsDRo9CbNAgmKsakZqDKGHVDQnPEUcL62b2U

![](./wallet-pic.png)