
require('hardhat/types');

require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers");
require("dotenv").config();

const includeContracts = [
  "Account",
  "AccountGuardian",
]

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: require("./config/solidity"),
    networks: require("./config/network"),
    paths: require("./config/paths"),

    namedAccounts: {
      deployer: 0,
      user1: 1,
      user2: 2,
      user3: 3,
      user4: 4,
      user5: 5,
  },

    storageLayoutChanges: {
      contracts: includeContracts,
      fullPath: false
  },
};
