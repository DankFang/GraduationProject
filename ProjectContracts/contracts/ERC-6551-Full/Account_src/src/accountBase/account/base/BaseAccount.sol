// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "../interfaces/IAccount.sol";
import "../interfaces/IEntryPoint.sol";
import "../core/Helpers.sol";
/**
 * @title 某些函数的实现模板的抽象合约
 * @author DankFang
 * @notice 其他合约继承并实现这个合约中函数的特定逻辑
 */
abstract contract BaseAccount is IAccount {
    using UserOperationLib for UserOperation;

    //签名失败情况下的返回值，不带时间范围。
    // 和 _packValidationData(true,0,0) 等效，在helper合约
    uint256 constant internal SIG_VALIDATION_FAILED = 1;

    /**
     * @dev 返回账户的nonce
     * @notice 返回顺序的下一个nonce值
     * @dev 对于特定key的nonce,使用entrypoint. getNonce(account, key)
     */
    function getNonce() public view virtual returns (uint256) {
        return entryPoint().getNonce(address(this), 0);
    }

    /**
     * @return 返回该帐户使用的entryPoint
     * @dev 子类应该返回该帐户使用的当前entryPoint
     */
    function entryPoint() public view virtual returns (IEntryPoint);

    /**
     * 验证用户的签名和nonce
     * 子类不需要重写此方法 相反，它应该覆盖特定的内部验证方法
     */
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
    external override virtual returns (uint256 validationData) {
        _requireFromEntryPoint();
        validationData = _validateSignature(userOp, userOpHash);
        _validateNonce(userOp.nonce);
        _payPrefund(missingAccountFunds);
    }

    /**
     * 确保请求来自已知的entrypoint
     */
    function _requireFromEntryPoint() internal virtual view {
        require(msg.sender == address(entryPoint()), "account: not from EntryPoint");
    }

    /**
     * 验证签名是否有效
     * @param userOp userOp验证userOp.signature
     * @param userOpHash 方便字段:请求的哈希值，用来检查签名
     *（还对入口点和链 ID 进行哈希处理）
     * @return validationData 验证数据签名和本次操作的时间范围
     *      <20-byte> sigAuthorizer - 0 表示签名有效，1 表示签名失败，
     *      否则，授权人 合约的地址。
     *      <6-byte> validUntil - 此操作有效的最后一个时间戳。 0 代表 无限期
     *      <6-byte> validAfter - 此操作有效的第一个时间戳
     *      如果账户不使用时间范围，则签名失败返回 SIG_VALIDATION_FAILED 值 (1) 即可
     *      
     *      注意验证码不能使用 block.timestamp (或者 block.number) 
     */
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
    internal virtual returns (uint256 validationData);

    /**
     * 验证UserOperation的nonce
     * 该方法可以验证该账户的nonce要求
     * e.g.
     * 限制随机数仅使用有序的 UserOps（没有无序的UserOps）:
     *      `require(nonce < type(uint64).max)`
     * For a hypothetical account that *requires* the nonce to be out-of-order:
     *      `require(nonce & type(uint64).max == 0)`
     *
     *  实际的随机数唯一性由 EntryPoint 管理，因此没有其他帐户本身需要采取行动
     * 
     *
     * @param nonce to validate
     *
     * solhint-disable-next-line no-empty-blocks
     */
    function _validateNonce(uint256 nonce) internal view virtual {
    }

    /**
     * 像 entrypoint (msg.sender) 发送此交易缺少的资金
     * 子类可以重写此方法以更好地管理资金
     * (e.g.发送到入口点的数量超过所需的最小值，以便在将来的交易中无需再次发送)
     * @param missingAccountFunds 该方法应该向 entrypoint 发送的最小资金
     *  如果有足够的存款，或者 userOp 有付款人，则该值可能为零
     */
    function _payPrefund(uint256 missingAccountFunds) internal virtual {
        if (missingAccountFunds != 0) {
            (bool success,) = payable(msg.sender).call{value : missingAccountFunds, gas : type(uint256).max}("");
            (success);
            //ignore failure (its EntryPoint's job to verify, not account.)
        }
    }
}