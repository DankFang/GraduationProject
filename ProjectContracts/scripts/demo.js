// const { ethers, getChainId } = require("hardhat");
const { ethers, getChainId } = require("hardhat");
const { parseEther, formatEther, hexValue } = ethers;
(async () => {
    const ERC6551Registry = await ethers.getContract('ERC6551Registry');
    const Account = await ethers.getContract('Account');
    const pocketNFT = await ethers.getContract('pocketNFT');
    const chainId = await getChainId()
    const deployer = await ethers.getNamedSigner("deployer")
    // for (let i = 0; i < 5; i++) {
    //     await pocketNFT.mint();
    // }
    
    // const createAccountdata = await ERC6551Registry.createAccount.populateTransaction(
    //     
    //     '0xA477e898B403f00cB41f760D83282fb20545Edc5',  // Account的proxy
    //     chainId,
    //     pocketNFT.target,  // 需要绑定的NFT的地址
    //     1,
    //     0,
    //     "0x8129fc1c",
    //     // { gasLimit: 1000000 , gasPrice: 3000000000}
    // )
    // let createAccountTX = {
    //     to: '0xf713E1bFc2a7235765C5afc668720d58024404b1', // registry
    //     data: createAccountdata.data
    // }
    // await deployer.sendTransaction(createAccountTX)

    // 即proxy 
    // console.log("account",Account.target);
    const res = await ERC6551Registry.createAccount.staticCall(
        '0xA477e898B403f00cB41f760D83282fb20545Edc5',  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        1,
        0,
        "0x8129fc1c",
    )
    console.log(res);
    const prepareAccount = await ERC6551Registry.account(
        '0xA477e898B403f00cB41f760D83282fb20545Edc5',  // Account的proxy
        chainId,
        pocketNFT.target,  // 需要绑定的NFT的地址
        1,
        0,  //salt
    )
    // 
    console.log("prepareAccount", prepareAccount);
    // const Accountcontract = await ethers.getContractAt('Account', '0xebdad32971924f9648e05e6d6b18f121d5adf0fe');

//     // await deployer.sendTransaction({
//     //     to: '0xccEA0E52dc7291c0fbBd80d8eCCDb88168dc9987',
//     //     value: parseEther("0.1"),
//     //     gasLimit: 1000000 , gasPrice: 3000000000
//     // });
// 转到 6551地址
    // await pocketNFT.safeTransferFrom('0x4ebf8d74b7f022fA729776c94a34FA2617b20E8A', '0xebdad32971924f9648e05e6d6b18f121d5adf0fe', 2);

    // const transferNFT = await pocketNFT.transferFrom.populateTransaction('0xebdad32971924f9648e05e6d6b18f121d5adf0fe', '0x4ebf8d74b7f022fA729776c94a34FA2617b20E8A', 2)
    // //                                                                       0x257c487103b236b8cbe8c21cb29da442636e7dea
    //                                                                     //   0x9b3cb69bc49cf466e0fde8af861e322a7863a3da
                                                                           //   0xebdad32971924f9648e05e6d6b18f121d5adf0fe
    // const executeTX = await Accountcontract.executeCall.populateTransaction(
    //     pocketNFT.target,
    //     0,
    //     transferNFT.data,
    //     // { gasLimit: 1000000 , gasPrice: 3000000000}
    // )

    // let tx = {
    //     to: '0xebdad32971924f9648e05e6d6b18f121d5adf0fe',
    //     data: executeTX.data, 
    //     gasLimit: 1000000 , gasPrice: 3000000000
    // };
    // // console.log("executeTX.data", executeTX.data);
    // await deployer.sendTransaction(tx)
    // 现在是account的问题
    process.exit(0);
})()