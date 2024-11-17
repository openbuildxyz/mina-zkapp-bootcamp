### Mina 所采用的证明系统(包括名称、特点)

Kimchi
特点:

1. 删去了 Trusted Setups, 简化了步骤和开发流程
2. 支持递归零知识证明

### recursive zkp 递归零知识证明

验证了,第 N 项合法,N 之前的都合法.

circuit() => p0
circuit(p0) => p1
circuit(p1) => p2

p2 合法,说明 p1 合法,p1 合法,说明 p0 合法.

生成一个新的证明,会把上一次的证明作为参数传递进去,极大的减少了计算量.
我不需要提供全部的证明,只需要提供最后一次的证明,验证同理,不需要验证全部的,只需验证最后一次.

### mina 应用

使用 recursive zkp, 只需要一个 22kb 大小的证明,就可以验证整个区块链的状态.相比之前的区块链, 链上的数据会随着时间的推移越来越大, mina 会始终维持在 22kb.

mina 打包

1. 选择一个 block producer
2. 创建一个新的 block
   - 验证每一个交易 --> 生成 txBatchProof 交易证明
   - 根据已经验证交易的 set,和前一个区块的 hash 创建一个新的块 --> 生成区块证明 blockProof_i(包括验证 txBatchProof)
   - 利用 blockProof_i 和 ChainProof_i-1 生成 ChainProof_i (ChainProof_i 会证明,i 和 i 之前的块是合法的)
3. 打包新的块
4. 其他人来验证
