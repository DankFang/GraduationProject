/**
 ** Account-Abstraction (EIP-4337) singleton EntryPoint implementation.
 ** Only one instance required on each chain.
 **/
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "../core/UserOperation.sol";
import "./IStakeManager.sol";
import "./IAggregator.sol";
import "./INonceManager.sol";

interface IEntryPoint is IStakeManager, INonceManager {

    /***
     * 每个成功请求后发出的事件
     * @param userOpHash - unique identifier for the request (hash its entire/全部的 content, except signature).
     * @param sender - the account that generates/产生 this request.
     * @param paymaster - if non-null/非空, the paymaster that pays for this request.
     * @param nonce - the nonce value from the request.
     * @param success - true if the sender transaction succeeded, false if reverted.
     * @param actualGasCost - actual/实际的 amount paid (by account or paymaster) for this UserOperation.
     * @param actualGasUsed - total gas used by this UserOperation (including preVerification, creation, validation and execution).
     */
    event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster, uint256 nonce, bool success, uint256 actualGasCost, uint256 actualGasUsed);

    /**
     * account "sender" was deployed.
     * @param userOpHash the userOp that deployed this account. UserOperationEvent will follow.
     * @param sender the account that is deployed
     * @param factory the factory used to deploy this account (in the initCode)
     * @param paymaster the paymaster used by this UserOp
     */
    event AccountDeployed(bytes32 indexed userOpHash, address indexed sender, address factory, address paymaster);

    /**
     * An event emitted if the UserOperation "callData" reverted with non-zero length
     * @param userOpHash request/请求唯一标识符
     * @param sender the sender of this request
     * @param nonce the nonce used in the request
     * @param revertReason - the return bytes from the (reverted) call to "callData".
     */
    event UserOperationRevertReason(bytes32 indexed userOpHash, address indexed sender, uint256 nonce, bytes revertReason);

    /**
     * an event emitted by handleOps(), before starting the execution loop/循环.
     * 在此事件之前发出的任何事件都是验证的一部分
     */
    event BeforeExecution();

    /**
     * signature aggregator used by the following UserOperationEvents within this bundle.
     */
    event SignatureAggregatorChanged(address indexed aggregator);

    /**
     * handleOps 的自定义恢复错误，用于识别有问题的操作
     *  NOTE: 如果simulateValidation 成功通过，则handleOps 应该没有理由失败
     *  @param opIndex - index into the array of ops to the failed one (in simulateValidation, this is always zero)
     *  @param reason - revert reason
     *      The string starts with a unique code "AAmn", where "m" is "1" for factory, "2" for account and "3" for paymaster issues,
     *      so a failure can be attributed to the correct entity. 因此失败可以归因于正确的实体
     *   应该在链下handleOps模拟中捕获，而不是在链上发生
     *   对于减少针对批量处理程序的 DoS 尝试或对factory/account/paymaster的 reverts进行故障排除非常有用
     */
    error FailedOp(uint256 opIndex, string reason);

    /**
     * error case when a signature aggregator fails to verify the aggregated signature it had created.
     */
    error SignatureValidationFailed(address aggregator);

    /**
     * Successful result from simulateValidation.  simulate：模拟
     * @param returnInfo gas and time-range returned values
     * @param senderInfo stake information about the sender
     * @param factoryInfo stake information about the factory (if any) 
     * @param paymasterInfo stake information about the paymaster (if any / 如果有)
     */
    error ValidationResult(ReturnInfo returnInfo,
        StakeInfo senderInfo, StakeInfo factoryInfo, StakeInfo paymasterInfo);

    /**
     * Successful result from simulateValidation, if the account returns a signature aggregator
     * @param returnInfo gas and time-range returned values
     * @param senderInfo stake information about the sender
     * @param factoryInfo stake information about the factory (if any)
     * @param paymasterInfo stake information about the paymaster (if any)
     * @param aggregatorInfo signature aggregation info (if the account requires signature aggregator)
     *      bundler 必须使用它来验证签名signature，或者拒绝 UserOperation 
     */
    error ValidationResultWithAggregation(ReturnInfo returnInfo,
        StakeInfo senderInfo, StakeInfo factoryInfo, StakeInfo paymasterInfo,
        AggregatorStakeInfo aggregatorInfo);

    /**
     * return value of getSenderAddress
     */
    error SenderAddressResult(address sender);

    /**
     * return value of simulateHandleOp   simulate：模拟
     */
    error ExecutionResult(uint256 preOpGas, uint256 paid, uint48 validAfter, uint48 validUntil, bool targetSuccess, bytes targetResult);

    //UserOps handled, per aggregator     handled：处理
    struct UserOpsPerAggregator {
        UserOperation[] userOps;

        // aggregator address
        IAggregator aggregator;
        // aggregated signature
        bytes signature;
    }

    /**
     * 批量处理 UserOperation.
     * no signature aggregator is used.
     * 如果任何账户需要aggregator（即在执行simulateValidation时返回aggregator），则必须使用handleAggreatedOps()
     * @param ops the operations to execute
     * @param beneficiary the address to receive the fees
     */
    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external;

    /**
     * Execute a batch of UserOperation with Aggregators
     * @param opsPerAggregator the operations to execute, grouped by aggregator (or address(0) for no-aggregator accounts)
     * @param beneficiary the address to receive the fees
     */
    function handleAggregatedOps(
        UserOpsPerAggregator[] calldata opsPerAggregator,
        address payable beneficiary
    ) external;

    /**
     * generate a request Id - unique identifier for this request.
     * 请求 ID 是 userOp 内容（签名除外）、entrypoint 和 chainid 的哈希值。
     */
    function getUserOpHash(UserOperation calldata userOp) external view returns (bytes32);

    /**
     * 模拟对 account.validateUserOp 和 paymaster.validatePaymasterUserOp 的调用
     * @dev 这个方法总是会revert。 成功的结果是 ValidationResult 错误 其他错误都是失败。
     * @dev The node must also verify it doesn't use banned opcodes, and that it doesn't reference/参考 storage outside the account's data.
     * @param userOp the user operation to validate.
     */
    function simulateValidation(UserOperation calldata userOp) external;

    /**
     * gas and return values during simulation/模拟
     * @param preOpGas the gas used for validation (including preValidationGas)
     * @param prefund the required prefund/预付款 for this operation
     * @param sigFailed validateUserOp's (or paymaster's) signature check failed
     * @param validAfter - first timestamp this UserOp is valid (merging account and paymaster time-range)
     * @param validUntil - last timestamp this UserOp is valid (merging account and paymaster time-range)
     * @param paymasterContext returned by validatePaymasterUserOp (to be passed into postOp)
     */
    struct ReturnInfo {
        uint256 preOpGas;
        uint256 prefund;
        bool sigFailed;
        uint48 validAfter;
        uint48 validUntil;
        bytes paymasterContext;
    }

    /**
     * returned aggregated signature info.
     * the aggregator returned by the account, and its current stake.
     */
    struct AggregatorStakeInfo {
        address aggregator;
        StakeInfo stakeInfo;
    }

    /**
     * Get counterfactual sender address. 获取反事实的发件人地址。
     *  计算将由 UserOperation 中的 initCode 和 salt 生成的sender合约地址。
     * this method always revert, and returns the address in SenderAddressResult error
     * @param initCode the constructor code to be passed into the UserOperation.
     */
    function getSenderAddress(bytes memory initCode) external;


    /**
     * simulate full execution of a UserOperation (including both validation and target execution)
     * this method will always revert with "ExecutionResult".
     * 它执行 UserOperation 的完整验证，但忽略签名错误。
     * userop成功后调用一个可选的目标地址，并返回其值
     * (在整个call reverted之前)
     * 请注意，为了收集目标调用的成功/失败，必须在启用跟踪的情况下执行以跟踪发出的事件。
     * @param op the UserOperation to simulate
     * @param target 如果非零，则为用户操作模拟后调用的目标地址。 如果调用，则 targetSuccess 和 targetResult 将设置为该调用的返回值。
     * @param targetCallData 传递到目标地址的callData
     */
    function simulateHandleOp(UserOperation calldata op, address target, bytes calldata targetCallData) external;
}