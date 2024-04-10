const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, getUnnamedAccounts, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

let deployer, user1, user2, user3, user4, user5
let EntryPoint, pocketNFT, assetsNFT, ERC6551Registry, Account, AccountProxy
let chainId

async function initialFixture() {
    await deployments.fixture();
    deployer = await ethers.getNamedSigner("deployer")
    user1 = await ethers.getNamedSigner("user1")
    user2 = await ethers.getNamedSigner("user2")
    user3 = await ethers.getNamedSigner("user3")
    user4 = await ethers.getNamedSigner("user4")
    user5 = await ethers.getNamedSigner("user5")

    chainId = await getChainId()
    
    EntryPoint = await ethers.getContract("EntryPoint");
    pocketNFT = await ethers.getContract("pocketNFT");
    ERC6551Registry = await ethers.getContract("ERC6551Registry")
    Account = await ethers.getContract("Account")
    AccountProxy = await ethers.getContract('AccountProxy');
    assetsNFT = await ethers.getContract('assetsNFT');
}
describe("ERC-6551Account Test", function() {
    before(async function () {
        await helpers.loadFixture(initialFixture)
    });
    it("PrepareAccount before createAccount", async function() {
        // 先mint NFT 用于测试  5个
        for (let i = 0; i < 5; i++) {
            await pocketNFT.mint();
        }
        expect(await pocketNFT.tokenID()).to.be.equal(5)

        const prepareAccount = await ERC6551Registry.account(
            AccountProxy.target,  // Account的proxy
            chainId,
            pocketNFT.target,  // 需要绑定的NFT的地址
            1,
            0,  //salt
        )
        // 现在create Account, 先模拟
        const createdAccount = await ERC6551Registry.createAccount.staticCall(
            AccountProxy.target,  // Account的proxy
            chainId,
            pocketNFT.target,  // 需要绑定的NFT的地址
            1,
            0,
            "0x8129fc1c",
        )
        expect(createdAccount).to.be.equal(prepareAccount)
        // 现在正式生成地址
        const createAccountdata = await ERC6551Registry.createAccount.populateTransaction(
            AccountProxy.target,  // Account的proxy
            chainId,
            pocketNFT.target,  // 需要绑定的NFT的地址
            1,
            0,
            "0x8129fc1c",
        )
        let createAccountTX = {
            to: ERC6551Registry.target, // registry
            data: createAccountdata.data
        }
        let sendTX = await deployer.sendTransaction(createAccountTX)
        await expect(sendTX).to.be.emit(ERC6551Registry,"AccountCreated")
    })
    it("功能测试", async function() {
        // 查看生成的账户是什么
        const createdAccount = await ERC6551Registry.account(
            AccountProxy.target,  
            chainId,
            pocketNFT.target,
            1,
            0,  //salt
        )
        const AccountContract = await ethers.getContractAt('Account', createdAccount);
        // mint资产
        for (let i = 0; i < 10; i++) {
            await assetsNFT.mint();
        }
        // 将资产转入ERC6551抽象账户
        for (let i = 1; i <= 10; i++) {
            // tokenid 从1开始
            await assetsNFT.safeTransferFrom(deployer.address, createdAccount, i);
        }
        expect(await assetsNFT.balanceOf(createdAccount)).to.be.equal(10)
        // 现在将资产转出到EOA账户
        const transferAssetsNFT = await assetsNFT.transferFrom.populateTransaction(createdAccount, deployer.address, 1)
        const executeTX = await AccountContract.executeCall.populateTransaction(
            assetsNFT.target,
            0,
            transferAssetsNFT.data,
        )
        let sendTX = {
            to: createdAccount,
            data: executeTX.data, 
        };
        await deployer.sendTransaction(sendTX)
        expect(await assetsNFT.ownerOf(1)).to.be.equal(deployer.address)

        // 批量操erc6551账户
        for (let i = 2; i <= 10; i++) {
            const transferAssetsNFT = await assetsNFT.transferFrom.populateTransaction(createdAccount, deployer.address, i)
            const executeTX = await AccountContract.executeCall.populateTransaction(
                assetsNFT.target,
                0,
                transferAssetsNFT.data,
            )
            let sendTX = {
                to: createdAccount,
                data: executeTX.data, 
            };
            await deployer.sendTransaction(sendTX)
            expect(await assetsNFT.ownerOf(i)).to.be.equal(deployer.address)
        }
    })
})
