const PARAMS = {
    11155111: {
        AccountGuardianAddr : '0xd107BC0390fcDd719386214e055C480960A41246',
        ERC4337EntryPointAddr : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
    }
}

module.exports = {
    CONTRACTS: {
        11155111: {
            AccountGuardian : '0xd107BC0390fcDd719386214e055C480960A41246',
            ERC4337EntryPoint : '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        },
    },
    getParam(chainId, name) {
        if (!name) return PARAMS[chainId]
        else return PARAMS[chainId][name];
    },
}