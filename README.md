# GraduationProject
## 这是一个NFT管理平台，帮助链游玩家以及NFT数字藏品收藏者更好地管理他的NFT
### 项目介绍
- 背景：随着区块链技术的不断发展，智能合约作为一种自动执行合同条款的计算机程序，正在逐渐应用于多个领域。同时，非同质化代币（NFTs）作为区块链上独一无二的数字资产，已经在艺术、游戏、房地产等领域展现出强大的价值。然而，目前NFT市场上存在着管理、交易不便、信息不透明等问题，需要一个更为高效、安全、透明的管理平台来解决。
- 内容：基于智能合约设计，构建一个完整的非同质化代币管理平台，包括NFT的发行、交易、转让等功能。本课题内容涉及智能合约的设计、NFT管理平台的实现，包含技术和应用两个方面，对于本科生来说，需要具备一定的区块链技术基础和系统设计能力。
- 意义：通过高效的智能合约执行，提高NFT市场的透明度和安全性，为NFT的稳健发展创造有利条件，将理论研究与实际应用相结合，促进学术研究成果更好地为社会创造价值。
### 项目结构
#### 合约端
- 用ERC-1167最小代理标准去生成抽象账户的代理以节省gas
- 通过ERC-1167在传入的opcode操作码加上NFT的合约地址、tokenID实现绑定功能
- 实现抽象账户转移和接受以太币或其他资产的功能，即实现ERC-6551的权限判断以及call低级调用的操作码
#### 前端
- 用ether.js实现与合约的交互
- 用JavaScript框架vue实现前端界面展示
### 项目实现逻辑
- 运用ERC-6551协议生成抽象账户并绑定到NFT
- 用一个NFT绑定的ERC-6551账户，此NFT即为一类NFT的口袋
- 将同一种类的NFT放入对应的口袋里
- 拥有口袋NFT的所有权即拥有这个口袋里的所有NFT(ERC-6551)
- 最终实现NFT的分类管理

### Sepolia 合约地址：
#### AccountGuardian
- 0xea977df171822B416842C78C81302c15C74c301d
#### Account
- Proxy: 0x61a943365cA82b2D57c6bDeb1c0232FDEf0F19AA
- Implementation: 0xb21af3Cef2466d194e770d89A0aeB4cf8672e5F1
#### pocketNFT
- 0xCD37cDfFddBaa184d293Ab94c86fd6040B37c73A

### Mumbai 合约地址：
#### AccountGuardian
- 0xc91740111B0b182AB67cce09D88aC3C67a5f5939
#### Account
- Proxy: 0x6Dc0861D135Cb12a28Ba3F151804205de8d431F1
- Implementation: 0x5ad03CA4db62f13070369638Ce5fA2AE6876F824
#### pocketNFT
- 0xA59FE4A9c512ef100A5Caae4fCEE1F04aed9370c

