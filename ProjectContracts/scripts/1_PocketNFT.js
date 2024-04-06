const { ethers, getChainId } = require("hardhat");
(async () => {
    // await mint();
    // await transfer();
    process.exit(0);
})()

async function mint() {
    const pocketNFT = await ethers.getContract('pocketNFT');
    for (let i = 0; i < 3; i++) {
        await pocketNFT.mint();
    }
}

async function transfer() {
    const pocketNFT = await ethers.getContract('pocketNFT');
    await pocketNFT.safeTransferFrom('', '', );
}