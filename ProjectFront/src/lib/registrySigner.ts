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
let jsonRpcUrl: any;
let registry: any;
/**
 *
 * @param isConnected 判断当前页面是否连接了钱包
 * @returns
 */
export default async function getRegistryContract(isConnected: boolean, chainId: number) {
  if (provider === null && isConnected) {
    jsonRpcUrl = chainId == 80001 ? "https://polygon-mumbai-bor-rpc.publicnode.com" : "https://ethereum-sepolia-rpc.publicnode.com"
    providerViewer = new JsonRpcProvider(jsonRpcUrl);
    registry = chainId == 80001 ? "0xf713E1bFc2a7235765C5afc668720d58024404b1" : "0x68b7649d9d24B40F04e71495b8c594C5B58735e5"
    contractViewer = new Contract(registry, abi, providerViewer);
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(registry, abi, signer);
    iface = new Interface(abi);
  } else if (!isConnected) {
    provider = signer = contract = null;
  }

  return { contract, iface, provider, registry, contractViewer, signer };
}
