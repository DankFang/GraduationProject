const { init, getContract, getAccount } = require("hardtron")
const {ethers} = require("hardhat");

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    await deploy('AccountGuardian', {
        contract: 'AccountGuardian',
        from: deployer,
        args: [],
        // proxy: {
        //     proxyContract: 'UUPS',
        //     execute: {
        //         init: {
        //             methodName: 'initialize',
        //             args: [
                        
        //             ]
        //         }
        //     }
        // },
        log: true,
    });
};
module.exports.tags = ['AccountGuardian'];