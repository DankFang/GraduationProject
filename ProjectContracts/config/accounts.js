const PARAMS = {
    11155111: {
        ERC4337EntryPointAddr : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
    },
    80001: {
        ERC4337EntryPointAddr : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
    },
    31337: {
        ERC4337EntryPointAddr : '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
}

module.exports = {
    CONTRACTS: {
        11155111: {
            ERC4337EntryPoint : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        },
        80001: {
            ERC4337EntryPoint : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        },
    },
    getParam(chainId, name) {
        if (!name) return PARAMS[chainId]
        else return PARAMS[chainId][name];
    },
}