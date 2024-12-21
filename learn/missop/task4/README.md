# 众筹合约

合约主文件：FundMe.ts

功能：众筹合约，在指定时间窗口间允许任何人投入 MINA，有硬顶，时间窗口关闭后被投资人方可提款，时间窗口关闭后众筹资金须按照以下 vesting 计划逐步释放： 提款人可以立即提走20%，而后每200个区块释放10%直至释放完毕

部署到测试网 tx：5JufgKdnwtKNmCTJLN1rfvvh51L7NdstFsDCCDW92YQ4fCFD3Poe

单元测试脚本：unit/FundMe.test.ts