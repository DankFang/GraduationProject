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
const jsonRpcUrl = "https://polygon-mumbai-bor-rpc.publicnode.com";

/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getAccountContract(
  isConnected: boolean,
  address6551: string
) {
  contractAddress = address6551;
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
