// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "../interfaces/IEntryPoint.sol";

/**
 * nonce management functionality
 */
contract NonceManager is INonceManager {

    /**
     * The next valid sequence number for a given nonce key.     sequence：顺序
     */
    mapping(address => mapping(uint192 => uint256)) public nonceSequenceNumber;

    function getNonce(address sender, uint192 key)
    public view override returns (uint256 nonce) {
        return nonceSequenceNumber[sender][key] | (uint256(key) << 64);
    }

    // 允许帐户手动增加自己的随机数。
    //  主要是为了在构造期间可以将随机数设置为非零，以“吸收”第一个随机数增量到第一个交易(construction)的 Gas 成本，而不是第二个交易）
    function incrementNonce(uint192 key) public override {
        nonceSequenceNumber[msg.sender][key]++;
    }

    /**
     * 验证此帐户的随机数唯一性。
     * called just after validateUserOp()
     */
    function _validateAndUpdateNonce(address sender, uint256 nonce) internal returns (bool) {

        uint192 key = uint192(nonce >> 64);
        uint64 seq = uint64(nonce);
        return nonceSequenceNumber[sender][key]++ == seq;
    }

}