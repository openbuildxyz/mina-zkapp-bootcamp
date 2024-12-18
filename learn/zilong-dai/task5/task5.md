
### task5：发行你自己的token，然后设计一个众筹合约

1. 发行你自己的 `token`
2. 设计一个众筹合约，在指定时间窗口间允许任何人以固定的价格购买，有硬顶

请提交 `token` 地址，`Jest` 本地测试交互脚本，以及部署到 `DevNet` 的 `tx hash`。

```shell
npm install --save-dev jest

npx jest src/Crowdfunding.test.ts

npx jest src/Token.test.ts
```

token tx hash: [5JthFigagat4vxR6XSeqrkRhwo2ZvkRNmzG3rYc1Z718MMbbXGh6](https://minascan.io/devnet/tx/5JthFigagat4vxR6XSeqrkRhwo2ZvkRNmzG3rYc1Z718MMbbXGh6?type=zk-tx)

crowdfunding tx hash: [5JtrbGNrDK56BeEUKCrDgbrjiy6beLy2QRyibfnbrHBQr4cZmYTY](https://minascan.io/devnet/tx/5JtrbGNrDK56BeEUKCrDgbrjiy6beLy2QRyibfnbrHBQr4cZmYTY?type=zk-tx)

