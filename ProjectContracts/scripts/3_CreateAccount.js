const { ethers, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
(async () => {
    const ERC6551Registry = await ethers.getContract('ERC6551Registry');
    const Account = await ethers.getContract('Account');
    const AccountProxy = await ethers.getContract('AccountProxy');
    const pocketNFT = await ethers.getContract('pocketNFT');
    const chainId = await getChainId()
    const deployer = await ethers.getNamedSigner("deployer")


    const createAccountdata = await ERC6551Registry.createAccount.populateTransaction(
        AccountProxy.target,  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        2,
        0,
        "0x8129fc1c",
    )
    let createAccountTX = {
        to: ERC6551Registry.target, // registry
        data: createAccountdata.data
    }
    await deployer.sendTransaction(createAccountTX)

    // 方法1️⃣： 查看生成的账户是什么
    const createdAccount1 = await ERC6551Registry.createAccount.staticCall(
        AccountProxy.target,  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        2,
        0,
        "0x8129fc1c",
    )
    console.log('createdAccount1', createdAccount1);

    // 方法1️2️⃣： 查看生成的账户是什么
    const createdAccount2 = await ERC6551Registry.account(
        AccountProxy.target,  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        2,
        0,  //salt
    )
    console.log("createdAccount2", createdAccount2);
    process.exit(0);
})()