// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title 用于本项目中作为用户资产的NFT合约
/// @author DankFang
/// @notice 用户可以在本合约里mint NFT作为资产用于本项目
contract assetsNFT is ERC721 {
    uint public tokenID;
    constructor() ERC721("assets","assets"){}

    /// @notice mint NFT，tokenId是自增的(从1开始)
    function mint() external {
        tokenID += 1;
        _mint(_msgSender(),tokenID);
    }

    ///@notice token的基础uri
    function _baseURI() internal pure override returns (string memory){
        return "";
    }

}