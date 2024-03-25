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

    const {ERC4337EntryPointAddr, AccountGuardianAddr} = await accounts.getParam(chainId)
    await deploy('Account', {
        contract: 'Account',
        from: deployer,
        args: [ERC4337EntryPointAddr, AccountGuardianAddr],
        proxy: {
            proxyContract: 'UUPS',
            // execute: {
            //     init: {
            //         methodName: 'initialize',
            //         args: [
                        
            //         ]
            //     }
            // }
        },
        log: true,
    });
};
module.exports.tags = ['Account'];