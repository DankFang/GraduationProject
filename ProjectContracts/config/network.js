
module.exports = {
    hardhat: {
      // deploy: ['compound-deploy/'],
      mining: {
        auto: true,
        // interval: 2000
      }
    },
    Sepolia: {
      url: process.env.ALCHEMY_API_KEY_Sepolia,
      accounts: [process.env.PRIVATE_KEY]
    },
}