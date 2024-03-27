// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/**
 * EntryPoint 的辅助合约，从“neutral”地址调用 userOp.initCode，该地址显然不是 EntryPoint 本身。
 */
contract SenderCreator {

    /**
     * call the "initCode" factory to create and return the sender account address
     * @param initCode来自 UserOp 的 initCode 值。 包含 20 个字节的factory地址，后面是 calldata
     * @return sender 创建帐户的返回地址，或失败时返回零地址。
     */
    function createSender(bytes calldata initCode) external returns (address sender) {
        address factory = address(bytes20(initCode[0 : 20]));
        bytes memory initCallData = initCode[20 :];
        bool success;
        /* solhint-disable no-inline-assembly */
        assembly {
            success := call(gas(), factory, 0, add(initCallData, 0x20), mload(initCallData), 0, 32)
            sender := mload(0)
        }
        if (!success) {
            sender = address(0);
        }
    }
}