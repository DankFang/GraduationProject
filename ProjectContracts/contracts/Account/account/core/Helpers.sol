// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable no-inline-assembly */

/**
 * 从validateUserOp返回data数据
 * validateUserOp 返回一个 uint256, 由' _packedValidationData '创建，并由' _parseValidationData '解析
 * @param aggregator - address(0) - 该帐户自行验证了签名.
 *              address(1) - 该帐户未能验证签名.
 *              otherwise - 这是签名聚合器的地址，必须用于验证签名
 * @param validAfter - 这个UserOp只有在这个时间戳之后才有效.
 * @param validaUntil - 这个UserOp只在这个时间戳前有效.
 */
    struct ValidationData {
        address aggregator;
        uint48 validAfter;
        uint48 validUntil;
    }

//提取 sigFailed, validAfter, validUntil.
//也将 zero validUntil 转化为 to type(uint48).max
    function _parseValidationData(uint validationData) pure returns (ValidationData memory data) {
        address aggregator = address(uint160(validationData));
        uint48 validUntil = uint48(validationData >> 160);
        if (validUntil == 0) {
            validUntil = type(uint48).max;
        }
        uint48 validAfter = uint48(validationData >> (48 + 160));
        return ValidationData(aggregator, validAfter, validUntil);
    }

// 与account交互并给出paymaster 的范围.
    function _intersectTimeRange(uint256 validationData, uint256 paymasterValidationData) pure returns (ValidationData memory) {
        ValidationData memory accountValidationData = _parseValidationData(validationData);
        ValidationData memory pmValidationData = _parseValidationData(paymasterValidationData);
        address aggregator = accountValidationData.aggregator;
        if (aggregator == address(0)) {
            aggregator = pmValidationData.aggregator;
        }
        uint48 validAfter = accountValidationData.validAfter;
        uint48 validUntil = accountValidationData.validUntil;
        uint48 pmValidAfter = pmValidationData.validAfter;
        uint48 pmValidUntil = pmValidationData.validUntil;

        if (validAfter < pmValidAfter) validAfter = pmValidAfter;
        if (validUntil > pmValidUntil) validUntil = pmValidUntil;
        return ValidationData(aggregator, validAfter, validUntil);
    }

/**
 * helper 打包validateUserOp的返回值
 * @param data - 打包的 ValidationData 的返回值
 */
    function _packValidationData(ValidationData memory data) pure returns (uint256) {
        return uint160(data.aggregator) | (uint256(data.validUntil) << 160) | (uint256(data.validAfter) << (160 + 48));
    }

/**
 * helper 打包的 ValidationData 的返回值, 当不使用aggregator时
 * @param sigFailed - true 表示签名失败, false 表示成功
 * @param validUntil 最后一个时间戳这个UserOperation是有效的(或者为零表示无限)
 * @param validAfter UserOperation的第一个时间戳有效
 */
    function _packValidationData(bool sigFailed, uint48 validUntil, uint48 validAfter) pure returns (uint256) {
        return (sigFailed ? 1 : 0) | (uint256(validUntil) << 160) | (uint256(validAfter) << (160 + 48));
    }

/**
 * keccak function over calldata.
 * keccak calldata上的数据的函数.
 * @dev 复制 calldata到 memory, keccak加密并且下沉到分配的 memory. 这比solidity语法更高效
 */
    function calldataKeccak(bytes calldata data) pure returns (bytes32 ret) {
        assembly {
            let mem := mload(0x40)
            let len := data.length
            calldatacopy(mem, data.offset, len)
            ret := keccak256(mem, len)
        }
    }