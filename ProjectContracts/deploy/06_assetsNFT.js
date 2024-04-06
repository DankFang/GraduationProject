const {ethers} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { init, getContract, getAccount } = require("hardtron")
const accounts = require("../config/accounts");
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    await deploy('assetsNFT', {
        contract: 'assetsNFT',
        from: deployer,
        args: [],
        log: true,
    });
};
module.exports.tags = ['assetsNFT'];