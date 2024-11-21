
### task1：创建 auro wallet 账户，完成水龙头领水

1. 概述Mina所采用的证明系统(包括名称、特点)
   
Mina采用的是Kimchi证明系统，是基于Plonk协议（在zkSNARK基础上只需一次可信初始设置）的递归零知识证明系统。
特点:
- 无需Trusted Setup
- recursion递归
- general-purpose zkp
- small proof size 只有22kb

2. 概述递归零知识证明在 Mina 共识过程中的应用

递归证明是一种零知识证明技术，它允许一个证明验证另一个证明的正确性。这意味着可以不断“嵌套”证明，形成一个单一的证明，包含整个区块链的完整状态和历史。因此，验证者仅需验证最新的递归证明即可确认链的完整性和一致性。



3. 下载安装 [Auro wallet](https://www.aurowallet.com/download/)，创建账户，并完成[领水](https://faucet.minaprotocol.com/)
请提交回答，钱包账户截图和领水 `tx hash`。
![wallet](/wallet.png)

`tx hash`: `5JuMP4x5Xpv5FLPkJaBvPLHATSG4nANfx3Bh1hnDrxr1tgzYVEgg`

