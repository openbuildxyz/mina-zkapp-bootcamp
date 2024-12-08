
## 1.zkApps
* zkApps（零知识应用程序）是由零知识证明支持，具体使用 zk-SNARKs 的 Mina 协议智能合约。
* zkApps 使用链下执行和大部分链下状态模型。此架构允许私有计算和状态，可以是私有的，也可以是公开的。
* zkApps 可以在链下执行任意复杂的计算，同时仅需支付固定费用即可将生成的零知识证明发送到链上以验证此计算。这种节省成本的优势与其他在链上运行计算并使用可变 gas 费用模型的区块链形成了鲜明对比。
* zkApps 是用TypeScript编写的。
* 一个 zkApp 由两部分组成：
 * 智能合约
 * 供用户与 zkApp 交互的用户界面（UI）

## 2.zkApp 本地测试
* 开发 -> 单元测试 -> Lightnet测试 -> Devnet公开测试 -> 审计修复 -> 部署到Mainnet
```
npm install -g zkapp-cli

zk project <project-name>
zk example

npm run test  // Local-blockchain env

zk lightnet start  // Lightnet env (docker)

zk config
zk deploy  // Devnet or Mainnet
```

* LocalBlockchain
  * 通过配置‘proofsEnabled’:true/false 来指定是否启动证明模式。开发阶段为了提高测试效率可以先关闭证明模式。
  * 内置了10个账户，且每个都已设置3000MINA余额
  * 通过Mina.transaction(...)来发起一笔合约交易
  

## 3.zkApp - DevNet测试 
* 预配置DevNet网络中可用的全节点和归档节点的GraphQL接口： 

## 5.学习资源
1. [zkapp 文档](https://docs.minaprotocol.com/zkapps/writing-a-zkapp)
