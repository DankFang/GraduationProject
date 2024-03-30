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

    let {ERC4337EntryPointAddr} = await accounts.getParam(chainId)
    if (chainId == 31337) {
        ERC4337EntryPointAddr = (await getContract(chainId, "EntryPoint")).target
    }
    let AccountGuardianAddr = (await getContract(chainId, "AccountGuardian")).target
    console.log("AccountGuardianAddr",AccountGuardianAddr);

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