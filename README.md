### Mina x OpenBuild zkApp 训练营

**Mina Protocol** 携手 **OpenBuild** 推出为零知识证明开发者设计的 Bootcamp，**助力开发者可以从零开始学习在 Mina Protocol 构建 ZK 驱动的应用（zkApp）**。无论你是否接触过 ZK 技术，只要具备前端基础知识，便能在指导下顺利掌握 zkApp 开发要领，成为区块链领域中最新创新的见证者和实践者！

本次训练营采用 **“Learn to Earn”** 模式，提供全免费的优质课程和丰富的实战任务，**由 Mina 和 OpenBuild 支持 2000美金（￥14400）的学习激励，助力更多的 Web2 开发者进入 Web3，同时从零开始一步步学习掌握 zkApp 的开发。学习结束后可以组队参与 Mina 生态黑客松，赢取 3000美金（￥21600）的黑客松奖励。**

<br>

### 报名

参加训练营需要先在 OpenBuild [报名](https://openbuild.xyz/learn/challenges/2051400317)(复制注册 OpenBuild 时用的邮箱用于后续信息填写)，然后按照以下步骤完成 github 报名：

1. `Fork` 本仓库，然后 `clone` 到你的本地。
2. 进入 `learn` 文件夹，创建以你的名字(github用户名)命名的文件夹 `YourName`。
3. 复制 [Template.md](./Template.md) 文件到刚才创建的文件夹，并将文件重命名为你的名字：`YourName.md`。
4. 打开 `learn/YourName/YourName.md` 文件，根据文档指引填写你的信息并保存。
5. 提交一个 `PR` 到本仓库，等待合并后完成 github 报名。| [如何提交PR？](https://juejin.cn/post/7021727244124962846)

<br>


### 学习准备

完成报名后联系小助手微信 `hahalzr0118` 加入交流群。课程不需要具备 ZK 知识就可以学习，只需要有一定的 `TypeScript` 基础，可以参考[学习资源](#学习资源)进行学习，有其他问题请联系小助手或在交流群沟通。

<br>


### 任务提交

本次课程以一周学习一章的进度进行，一章对应1-2个任务，任务列表看[这里](#任务)；以提交 `task1` 为例：

1. 在 `learn/YourName` 文件夹中创建 `task1` 文件夹
2. 在 `task1` 文件夹中存放任务文件。
3. 提交 `PR` 到本仓库，等待合并后完成 `task1`。

<br>


### 课程大纲

**第一章：Mina 协议基础**
1. 《开篇介绍 Mina 和开发者 Grant 计划》 |  [课程](https://openbuild.xyz/learn/challenges/2051400317/1731576740)
2. 《零知识证明入门》 |  [课程](https://openbuild.xyz/learn/challenges/2051400317/1731576760)
3. 《Mina 22kb 原理》 |  [课程](https://openbuild.xyz/learn/challenges/2051400317/1731576916)
4. 《Mina 开发者资源》 |  [课程](https://openbuild.xyz/learn/challenges/2051400317/1731577075)

**第二章：o1JS 开发框架**
1. 《o1JS 简介》
2. 《使用 zkapp-cli 初始化工程》
3. 《DSL 语法讲解》
4. 《Demo 案例讲解》

**第三章：zkApp 基础开发**
1. 《zkApp 基础概念与实操》
2. 《本地测试》
3. 《部署到 DevNet》
4. 《解析交易细节》

**第四章：zkApp 高阶应用**
1. 《Event 合约日志分析》
2. 《Actions & Reducer 机制》
3. 《Time-Locked Accounts 机制》
4. 《自定义代币机制》
5. 《Fungible Token Standard源码讲解》


**第五章：Protokit 框架探索**
1. 《Protokit 基础概念讲解》
2. 《Protokit 实操案例》

<br>

### 任务

任务奖励以 RMB 等值的 `$MINA` 发放到你提交的 Mina 钱包地址中。

| 任务 | 阶段 | 名称 | 奖励 |
|-------|-------|-------|-------|
| [task1](./task/task1.md) | 第一周 | 创建Auro wallet账户，完成水龙头领水 | ￥15 |
| [task2](./task/task2.md) | 第二周 | 设计一个简单的投票统计器 | ￥35 |
| [task3](./task/task3.md) | 第三周 | 设计一个众筹合约，时间窗口关闭后被投资人方可提款 | ￥15 |
| [task4](./task/task4.md) | 第四周 | 设计一个众筹合约，众筹资金逐步释放 | ￥15 |
| [task5](./task/task5.md) | 第四周 | 发行你自己的 token，然后设计一个众筹合约 | ￥35 |
| [task6](./task/task6.md) | 第五周 | 运行一个 appchain | ￥21 |

<br>

### 学习资源

#### TypeScript 学习资料

1. [TypeScript入门到进阶](https://github.com/mqyqingfeng/learn-typescript)
2. [TypeScript零基础入门到精通](https://www.bilibili.com/video/BV1PuDfY6EB7)

#### Mina 学习资料

1. [mina 技术文档](https://docs.minaprotocol.com/)
2. [zkRollup框架-Protokit](https://protokit.dev/docs/what-is-protokit)

#### ZK 学习资料

1. [零知识证明入门教程](https://github.com/WTFAcademy/WTF-zk)
2. [零知识证明系列课程](https://zkshanghai.xyz/syllabus.html)
3. [探索零知识证明](https://github.com/sec-bit/learning-zkp/tree/master)
