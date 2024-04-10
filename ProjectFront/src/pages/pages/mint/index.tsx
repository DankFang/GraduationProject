import ComButton from "@/components/button/button";
import { useEffect, useState } from "react";
import style from "./index.module.scss";
/**
 * web3相关的引用
 */
import { BrowserProvider } from "ethers";
import { useAccount } from "wagmi";
import geteEthersObject from "@/lib/assetsSigner";
import getBatContract from "@/lib/pocketSigner";
import getRegistryContract from "@/lib/registrySigner";
import getAccountContract from "@/lib/accountSigner";

// assets合约
let contract: any = null;

// Registry合约
let regisContract: any = null;
let regisSigner: any = null;

// porket合约
let bagContract: any = null;
let bagContractViewer: any = null;
let old_address: any = "";

// 链ID
const chainId = 80001;

export default function Mint() {
  const [bundleTokenid, setBundleTokenid] = useState("");
  const [inTokenid, setInTokenid] = useState("");
  const [outTokenid, setOutTokenid] = useState("");
  const [eoaAddress, setEoaAddress] = useState("");
  const [assetsNumber, setAssetsNumber] = useState(0);
  const [assetsIds, setAssetsIds] = useState<Array<{ id: number }>>([]);
  const [account6551account, setAccount6551account] = useState("");
  const { isConnected, address } = useAccount();
  old_address = address;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected || address !== old_address) {
      // assets合约
      geteEthersObject(isConnected).then((res) => {
        contract = res.contract;
      });

      // assets合约
      getRegistryContract(isConnected).then((res) => {
        regisContract = res.contract;
        regisSigner = res.signer;
      });

      // 注册proket实例
      getBatContract(isConnected).then((res) => {
        bagContract = res.contract;
        bagContractViewer = res.contractViewer;
      });

      setEoaAddress(address as string);

      old_address = address;
    }
  }, [isConnected, address]);

  /**接受input的值 */
  function handleInput(e: any, type: string) {
    if (type === "in") {
      setInTokenid(e.target.value as string);
    } else if (type === "out") {
      setOutTokenid(e.target.value as string);
    } else if (type === "bundle") {
      setBundleTokenid(e.target.value as string);
    }
  }

  /**转出6551 */
  async function executeCall() {
    if (account6551account === "") {
      alert("请先创建账户");
      return;
    }
    if (outTokenid === "") {
      alert("请输入转出的tokenid");
      return;
    }
    setLoading(true);

    // 查看生成的账户是什么
    const createdAccount = await regisContract.createAccount.staticCall(
      "0xA477e898B403f00cB41f760D83282fb20545Edc5", // Account的proxy
      chainId,
      "0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3", // 需要绑定的NFT的地址
      bundleTokenid,
      0,
      "0x8129fc1c"
    );
    // 从抽象账户转出资产
    const transferAssetsNFT = await contract.transferFrom.populateTransaction(
      createdAccount,
      address,
      outTokenid
    );

    // 注册account合约
    const contractObj = await getAccountContract(isConnected, createdAccount);
    const AccountContract = contractObj.contract;

    const executeTX = await AccountContract.executeCall.populateTransaction(
      "0x25C0D1Cb7851aa1D7DcB550e835949bcfdc69CF5",
      0,
      transferAssetsNFT.data
      // { gasLimit: 1000000 , gasPrice: 3000000000}
    );
    let tx = {
      to: createdAccount,
      data: executeTX.data
      // gasLimit: 1000000 , gasPrice: 3000000000
    };

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    await signer.sendTransaction(tx);
    setLoading(false);
  }

  /**转入6551 */
  async function transTest() {
    if (account6551account === "") {
      alert("请先创建账户");
      return;
    }
    if (inTokenid === "") {
      alert("请输入转入的tokenid");
      return;
    }
    setLoading(true);
    await contract.safeTransferFrom(address, account6551account, inTokenid);
    setLoading(false);
  }

  /**
   * mint pocket的函数
   */
  async function createAccount() {
    if (!address || bundleTokenid === "") return;

    setLoading(true);
    try {
      // 设置mint背包的监听事件获取背包tokenid
      bagContractViewer.once(
        "Transfer",
        (from: string, to: string, tokenid: number) => {
          console.log("proket mint success");
          create6551();
        }
      );
      //使用钱包地址 mint 背包nft
      const bag = await bagContract.mint();
      await bag.wait();
    } catch (error: any) {
      setLoading(false);
      if (error.code !== 4001) console.error(error);
    }
  }

  /**创建背包后，再创建6551账户并转入1个matic 再更新用户数据*/
  async function create6551() {
    console.log("开始创建6551");
    try {
      const createAccountdata =
        await regisContract.createAccount.populateTransaction(
          "0xA477e898B403f00cB41f760D83282fb20545Edc5", // Account的proxy
          chainId,
          "0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3", // 需要绑定的NFT的地址
          bundleTokenid,
          0,
          "0x8129fc1c"
        );
      let createAccountTX = {
        to: "0xf713E1bFc2a7235765C5afc668720d58024404b1", // registry
        data: createAccountdata.data
      };
      await regisSigner.sendTransaction(createAccountTX);

      const createdAccount1 = await regisContract.createAccount.staticCall(
        "0xA477e898B403f00cB41f760D83282fb20545Edc5", // Account的proxy
        chainId,
        "0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3", // 需要绑定的NFT的地址
        bundleTokenid,
        0,
        "0x8129fc1c"
      );
      setAccount6551account(createdAccount1);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }

  /**
   * mint资产nft
   */
  async function mintAssetsNFT() {
    if (!address || loading) return;

    // 开始mint
    setLoading(true);
    try {
      const txStr = await contract.mint();
      setLoading(false);
      console.log(txStr);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  /**查询资产总数 */
  async function getAssets() {
    if (!address) return;
    const count = await contract.balanceOf(account6551account);
    setAssetsNumber(Number(count));

    const ids = await contract.tokenID();
    setAssetsIds([]);
    for (let i = 1; i <= Number(ids); i++) {
      const owner = await contract.ownerOf(i);
      if (owner === account6551account) {
        setAssetsIds((prev) => [...prev, { id: i }]);
      }
    }
  }

  return (
    <div
      className={`${style.mainBk} relative mx-auto mint min-h-screen bg-white text-black`}
    >
      {/** 主体内容 */}
      <div className="relative z-1 h-full justify-between pt-[3%] pl-[3%]">
        {/**左侧 */}
        <div className="leftArea">
          {/** 钱包地址 */}
          <div className={`${eoaAddress !== "" ? "block" : "hidden"}`}>
            EOA address: {eoaAddress}
            <div className="mb-3">
              bundle token id：
              <input
                className=" text-black border"
                type="number"
                name=""
                id=""
                onInput={(e) => {
                  handleInput(e, "bundle");
                }}
              />
            </div>
          </div>

          {/** 生成的6551地址 */}
          {account6551account !== "" ? (
            <>
              <div className="my-3">createdAccount: {account6551account}</div>{" "}
              {/** 输入转入的tokenid */}
              <div className=" my-3">
                转入的tokenId：
                <input
                  className=" text-black border"
                  type="number"
                  name=""
                  id=""
                  onInput={(e) => {
                    handleInput(e, "in");
                  }}
                />
              </div>
              {/** 输入转出的tokenid */}
              <div className="mb-3">
                转出的tokenId：
                <input
                  className=" text-black border"
                  type="number"
                  name=""
                  id=""
                  onInput={(e) => {
                    handleInput(e, "out");
                  }}
                />
              </div>
            </>
          ) : null}

          {/**按钮 */}
          <ComButton
            text="createAccount"
            cancel
            loading={loading}
            fontBold
            onClickButton={createAccount}
          ></ComButton>

          <ComButton
            text="Mint AssetsNFT"
            cancel
            fontBold
            loading={loading}
            onClickButton={mintAssetsNFT}
          ></ComButton>

          <ComButton
            text="转进6551"
            cancel
            fontBold
            loading={loading}
            onClickButton={transTest}
          ></ComButton>

          <ComButton
            text="转出6551"
            cancel
            fontBold
            loading={loading}
            onClickButton={executeCall}
          ></ComButton>

          <ComButton
            text="查询资产"
            cancel
            fontBold
            loading={loading}
            onClickButton={getAssets}
          ></ComButton>
        </div>

        {/**6551拥有的assets */}
        <div
          className={`${
            account6551account !== "" ? "block" : "hidden"
          } text-center text-[30px] font-bold mt-2 mb-1`}
        >
          资产总数：{assetsNumber}
        </div>
        <div
          className={`border rounded-sm h-[500px] p-2 overflow-y-scroll ${
            account6551account !== "" ? "block" : "hidden"
          }`}
        >
          {assetsIds.map((e) => {
            return (
              <p className="text-center" key={e.id}>
                assets token id: {e.id}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
