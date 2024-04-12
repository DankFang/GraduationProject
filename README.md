# GraduationProject([网页客户端](http://122.51.183.228:1012/))
- ## Notice: 若用于商业用途，请向 0x41cFEc26C3bC5aE0bE206DA0aD591d4bf277BdEF 地址打赏ETH、BNB等EVM兼容链的原生代币或U
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

---

### Sepolia 合约地址：
#### AccountGuardian
- 0xA6107712a01721116B05c68358DEc0291992bD40
#### Account
- Proxy: 0x44B3fdC704632424D92c1b64ff621be514513dE8
- Implementation: 0x15b78a15a0e80fd02f6510C6C8bd8d7448923bAF
#### pocketNFT
- 0xF2085520559dE812ca76e64a6805F776F2976D32
#### ERC6551Registry
- 0x68b7649d9d24B40F04e71495b8c594C5B58735e5
#### assetsNFT
- 0x51d054C73E767B72C5bAbc79eACc85cFd3cc6f8a
---
### Mumbai 合约地址：
#### AccountGuardian
- 0xAA2777fa3cC68767297762753C9ddF091229eed2
#### Account
- Proxy: 0xA477e898B403f00cB41f760D83282fb20545Edc5
- Implementation: 0xFC1441A6F06026b499E2990f7Cd44e87be4B50d7
#### pocketNFT
- 0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3
#### ERC6551Registry
- 0xf713E1bFc2a7235765C5afc668720d58024404b1
#### assetsNFT
- 0x25C0D1Cb7851aa1D7DcB550e835949bcfdc69CF5

