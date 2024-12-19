
### task3： 设计一个众筹合约, 时间窗口关闭后被投资人方可提款

1. 运用 `zkapp-cli` 命令行工具初始化工程
2. 使用 `o1js` 设计一个众筹合约，在指定时间窗口间允许任何人投入 MINA，有硬顶
3. 时间窗口关闭后被投资人方可提款

请提交提供 `Jest` 本地测试的交互脚本，以及部署到 `DevNet` 的 `tx hash`。

### 作业

-   众筹合约: [CrowdFunding.ts](CrowdFunding.ts)

-   本地测试的交互脚本: [CrowdFunding.test.ts](CrowdFunding.test.ts)

-   Devnet部署脚本: ![CrowdFunding-devnet.ts](CrowdFunding-devnet.ts)

* 用了别人的脚本，课程看了3、4遍，并把自己理解注解在上面，真心学习。
* SECRET_KEY 用了 coldstar1993课程代码中的 SECRET_KEY
* 部署完毕得到 zkApp Address: B62qr2Y3At4SAkSQeh1gjhbes5JrGiSznujnE7ePQ7nwthsgtdgC6Wa
* 请求 https://minascan.io/devnet/account/B62qr2Y3At4SAkSQeh1gjhbes5JrGiSznujnE7ePQ7nwthsgtdgC6Wa/txs 
* 一直没显示交易 