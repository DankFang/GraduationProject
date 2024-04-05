// const { ethers, getChainId } = require("hardhat");
const { ethers, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
(async () => {
    const ERC6551Registry = await ethers.getContract('ERC6551Registry');
    const Account = await ethers.getContract('Account');
    const pocketNFT = await ethers.getContract('pocketNFT');
    const chainId = await getChainId()
    const deployer = await ethers.getNamedSigner("deployer")
    // for (let i = 0; i < 10; i++) {
        
    //     await pocketNFT.mint();
    // }
    
    // const createAccountdata = await ERC6551Registry.createAccount.populateTransaction(
    //     '0x2D25602551487C3f3354dD80D76D54383A243358',  // Account的proxy
    //     chainId,
    //     pocketNFT.target,  // 需要绑定的NFT的地址
    //     15,
    //     0,
    //     "0x8129fc1c",
    //     // { gasLimit: 1000000 , gasPrice: 3000000000}
    // )
    // let createAccountTX = {
    //     to: '0x02101dfb77fde026414827fdc604ddaf224f0921',
    //     data: createAccountdata.data
    // }
    // await deployer.sendTransaction(createAccountTX)
    // console.log("res",res);
    // 即proxy 
    // console.log("account",Account.target);
    // const prepareAccount = await ERC6551Registry.account(
    //     '0x5ad03CA4db62f13070369638Ce5fA2AE6876F824',
    //     chainId,
    //     pocketNFT.target,
    //     11,
    //     6551
    // )
    // // 0xa7c27dc71bc0447aaa4a58edca1d061c1ef2a2de
    // console.log("prepareAccount", prepareAccount);
    const Accountcontract = await ethers.getContractAt('Account', '0xa7c27dc71bc0447aaa4a58edca1d061c1ef2a2de');
;
    // await deployer.sendTransaction({
    //     to: '0xccEA0E52dc7291c0fbBd80d8eCCDb88168dc9987',
    //     value: parseEther("0.1"),
    //     gasLimit: 1000000 , gasPrice: 3000000000
    // });
    // await pocketNFT.safeTransferFrom('0x4ebf8d74b7f022fA729776c94a34FA2617b20E8A', '0xa7c27dc71bc0447aaa4a58edca1d061c1ef2a2de', 16);

    const transferNFT = await pocketNFT.transferFrom.populateTransaction('0xa7c27dc71bc0447aaa4a58edca1d061c1ef2a2de', '0x4ebf8d74b7f022fA729776c94a34FA2617b20E8A', 16)
    
    const executeTX = await Accountcontract.executeCall.populateTransaction(
        pocketNFT.target,
        0,
        transferNFT.data,
        // { gasLimit: 1000000 , gasPrice: 3000000000}
    )

    let tx = {
        to: '0xa7c27dc71bc0447aaa4a58edca1d061c1ef2a2de',
        data: executeTX.data, 
        // gasLimit: 1000000 , gasPrice: 3000000000
    };
    console.log("executeTX.data", executeTX.data);
    await deployer.sendTransaction(tx)

    // const owner = await pocketNFT.ownerOf(1)
    // console.log("owner",owner);

    process.exit(0);
})()