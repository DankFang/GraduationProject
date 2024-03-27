// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

// @dev 管理帐户的升级和跨链执行设置
contract AccountGuardian is Ownable2Step {
    // @dev 跨链的执行者是否可信 executor => is trusted
    mapping(address => bool) public isTrustedImplementation;

    // @dev mapping from implementation => is trusted
    mapping(address => bool) public isTrustedExecutor;

    event TrustedImplementationUpdated(address implementation, bool trusted);
    event TrustedExecutorUpdated(address executor, bool trusted);

    function setTrustedImplementation(address implementation, bool trusted)
        external
        onlyOwner
    {
        isTrustedImplementation[implementation] = trusted;
        emit TrustedImplementationUpdated(implementation, trusted);
    }

    function setTrustedExecutor(address executor, bool trusted)
        external
        onlyOwner
    {
        isTrustedExecutor[executor] = trusted;
        emit TrustedExecutorUpdated(executor, trusted);
    }
}