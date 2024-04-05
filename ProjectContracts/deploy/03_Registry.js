const {ethers} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { init, getContract, getAccount } = require("hardtron")
const accounts = require("../config/accounts");
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    await deploy('ERC6551Registry', {
        contract: 'ERC6551Registry',
        from: deployer,
        args: [],
        log: true,
    });
    const ERC6551Registry = await ethers.getContract("ERC6551Registry")
};
module.exports.tags = ['ERC6551Registry'];