import { BrowserProvider, Contract, Interface, JsonRpcProvider } from "ethers";

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
const contractAddress = "0x25C0D1Cb7851aa1D7DcB550e835949bcfdc69CF5";
const jsonRpcUrl = "https://polygon-mumbai-bor-rpc.publicnode.com";

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getEthersObject(isConnected: boolean) {
  if (provider === null && isConnected) {
    providerViewer = new JsonRpcProvider(jsonRpcUrl);
    contractViewer = new Contract(contractAddress, abi, providerViewer);
    provider = new BrowserProvider(window.ethereum);
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
    providerViewer
  };
}
