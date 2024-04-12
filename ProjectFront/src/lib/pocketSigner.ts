import { Contract, Interface, JsonRpcProvider, BrowserProvider } from "ethers";
import Abi from "./pocketAbi";

const abi = Abi;

let providerViewer: JsonRpcProvider;
let contractViewer: Contract;
let provider: any | null = null;
let signer: any;
let contract: any;
let iface: any;
// polygon
let jsonRpcUrl:any;
let contractAddress: any;

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getBatContract(isConnected: boolean, chainId: number) {
  if (provider === null && isConnected) {
    jsonRpcUrl = chainId == 80001 ? "https://polygon-mumbai-bor-rpc.publicnode.com" : "https://ethereum-sepolia-rpc.publicnode.com"
    providerViewer = new JsonRpcProvider(jsonRpcUrl);
    contractAddress = chainId == 80001 ? "0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3" : "0xF2085520559dE812ca76e64a6805F776F2976D32"
    contractViewer = new Contract(contractAddress, abi, providerViewer);
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(contractAddress, abi, signer);
    iface = new Interface(abi);
  } else if (!isConnected) {
    provider = signer = contract = null;
  }

  return { contract, iface, provider, contractAddress, contractViewer };
}
