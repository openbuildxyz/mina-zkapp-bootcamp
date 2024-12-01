<!--
 * @Date: 2024-11-18 16:40:15
 * @LastEditors: TinyScript
 * @LastEditTime: 2024-11-18 20:11:12
 * @FilePath: /mina-zkapp-bootcamp/learn/Timy/task1/answer.md
-->
1. 概述Mina所采用的证明系统(包括名称、特点)
- zk-SNARKs零知识证明系统 - 零知识简洁非交互式知识论证
- 特点：零知识性、简洁性、非交互性、高效性、安全性

2. 概述递归零知识证明在 Mina 共识过程中的应用
- 将整条链压缩成一个chain proof，包含内容22kb，提供给他人进行验证
- 提高验证效率，降低验证成本，可以让更多的用户参与运行，更有利于社区布道