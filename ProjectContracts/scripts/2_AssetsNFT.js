const { ethers, getChainId } = require("hardhat");
let deployer
(async () => {
    deployer = await ethers.getNamedSigner("deployer")
    // await mint();
    await transfer();
    process.exit(0);
})()

async function mint() {
    const assetsNFT = await ethers.getContract('assetsNFT');
    for (let i = 0; i < 3; i++) {
        await assetsNFT.mint();
    }
}

async function transfer() {
    const assetsNFT = await ethers.getContract('assetsNFT');
    await assetsNFT.safeTransferFrom(deployer.address, '0x957CC269892174c8C6eecAc844a39CD6b9C929f0', 1);
}