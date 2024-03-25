const PARAMS = {
    11155111: {
        AccountGuardianAddr : '0x88dc8e1e8c2b246ddcfcd6623da7c5bda5195afd',
        ERC4337EntryPointAddr : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
    }
}

module.exports = {
    CONTRACTS: {
        11155111: {
            AccountGuardian : '0x88dc8e1e8c2b246ddcfcd6623da7c5bda5195afd',
            ERC4337EntryPoint : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        },
    },
    getParam(chainId, name) {
        if (!name) return PARAMS[chainId]
        else return PARAMS[chainId][name];
    },
}