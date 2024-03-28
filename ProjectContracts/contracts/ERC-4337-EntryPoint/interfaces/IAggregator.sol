// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "../core/UserOperation.sol";

/**
 * Aggregated Signatures validator. 聚合签名验证器
 */
interface IAggregator {

    /**
     * validate aggregated signature.
     * revert if the aggregated signature does not match the given list of operations.
     */
    function validateSignatures(UserOperation[] calldata userOps, bytes calldata signature) external view;

    /**
     * validate signature of a single userOp
     * This method is should be called by bundler after EntryPoint.simulateValidation() returns (reverts) with ValidationResultWithAggregation
     * 首先，它验证 userOp 上的签名。 然后它返回创建handleOps时要使用的数据。
     * @param userOp the userOperation received from the user.
     * @return sigForUserOp 调用handleOps时要放入userOp的签名字段中的值。
     *    (usually empty, unless account and aggregator support some kind of "multisig"
     */
    function validateUserOpSignature(UserOperation calldata userOp)
    external view returns (bytes memory sigForUserOp);

    /**
     * 将多个签名聚合为一个值。
     * 该方法在链外调用，计算要通过handleOps()传递的签名
     * bundler 可以使用优化的自定义代码执行此 aggregation
     * @param userOps 用于收集签名的 UserOperations数组。
     * @return aggregatedSignature the aggregated signature
     */
    function aggregateSignatures(UserOperation[] calldata userOps) external view returns (bytes memory aggregatedSignature);
}