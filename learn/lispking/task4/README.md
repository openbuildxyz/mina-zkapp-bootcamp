
### task4： 设计一个众筹合约,众筹资金逐步释放

1. 运用 `zkapp-cli` 命令行工具初始化工程
2. 使用 `o1js` 设计一个众筹合约，在指定时间窗口间允许任何人投入MINA，有硬顶
3. 时间窗口关闭后众筹资金须按照以下 `vesting` 计划逐步释放： 提款人可以立即提走20%，而后每200个区块释放10%直至释放完毕

请提交 `Jest` 本地测试交互脚本，以及部署到 `DevNet` 的 `tx hash`。

tx hash: https://minascan.io/devnet/tx/5JuxtufvpaTthFWKMUWZTYUHw21boSNgkpaVPmByoy71kFoDQyja?type=zk-tx