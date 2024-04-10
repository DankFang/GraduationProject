import { Contract, Interface, JsonRpcProvider, BrowserProvider } from "ethers";
import Abi from "./RegistryAbi";

const abi = Abi;

let providerViewer: JsonRpcProvider;
let contractViewer: Contract;
let provider: any | null = null;
let signer: any;
let contract: any;
let iface: any;
// polygon
const contractAddress = "0xf713E1bFc2a7235765C5afc668720d58024404b1";
const jsonRpcUrl = "https://polygon-mumbai-bor-rpc.publicnode.com";

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getBatContract(isConnected: boolean) {
  if (provider === null && isConnected) {
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
