
### task1：创建 auro wallet 账户，完成水龙头领水

1. 概述Mina所采用的证明系统(包括名称、特点)

名称：

zk-SNARKs（零知识简洁非交互式知识证明）

特点：

零知识性 (Zero-Knowledge)：
zk-SNARKs 允许证明者向验证者证明某些信息的真实性，而无需透露具体内容。这一特性确保了隐私性。

简洁性 (Succinctness)：
生成的证明非常小，并且验证时间很短。无论 Mina 的区块链历史有多长，验证者都只需要一个小型的证明来验证整个状态。

非交互性 (Non-Interactive)：
证明过程只需要单向发送，不需要验证者与证明者多次交互，适合高效的网络环境。

可组合性 (Composability)：
Mina 通过 zk-SNARKs 实现递归证明（Recursive Proofs），允许新的状态证明嵌套在已有证明中，使区块链状态的增长不再增加验证成本。


2. 概述递归零知识证明在 Mina 共识过程中的应用

在 Mina 协议中，递归零知识证明使得整个区块链的验证状态可以压缩为一个固定大小的证明（约 22KB）。新生成的区块包含上一状态的递归证明，而不包含整个区块链历史。每次生成一个新区块，Mina 验证器会将当前状态和新区块一起构成一个新的递归证明。

3. 下载安装 [Auro wallet](https://www.aurowallet.com/download/)，创建账户，并完成[领水](https://faucet.minaprotocol.com/)

请提交回答，钱包账户截图和领水 `tx hash: 5Jv5McxVaVoPhqVTU8nTyq2YQ1cEdcZDhsV4potam1UXeuDYrQm5`。


