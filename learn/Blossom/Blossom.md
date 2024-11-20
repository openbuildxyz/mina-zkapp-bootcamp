# Mina zkApp 训练营


#### 个人信息

- github 用户名：MackDing
- OpenBuild 注册邮箱：mack_ding@outlook.com
- Mina 钱包地址：B62qmSE237TBemka9xTejuUdcW3VjdSLf1zeB3z6Dyc1h86C4H4DT2m

- 钱包账户截图:
<img width="389" alt="image" src="https://github.com/user-attachments/assets/197b070c-ddf5-4d83-8448-8862fe7e12e4">
<img width="389" alt="image" src="https://github.com/user-attachments/assets/5fb052b9-59b2-4513-a264-6c90a98e140a">

- tx hash: 5JtkQ9uhW28uYAMNFxeKXfXziYLLNbi3UncA3EnFyJzB9vuHW9s9
- 领水 tx hash截图:
<img width="389" alt="image" src="https://github.com/user-attachments/assets/427b248e-76e1-4a6d-a874-6d5e11e36cdd">



#### 自我介绍

- Web3 learner

### Mina 所采用的证明系统

#### 名称
Mina 所采用的证明系统被称为 **zk-SNARKs**（Zero-Knowledge Succinct Non-Interactive Argument of Knowledge）。

#### 特点
- **零知识性（Zero-Knowledge）**：zk-SNARKs 允许一个证明者向验证者证明某一陈述的真实性，而无需公开具体的数据内容。
- **简洁性（Succinctness）**：证明的大小非常小，通常只需几百字节，不管原始数据有多大。
- **非交互性（Non-Interactive）**：证明和验证的过程是非交互的，仅需要一次性地提供证明文件，验证者就能验证其有效性。
- **知识论证（Argument of Knowledge）**：zk-SNARKs 确保证明者确实知道某个秘密信息，且这个信息符合某个特定的计算。
- **效率高**：zk-SNARKs 的验证过程非常高效，适用于区块链这样的高性能需求场景。

---

### 递归零知识证明在 Mina 共识过程中的应用

Mina 协议是一个非常轻量级的区块链协议，其独特之处在于它的区块链始终只保持固定的大小（几 KB），无论区块链运行多长时间。这主要得益于递归零知识证明的应用。

#### 递归零知识证明的使用
在 Mina 中，递归零知识证明用于共识过程，以确保整个区块链的状态可以通过一个非常小的证据进行验证。具体应用包括：

1. **简洁的区块链**：Mina 使用 zk-SNARKs 递归零知识证明来生成一个持续更新的压缩证明（Proof）。这个压缩证明包含了整个区块链状态的证明，却只需要很小的存储空间。
  
2. **高效的验证**：通过递归的零知识证明，每个新的区块可以对之前的证明进行验证，使得整条区块链的验证只需几 KB 的数据即可完成。这大大降低了验证节点的存储和计算负担。

3. **共识机制（Ouroboros Samasika）**：Mina 结合了 Ouroboros Samasika 共识机制与递归 zk-SNARKs，确保高效的去中心化共识，节点可以很容易地同步和验证最新的区块链状态而不需要处理整个区块链的历史数据。

通过上述方式，Mina 实现了一个固定且极小的区块链大小，解决了传统区块链随着时间增长导致链条越来越大的问题，同时保留了区块链的安全性和去中心化特性。