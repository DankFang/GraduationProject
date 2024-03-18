// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./interfaces/IERC6551Account.sol";
import "./library/ERC6551AccountLib.sol";
 
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {BaseAccount as BaseERC4337Account, IEntryPoint, UserOperation} from "./base/BaseAccount.sol"; 

import "./interfaces/IAccountGuardian.sol";

error NotAuthorized();
error InvalidInput();
error AccountLocked();
error ExceedsMaxLockTime();
error UntrustedImplementation();
error OwnershipCycle();

/**
 * @title 一个单一的合约地址只被唯一一个ERC721代币拥有
 */
contract Account is
    IERC165,
    IERC1271,
    IERC6551Account,
    IERC721Receiver,
    IERC1155Receiver,
    UUPSUpgradeable,
    BaseERC4337Account
{
    using ECDSA for bytes32;

    /// @dev ERC-4337 entry point address
    address public immutable _entryPoint;

    /// @dev AccountGuardian contract address
    address public immutable guardian;

    /// @dev 该帐户将被解锁的时间戳
    uint256 public lockedUntil;

    /// @dev owner => 函数选择器 => 实现.  在调用特定选择器的函数时,可转发到特定实现地址的低级call调用
    mapping(address => mapping(bytes4 => address)) public overrides;

    /// @dev mapping from owner => caller => has permissions  (owner是否给caller授权)
    mapping(address => mapping(address => bool)) public permissions;

    event OverrideUpdated(
        address owner,
        bytes4 selector,
        address implementation
    );

    event PermissionUpdated(address owner, address caller, bool hasPermission);

    event LockUpdated(uint256 lockedUntil);

    /// @dev reverts if caller is not the owner of the account
    modifier onlyOwner() {
        if (msg.sender != owner()) revert NotAuthorized();
        _;
    }

    /// @dev reverts if caller is not authorized to execute on this account
    modifier onlyAuthorized() {
        if (!isAuthorized(msg.sender)) revert NotAuthorized();
        _;
    }

    /// @dev reverts if this account is currently locked
    modifier onlyUnlocked() {
        if (isLocked()) revert AccountLocked();
        _;
    }

    constructor(address _guardian, address entryPoint_) {
        if (_guardian == address(0) || entryPoint_ == address(0))
            revert InvalidInput();

        _entryPoint = entryPoint_;
        guardian = _guardian;
    }

    /// @dev allows eth transfers by default, but allows account owner to override
    receive() external payable {
        _handleOverride();
    }

    /// @dev 允许帐户所有者通过override向帐户添加其他功能
    fallback() external payable {
        _handleOverride();
    }

    /**
     * @dev 如果调用者被授权call,则对帐户执行低级调用
     * @param value 转账ETH的数量
     * @param to 要调用的目标合约地址
     */
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external payable onlyAuthorized onlyUnlocked returns (bytes memory) {
        emit TransactionExecuted(to, value, data);

        _incrementNonce();

        return _call(to, value, data);
    }

    /// @dev 为给定的函数调用设置实现地址
    function setOverrides(
        bytes4[] calldata selectors,
        address[] calldata implementations
    ) external onlyUnlocked {
        address _owner = owner();
        if (msg.sender != _owner) revert NotAuthorized();

        uint256 length = selectors.length;
        
        // 实现地址implementations数组的长度等于selectors数组的长度
        if (implementations.length != length) revert InvalidInput();

        for (uint256 i = 0; i < length; i++) {
            overrides[_owner][selectors[i]] = implementations[i];
            emit OverrideUpdated(_owner, selectors[i], implementations[i]);
        }

        _incrementNonce();
    }

    /// @dev 给caller授权执行权限
    function setPermissions(
        address[] calldata callers,
        bool[] calldata _permissions
    ) external onlyUnlocked {
        address _owner = owner();
        if (msg.sender != _owner) revert NotAuthorized();

        uint256 length = callers.length;

        if (_permissions.length != length) revert InvalidInput();

        for (uint256 i = 0; i < length; i++) {
            permissions[_owner][callers[i]] = _permissions[i];
            emit PermissionUpdated(_owner, callers[i], _permissions[i]);
        }

        _incrementNonce();
    }

    /// @dev 锁定账户直到特定时间
    function lock(uint256 _lockedUntil) external onlyOwner onlyUnlocked {
        // 最多锁定一年
        if (_lockedUntil > block.timestamp + 365 days)
            revert ExceedsMaxLockTime();

        lockedUntil = _lockedUntil;

        emit LockUpdated(_lockedUntil);

        _incrementNonce();
    }

    /// @dev 返回此账户是否被锁定(bool)
    function isLocked() public view returns (bool) {
        return lockedUntil > block.timestamp;
    }

    /// @dev EIP-1271 签名验证. 默认情况下, 只有该帐户的所有者被允许签名.
    /// @dev EIP-1271,合约的标准签名验证方法,当账户是智能合约时验证签名的标准方法. 只有当签名者被授权代表智能钱包执行给定操作时,签名的操作消息才有效
    // 这个函数可以被 override 重写.
    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4 magicValue)
    {
        _handleOverrideStatic();

        bool isValid = SignatureChecker.isValidSignatureNow(
            owner(),
            hash,
            signature
        );

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return "";
    }

    /// @dev 返回拥有此账户的token的EIP-155 chain ID, token合约地址,以及tokenid
    function token()
        external
        view
        returns (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        )
    {
        return ERC6551AccountLib.token();
    }

    /// @dev 返回当前的合约的nonce
    function nonce() public view override returns (uint256) {
        return IEntryPoint(_entryPoint).getNonce(address(this), 0);
    }

    /// @dev 如果caller不是ERC-4337 entry point,则增加当前合约账户的nonce
    function _incrementNonce() internal {
        if (msg.sender != _entryPoint)
            IEntryPoint(_entryPoint).incrementNonce(0);
    }

    /// @dev 返回 ERC-4337 entry point 的地址
    function entryPoint() public view override returns (IEntryPoint) {
        return IEntryPoint(_entryPoint);
    }

    /// @dev 返回拥有该帐户的 ERC-721 代币的所有者。 默认情况下,token的所有者拥有该帐户的所有权限。
    function owner() public view returns (address) {
        (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();

        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    /// @dev 返回给定调用者的授权状态
    function isAuthorized(address caller) public view returns (bool) {
        // authorize entrypoint for 4337 transactions
        if (caller == _entryPoint) return true;

        (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();
        address _owner = IERC721(tokenContract).ownerOf(tokenId);

        // 授权令牌所有者
        if (caller == _owner) return true;

        // 如果所有者已授予权限,则授权调用者
        if (permissions[_owner][caller]) return true;

        // 如果不在本链上,则授权受信任的跨链执行者
        if (
            chainId != block.chainid &&
            IAccountGuardian(guardian).isTrustedExecutor(caller)
        ) return true;

        return false;
    }

    /// @dev 如果此帐户支持给定的 interfaceId,则返回 true。 该方法可以通过重写来扩展。
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        bool defaultSupport = interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC6551Account).interfaceId;

        if (defaultSupport) return true;

        // if not supported by default, check override
        _handleOverrideStatic();

        return false;
    }

    /// @dev 允许接收 ERC-721 代币,只要它们不会导致所有权循环. 该函数可以被重写
    function onERC721Received(
        address,
        address,
        uint256 receivedTokenId,
        bytes memory
    ) public view override returns (bytes4) {
        _handleOverrideStatic();

        (
            uint256 chainId,
            address tokenContract,
            uint256 tokenId
        ) = ERC6551AccountLib.token();

        if (
            chainId == block.chainid &&
            tokenContract == msg.sender &&
            tokenId == receivedTokenId
        ) revert OwnershipCycle();

        return this.onERC721Received.selector;
    }

    /// @dev 允许接收 ERC-1155 代币。此功能可被overriden
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public view override returns (bytes4) {
        _handleOverrideStatic();

        return this.onERC1155Received.selector;
    }

    /// @dev 允许 批量 接收 ERC-1155 代币。此功能可被overriden
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public view override returns (bytes4) {
        _handleOverrideStatic();

        return this.onERC1155BatchReceived.selector;
    }

    /// @dev 合约升级只能由所有者执行,并且新的implementation必须被信任
    function _authorizeUpgrade(address newImplementation)
        internal
        view
        override
        onlyOwner
    {
        bool isTrusted = IAccountGuardian(guardian).isTrustedImplementation(
            newImplementation
        );
        if (!isTrusted) revert UntrustedImplementation();
    }

    /// @dev 验证一个给定 ERC-4337 操作的签名
    /// @dev bytes4(keccak256("isValidSignature(bytes32,bytes)") = 0x1626ba7e
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256 validationData) {
        bool isValid = this.isValidSignature(
            userOpHash.toEthSignedMessageHash(),
            userOp.signature
        ) == IERC1271.isValidSignature.selector;

        if (isValid) {
            return 0;
        }

        return 1;
    }

    /**
     * @dev 执行低级调用
     * @param to 要调用的目标合约地址
     * @param value 要发送的ETH数量
     * @param data calldata
     */
    function _call(
        address to,
        uint256 value,
        bytes calldata data
    ) internal returns (bytes memory result) {
        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /// @dev 如果设置了override,则对implementation执行低级调用
    function _handleOverride() internal {
        address implementation = overrides[owner()][msg.sig];

        if (implementation != address(0)) {
            bytes memory result = _call(implementation, msg.value, msg.data);
            assembly {
                return(add(result, 32), mload(result))
            }
        }
    }

    /// @dev 执行低级调用:static call
    function _callStatic(address to, bytes calldata data)
        internal
        view
        returns (bytes memory result)
    {
        bool success;
        (success, result) = to.staticcall(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /// @dev 如果设置了override,将对implementation执行static call低级调用
    function _handleOverrideStatic() internal view {
        address implementation = overrides[owner()][msg.sig];

        if (implementation != address(0)) {
            bytes memory result = _callStatic(implementation, msg.data);
            assembly {
                // 跳过内存里面的长度字段,然后读取result的数据部分
                return(add(result, 32), mload(result))
            }
        }
    }
}