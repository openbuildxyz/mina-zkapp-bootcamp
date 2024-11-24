## 概述Mina所采用的证明系统

Mina使用的是递归零知识证明 - zk SNARKs。

#### 特点

将区块链种所有历史交易压缩为单个简洁证明，从而使Mina链保持在22kb大小。

## 概述递归零知识证明在 Mina 共识过程中的应用

1.保持区块链大小恒定，每个新区块拥有前一区块的证明。整个区块的历史和状态被压缩为一个单一的零知识证明，而无需灭个节点存储完整的区块链历史。

2.节点只需要验证但钱的递归证明，而不是从创世块开始。

3.证明计算和状态的正确，但无需泄露计算的输入细节

4.参与者仅需下载和验证单个递归证明，降低了用户的硬件要求。
https://github.com/DOV-3/mina-zkapp-bootcamp/blob/main/learn/DOV-3/task1/Snipaste_2024-11-24_20-51-42.png

tx hash:B62qrBYFpTVKKt4976JyPJvTBB3kCjScAc1Be9yyAgSM92AyEjDbJcp
