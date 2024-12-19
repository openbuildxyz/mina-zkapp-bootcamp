
### task5：发行你自己的token，然后设计一个众筹合约

1. 发行你自己的 `token`
2. 设计一个众筹合约，在指定时间窗口间允许任何人以固定的价格购买，有硬顶

请提交 `token` 地址，`Jest` 本地测试交互脚本，以及部署到 `DevNet` 的 `tx hash`。

```shell
npm install --save-dev jest

npx jest src/CrowdFunding.test.ts

npx jest src/Token.test.ts
```

Crowdfunding tx hash: [5JuYJnaNJVd3pm5QECV7YDbEqYUHuferjU4SNs5hKrvXJzhvo3ny](https://minascan.io/devnet/tx/5JuYJnaNJVd3pm5QECV7YDbEqYUHuferjU4SNs5hKrvXJzhvo3ny?type=zk-tx)


Token tx hash: [5JtYHYrQMdU91Fgv6SUncfpLbdKVPbptxhAAQdxwHgKwxjLXd2iG](https://minascan.io/devnet/tx/5JtYHYrQMdU91Fgv6SUncfpLbdKVPbptxhAAQdxwHgKwxjLXd2iG?type=zk-tx)
