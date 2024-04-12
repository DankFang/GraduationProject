import { BrowserProvider, Contract, ethers, Interface, JsonRpcProvider } from "ethers";

import Abi from "./assetsAbi";

/**
 * 函数如果有view标识就用provider.call
 * 没有view就用signer.sendTransaction
 */
const abi = Abi;

let providerViewer: JsonRpcProvider;
let contractViewer: Contract;
let provider: any | null = null;
let signer: any;
let contract: any;
let iface: any;
let chainId1: any;

let contractAddress: any;

let jsonRpcUrl: any;

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getEthersObject(isConnected: boolean) {
  if (provider === null && isConnected) {
    provider = new BrowserProvider(window.ethereum);
    const {chainId}= await provider.getNetwork()

    chainId1 = Number(chainId)
    jsonRpcUrl = chainId1 == 80001 ? "https://polygon-mumbai-bor-rpc.publicnode.com" : "https://ethereum-sepolia-rpc.publicnode.com"
    contractAddress = chainId1 == 80001 ? "0x25C0D1Cb7851aa1D7DcB550e835949bcfdc69CF5" : "0x51d054C73E767B72C5bAbc79eACc85cFd3cc6f8a"
    
    providerViewer = new JsonRpcProvider(jsonRpcUrl);
    contractViewer = new Contract(contractAddress, abi, providerViewer);
    // console.log(chainId1);
    signer = await provider.getSigner();
    iface = new Interface(abi);
    contract = new Contract(contractAddress, abi, signer);
  } else if (!isConnected) {
    provider = signer = contract = iface = null;
  }

  return {
    signer,
    contract,
    iface,
    provider,
    contractAddress,
    contractViewer,
    providerViewer,
    chainId1
  };
}
