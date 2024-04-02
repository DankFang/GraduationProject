const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts, getUnnamedAccounts } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

let deployer, user1, user2, user3, user4, user5
let EntryPoint, pocketNFT

async function initialFixture() {
    await deployments.fixture();
    deployer = await ethers.getNamedSigner("deployer")
    user1 = await ethers.getNamedSigner("user1")
    user2 = await ethers.getNamedSigner("user2")
    user3 = await ethers.getNamedSigner("user3")
    user4 = await ethers.getNamedSigner("user4")
    user5 = await ethers.getNamedSigner("user5")
    
    EntryPoint = await ethers.getContract("EntryPoint");
    pocketNFT = await ethers.getContract("pocketNFT");
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
    })
})
