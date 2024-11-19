
### task1：创建 auro wallet 账户，完成水龙头领水

1. 概述Mina所采用的证明系统(包括名称、特点)
   递归零知识证明（zk-SNARKs）
   简洁性：zk-SNARKs 生成的证明非常小，验证过程快速高效；
   隐私保护：用户可以在不暴露数据本身的情况下，分享数据的证明，这样保护了用户隐私；
2. 概述递归零知识证明在 Mina 共识过程中的应用
   固定大小的区块链：
    Mina Protocol的区块链始终保持在22KB的固定大小，这得益于zk-SNARKs生成的递归证明。这意味着，无论网络上发生多少交易，节点不需要存储完整的历史数据，只需验证当前状态的单一递归证明即可。
   区块生产与验证：
    每当一个新的区块被提议时，区块生产者必须同时提交一个zk-SNARK证明。这一证明表明该区块及其所有历史状态都是有效的，从而使节点能够快速验证交易而无需下载整个区块链。
   去中心化与参与门槛：
    由于zk-SNARKs的使用，Mina允许任何人以较低的计算资源参与网络，无需运行完整节点。这降低了加入网络的门槛，增强了去中心化特性。
   隐私保护与智能合约：
    Mina还利用zk-SNARKs支持zkApps（零知识智能合约），这些合约在本地设备上进行计算，并且只在链上共享结果的证明。这种方式确保用户数据隐私，同时仍然能够在区块链上进行验证。
3. 下载安装 [Auro wallet](https://www.aurowallet.com/download/)，创建账户，并完成[领水](https://faucet.minaprotocol.com/)

请提交回答，钱包账户截图和领水 `tx hash`。
https://minascan.io/devnet/tx/5JvDpFxqSWYhchjzXZM2TMxwhqWhA4EVUT6wokjEd5xCLosJRAKf



