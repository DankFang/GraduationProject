import { Contract, Interface, JsonRpcProvider, BrowserProvider } from "ethers";
import Abi from "./accountAbi";

const abi = Abi;

let providerViewer: JsonRpcProvider;
let contractViewer: Contract;
let provider: any | null = null;
let signer: any;
let contract: any;
let iface: any;
// polygon
let contractAddress = "";
let jsonRpcUrl: any;

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getAccountContract(
  isConnected: boolean,
  address6551: string,
  chainId: number
) {
  contractAddress = address6551;
  if (provider === null && isConnected) {
    jsonRpcUrl = chainId == 80001 ? "https://polygon-mumbai-bor-rpc.publicnode.com" : "https://ethereum-sepolia-rpc.publicnode.com"
    providerViewer = new JsonRpcProvider(jsonRpcUrl);
    contractViewer = new Contract(contractAddress, abi, providerViewer);
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(contractAddress, abi, signer);
    iface = new Interface(abi);
  } else if (!isConnected) {
    provider = signer = contract = null;
  }

  return { contract, iface, provider, contractAddress, contractViewer, signer };
}
