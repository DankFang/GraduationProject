// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

interface INonceManager {

    /**
     * Return the next nonce for this sender.
     * Within a given key, the nonce values are sequenced/测序的 (starting with zero, and incremented by one on each userop)
     * But UserOp with different keys can come with arbitrary/随意的 order.
     *
     * @param sender the account address
     * @param key the high 192 bit of the nonce
     * @return nonce a full nonce to pass for next UserOp with this sender.
     */
    function getNonce(address sender, uint192 key)
    external view returns (uint256 nonce);

    /**
     * Manually/手动 increment the nonce of the sender.
     * This method is exposed/裸露 just for completeness/完整性..
     * Account does NOT need to call it, neither during validation, nor elsewhere,
     * as the EntryPoint will update the nonce regardless/不管.
     * Possible use-case is call it with various keys to "initialize" their nonces to one, so that future
     * UserOperations will not pay extra/额外的 for the first transaction with a given key.
     */
    function incrementNonce(uint192 key) external;
}