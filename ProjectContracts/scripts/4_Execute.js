const { ethers, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
(async () => {
    const ERC6551Registry = await ethers.getContract('ERC6551Registry');
    const Account = await ethers.getContract('Account');
    const AccountProxy = await ethers.getContract('AccountProxy');
    const pocketNFT = await ethers.getContract('pocketNFT');
    const assetsNFT = await ethers.getContract('assetsNFT');
    const chainId = await getChainId()
    const deployer = await ethers.getNamedSigner("deployer")

    // 查看生成的账户是什么
    const createdAccount = await ERC6551Registry.account(
        AccountProxy.target,  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        2,
        0,  //salt
    )
    const AccountContract = await ethers.getContractAt('Account', createdAccount);
    
    // 从抽象账户转出资产
    const transferAssetsNFT = await assetsNFT.transferFrom.populateTransaction(createdAccount, deployer.address, 1)
    const executeTX = await AccountContract.executeCall.populateTransaction(
        assetsNFT.target,
        0,
        transferAssetsNFT.data,
        // { gasLimit: 1000000 , gasPrice: 3000000000}
    )
    let tx = {
        to: createdAccount,
        data: executeTX.data, 
        // gasLimit: 1000000 , gasPrice: 3000000000
    };
    await deployer.sendTransaction(tx)
    process.exit(0);
})()