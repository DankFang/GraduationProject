// const ALCHEMY_API_KEY_Sepolia = "DOTlZeIL5aDxL-UFsz29v1MvatC-OY2e"
const PRIVATE_KEY = "0b6243f3d9d8b69ede6c341ae30b27414a0a76b921471cce3b6b8a4fb6ebc805";
module.exports = {
    hardhat: {
      // deploy: ['compound-deploy/'],
      mining: {
        auto: true,
        // interval: 2000
      }
    },
    Sepolia: {
      // url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY_Sepolia}`,
      url: process.env.ALCHEMY_API_KEY_Sepolia,
      accounts: [process.env.PRIVATE_KEY]
    },
}