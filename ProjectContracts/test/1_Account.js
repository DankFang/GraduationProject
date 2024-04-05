const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, getUnnamedAccounts, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

let deployer, user1, user2, user3, user4, user5
let EntryPoint, pocketNFT, ERC6551Registry, Account
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
    
    // return {
    //     deployer,
    //     user1,
    //     user2,
    //     user3,
    //     user4,
    //     user5,
    //     EntryPoint
    // }
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
        // 这里要传到impl是 6551Account 的proxy
        console.log("Account.target",Account.target);
        const prepareAccount = await ERC6551Registry.account(
            Account.target,
            chainId,
            pocketNFT.target,
            1,
            6551
        )
        // 现在create Account, 先模拟
        const createdAccount = await ERC6551Registry.createAccount.staticCall(
            Account.target,
            chainId,
            pocketNFT.target,
            1,
            6551,
            "0x6faff5f1"
        )
        expect(createdAccount).to.be.equal(prepareAccount)
        // 现在正式生成地址
        await expect(
            await ERC6551Registry.createAccount(
                    Account.target,
                    chainId,
                    pocketNFT.target,
                    1,
                    6551,
                    "0x6faff5f1"
            )
        ).to.be.emit(ERC6551Registry,"AccountCreated")
    })
    it("功能测试", async function() {
        // expect(await pocketNFT.tokenID()).to.be.equal(5)
        /**
         *  const transferUSDT = await USDT.transfer.populateTransaction(user4.address, ethers.parseEther('10'))
            const tx = await MultiSigWalletR.connect(user1).submitTransaction(
                transferUSDT.to,
                0,
                transferUSDT.data
            )
         */
        // 将自己的nft存进 6551的生成账户
        const getAccount = await ERC6551Registry.account(
            Account.target,
            chainId,
            pocketNFT.target,
            1,
            6551
        )
        const Accountcontract = await ethers.getContractAt('Account', getAccount);
        // console.log(Accountcontract);
        await pocketNFT.transferFrom(deployer.address, getAccount, 2);
        expect(await pocketNFT.ownerOf(2)).to.be.equal(getAccount);
        console.log("7777777");
        // console.log("ERC6551Registry",ERC6551Registry);
        // console.log("pocketNFT", pocketNFT);
        const transferNFT = await pocketNFT.safeTransferFrom.populateTransaction(getAccount, deployer.address, 2)
        await deployer.sendTransaction({
            to: getAccount,
            value: parseEther("5"),
        });
        console.log("余额", await ethers.provider.getBalance(getAccount));
        const executeTX = await Accountcontract.executeCall.populateTransaction(
            pocketNFT.target,
            0,
            transferNFT.data
        )
        await deployer.sendTransaction({
            to: getAccount,
            data : executeTX.data
        })
        console.log("executeTX.data",executeTX.data);
        console.log("transferNFT.data",transferNFT.data);
        expect(await pocketNFT.ownerOf(2)).to.be.equal(deployer.address);
    })
})
