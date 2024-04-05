const {ethers} = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { init, getContract, getAccount } = require("hardtron")
const accounts = require("../config/accounts");
const { AddressZero, MaxUint256 } = require("@ethersproject/constants");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const AccountImpl = (await ethers.getContract("Account")).target
    await deploy('AccountProxy', {
        salt: '0x6551655165516551655165516551655165516551655165516551655165516551',
        contract: 'AccountProxy',
        from: deployer,
        args: [AccountImpl],
        log: true,
    });
    const AccountProxy = await ethers.getContract("AccountProxy")
};
module.exports.tags = ['AccountProxy'];