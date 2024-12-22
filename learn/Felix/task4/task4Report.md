### task4： 设计一个众筹合约,众筹资金逐步释放

1. 运用 `zkapp-cli` 命令行工具初始化工程
2. 使用 `o1js` 设计一个众筹合约，在指定时间窗口间允许任何人投入 MINA，有硬顶
3. 时间窗口关闭后众筹资金须按照以下 `vesting` 计划逐步释放： 提款人可以立即提走 20%，而后每 200 个区块释放 10%直至释放完毕

`DevNet` 的 `tx hash`:
`B62qj2qEofKJYDM7BzvxgHz31ULU6rUzdMrB5jZxVxwzCQJ9v4SoQx5`

`Jest` 本地测试交互脚本,测试结果:

```bash
$ jest ./src/task3/Crowdfunding.test.ts
PASS src/task3/Crowdfunding.test.ts
Crowdfunding 智能合约测试
√ 众筹成功, 按 vesting 计划释放资金
○ skipped 多位户参与众筹
○ skipped 众筹失败, 退款
○ skipped 众筹成功,调用退款失败

Test Suites: 1 passed, 1 total
Tests: 3 skipped, 1 passed, 4 total
Snapshots: 0 total

```
