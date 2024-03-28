// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "../core/UserOperation.sol";

interface IAccount {

    /**
     * Validate user's signature and nonce
     * the entryPoint will make the call to the recipient only if this validation call returns successfully.
     * signature failure should be reported by returning SIG_VALIDATION_FAILED (1).
     * 这允许在没有有效签名的情况下进行“simulation call/模拟调用”
     * Other failures (e.g. nonce mismatch, or invalid signature format/格式) should still revert to signal failure.
     *
     * @dev Must validate caller is the entryPoint.
     *      Must validate the signature and nonce
     * @param userOp the operation that is about to be executed.
     * @param userOpHash hash of the user's request data. can be used as the basis for signature.
     * @param missingAccountFunds missing funds on the account's deposit in the entrypoint.
     *      这是转移给发送者（entryPoint）以便能够进行call的最小金额。
     *      多余的部分将作为押金留在入口点，以供将来调用。
     *      可以随时使用“entryPoint.withdrawTo()”来withdrawn
     *      In case there is a paymaster in the request (or the current deposit is high enough), this value will be zero.
     * @return validationData packaged ValidationData structure. use `_packValidationData` and `_unpackValidationData` to encode and decode
     *      <20-byte> sigAuthorizer - 0 for valid signature, 1 to mark signature failure,
     *         otherwise, an address of an "authorizer" contract.
     *      <6-byte> validUntil - last timestamp this operation is valid. 0 for "indefinite"
     *      <6-byte> validAfter - first timestamp this operation is valid
     *      If an account doesn't use time-range, it is enough to return SIG_VALIDATION_FAILED value (1) for signature failure.
     *      请注意，验证代码不能直接使用 block.timestamp（或 block.number)
     */
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
    external returns (uint256 validationData);
}