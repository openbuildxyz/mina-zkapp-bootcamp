# Mina x OpenBuild zkApp 训练营

| 任务 | 阶段 | 名称 | 奖励 |
|-------|-------|-------|-------|
| [task1](./task/task1.md) | 第一周 | 创建Auro wallet账户，完成水龙头领水 | ￥15 |
| [task2](./task/task2.md) | 第二周 | 设计一个简单的投票统计器 | ￥35 |
| [task3](./task/task3.md) | 第三周 | 设计一个众筹合约，时间窗口关闭后被投资人方可提款 | ￥15 |
| [task4](./task/task4.md) | 第四周 | 设计一个众筹合约，众筹资金逐步释放 | ￥15 |
| [task5](./task/task5.md) | 第四周 | 发行你自己的 token，然后设计一个众筹合约 | ￥35 |
| [task6](./task/task6.md) | 第五周 | 运行一个 appchain | ￥21 |


## 1. task1
1. 概述Mina所采用的证明系统(包括名称、特点)
zkSNARK家族的PLONK的一个变种,特点是在简化trusted setup基础上干脆去掉了trusted setup进一步大大简化zkp; 是个recursive的zkp, 通用zkp, 证明的体积小(small proof size).
2. 概述递归零知识证明在 Mina 共识过程中的应用
区块链领域用于zkRollup方式的扩容, 工作量集中在证明阶段,而验证过程很快,从而实现主链上计算的压缩.
3. 下载安装 Auro wallet，创建账户，并完成领水
- tx hash: 5JufW5x2fbBBwxNanxtGaExtAXsby8fQoLARJzGEx7ajw7U7uTpT
![alt "2024/11/23 23:05"](auro_wallet_with_faucet_coin.png)  

<br>
