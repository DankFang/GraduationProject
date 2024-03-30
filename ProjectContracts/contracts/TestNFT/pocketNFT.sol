// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract pocketNFT is ERC721 {
    uint public tokenID;
    constructor() ERC721("pocket","pocket"){}

    /// @notice mint NFT，tokenId是自增的
    /// @dev 若用户不了解ERC6551，则将本次mint的NFT作为其抽象账户的绑定
    function mint() external {
        tokenID += 1;
        _mint(_msgSender(),tokenID);
    }

    ///@notice token的基础uri
    function _baseURI() internal pure override returns (string memory){
        return "";
    }

}