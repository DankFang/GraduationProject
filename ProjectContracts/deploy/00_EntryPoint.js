const {ethers} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { init, getContract, getAccount } = require("hardtron")
const accounts = require("../config/accounts");
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = await getChainId();
    // init(accounts);

    if (await chainId != 31337) return;

    await deploy('EntryPoint', {
        contract: 'EntryPoint',
        from: deployer,
        args: [],
        log: true,
    });
    const EntryPoint = await ethers.getContract("EntryPoint");
};
module.exports.tags = ['EntryPoint'];