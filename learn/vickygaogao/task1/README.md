  # 概述Mina所采用的证明系统(包括名称、特点)
    kimch

    Mina 采用 kimch， 一种基于 zk-SNARK (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) | 零知识简洁非交互式知识论证 的实现。

    在不透露隐私的情况下，采用非交互的方式高效的证明某个证明者的确拥有某个知识、或者证明证明者确实符合某个门槛某个条件。

    它的特点：递归证明、零知识特性、高效验证、安全性  
   

  # 概述 递归零知识证明在 Mina 共识过程中的应用
   
    通过递归证明，可以将区块链状态压缩为固定大小(~11kb)的证明。新区块可以验证之前区块的证明,形成递归证明链。

    保护交易隐私。
    验证成本低，适合轻客户端运行。
   
    步骤如下：
      a. 将问题转换成描述。
      b. 编译生成 ProverKey 和 VerificationKey。
      c. 证明者使用 Provy 函数（结合 ProverKey）生成证明 (proof)。
      d. 验证者使用 Verify 函数（结合 VerificationKey）验证 proof 的真假。

  
