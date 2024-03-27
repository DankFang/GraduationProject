// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

library ERC6551AccountLib {
    function token()
        internal
        view
        returns (
            uint256,
            address,
            uint256
        )
    {
        bytes memory footer = new bytes(0x60);

        assembly {
            // copy 0x60 bytes from end of footer
            // 0x4d = 77, 0xad = 173
            // address(): 这个函数返回当前合约的地址
            /**
             * add(footer, 0x20): 这个表达式计算出了要复制的字节的起始位置。
             * footer 是一个 bytes memory 类型的变量，0x20 是 Solidity 中每个动态数组前面的 32 字节存储长度的部分，
             * 所以 add(footer, 0x20) 等于 footer 数组的起始位置，从数组的第一个字节开始计数。

             * 0x4d 和 0xad: 这是要复制的字节数。
             * 它从 footer 从 0x4d（77）开始复制，复制到 0xad（173），总共复制0x60（96）个字节。
             * 将复制的数据在footer数组的0x20位置开始存

             * 总之，这段代码的作用是从当前合约的代码中复制了 0x60 个字节的数据，从 footer 数组的末尾向前复制（即从左到右），复制到合约的内存中。
             */
            extcodecopy(address(), add(footer, 0x20), 0x4d, 0xad)
        }

        return abi.decode(footer, (uint256, address, uint256));
    }

    function salt() internal view returns (uint256) {
        bytes memory footer = new bytes(0x20);

        assembly {
            // 0x2d = 45    0x4d = 77
            // 从当前合约的0x2d开始复制bytecode到0x4d结束，存入footer数组里
            extcodecopy(address(), add(footer, 0x20), 0x2d, 0x4d)
        }

        return abi.decode(footer, (uint256));
    }
}