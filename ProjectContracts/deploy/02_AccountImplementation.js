const {ethers} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { init, getContract, getAccount } = require("hardtron")
const accounts = require("../config/accounts");
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");
// ethers6语法
// const {ZeroAddress, MaxUint256} = ethers
module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = await getChainId();
    init(accounts);

    let EntryPointAddr
    if (chainId == 31337) {
        EntryPointAddr = (await ethers.getContract("EntryPoint")).target
    } else {
        let {ERC4337EntryPointAddr} = await accounts.getParam(chainId)
        EntryPointAddr = ERC4337EntryPointAddr
    }
    let AccountGuardianAddr = (await getContract(chainId, "AccountGuardian")).target
    // console.log("EntryPointAddr",EntryPointAddr);
    // console.log("AccountGuardianAddr",AccountGuardianAddr);
    await deploy('Account', {
        salt: '0x6551655165516551655165516551655165516551655165516551655165516551',
        contract: 'Account',
        from: deployer,
        args: [AccountGuardianAddr, EntryPointAddr],
        log: true,
    });
    const Account = await ethers.getContract("Account")
};
module.exports.tags = ['Account'];