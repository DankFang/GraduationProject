// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
/**
 * @title The ERC-6551 Registry Interface
 * @author Ichior
 * @dev The registry contract must implement this interface
 */
interface IERC6551Registry {
    /// @dev The registry SHALL emit the AccountCreated event upon successful account creation
    event AccountCreated(
        address account,
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    );

    /// @dev Creates a token bound account for an ERC-721 token.
    ///
    /// @dev If account has already been created, returns the account address without calling create2.
    ///
    /// @dev If initData is not empty and account has not yet been created, calls account with provided initData after creation.
    /// 
    /// @dev Emits AccountCreated event.
    ///
    /// @return the address of the account
    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external returns (address);

    /// @dev Returns the computed address of a token bound account
    ///
    /// @return The computed address of the account
    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address);
}