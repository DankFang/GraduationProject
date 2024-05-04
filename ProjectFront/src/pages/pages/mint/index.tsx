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
let chainId: any;
let AccountProxy: any;
let pocketNFT: any;
let assetsNFT: any;
let registry: any;
// 链ID
// const chainId = 80001;

export default function Mint() {
  const [bundleTokenid, setBundleTokenid] = useState("");
  const [inTokenid, setInTokenid] = useState("");
  const [outTokenid, setOutTokenid] = useState("");
  const [liudongTokenid, setLiudongTokenid] = useState("");
  const [transPackAddress, setTransPackAddress] = useState("");
  const [eoaAddress, setEoaAddress] = useState("");
  const [assetsNumber, setAssetsNumber] = useState(0);
  const [assetsIds, setAssetsIds] = useState<Array<{ id: number }>>([]);
  const [liudong, setLiudong] = useState<Array<{ text: string }>>([]);
  const [packOnwer, setPackOnwer] = useState<Array<{ text: string }>>([]);
  const [account6551account, setAccount6551account] = useState("");
  const { isConnected, address } = useAccount();
  old_address = address;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected || address !== old_address) {
      // assets合约
      geteEthersObject(isConnected).then((res) => {
        contract = res.contract;
        chainId = res.chainId1;
        AccountProxy =
          chainId == 80001
            ? "0xA477e898B403f00cB41f760D83282fb20545Edc5"
            : "0x44B3fdC704632424D92c1b64ff621be514513dE8";
        pocketNFT =
          chainId == 80001
            ? "0x6eeE674Df9D3adA4e73599E9ec68CFe897d197b3"
            : "0xF2085520559dE812ca76e64a6805F776F2976D32";
        assetsNFT =
          chainId == 80001
            ? "0x25C0D1Cb7851aa1D7DcB550e835949bcfdc69CF5"
            : "0x51d054C73E767B72C5bAbc79eACc85cFd3cc6f8a";
        registry =
          chainId == 80001
            ? "0xf713E1bFc2a7235765C5afc668720d58024404b1"
            : "0x68b7649d9d24B40F04e71495b8c594C5B58735e5";
      });

      // regis合约
      getRegistryContract(isConnected, chainId).then((res) => {
        regisContract = res.contract;
        regisSigner = res.signer;
      });

      // 注册proket实例
      getBatContract(isConnected, chainId).then((res) => {
        bagContract = res.contract;
        bagContractViewer = res.contractViewer;
      });

      setEoaAddress(address as string);

      old_address = address;
    }
  }, [isConnected, address]);

  /**接受input的值 */
  function handleInput(e: any, type: string) {
    console.log(e);

    if (type === "in") {
      setInTokenid(e.target.value as string);
    } else if (type === "out") {
      setOutTokenid(e.target.value as string);
    } else if (type === "bundle") {
      setBundleTokenid(e.target.value as string);
    } else if (type === "liudong") {
      setLiudongTokenid(e.target.value as string);
    } else if (type === "transPack") {
      setTransPackAddress(e.target.value as string);
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
      AccountProxy, // Account的proxy
      chainId,
      pocketNFT, // 需要绑定的NFT的地址
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
    const contractObj = await getAccountContract(
      isConnected,
      createdAccount,
      chainId
    );
    const AccountContract = contractObj.contract;

    const executeTX = await AccountContract.executeCall.populateTransaction(
      assetsNFT,
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

  /**create 6551 account*/
  async function create6551() {
    console.log("开始创建6551");
    try {
      const createAccountdata =
        await regisContract.createAccount.populateTransaction(
          AccountProxy, // Account的proxy
          chainId,
          pocketNFT, // 需要绑定的NFT的地址
          bundleTokenid,
          0,
          "0x8129fc1c"
        );
      let createAccountTX = {
        to: registry, // registry
        data: createAccountdata.data
      };
      await regisSigner.sendTransaction(createAccountTX);

      const createdAccount1 = await regisContract.createAccount.staticCall(
        AccountProxy, // Account的proxy
        chainId,
        pocketNFT, // 需要绑定的NFT的地址
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

  /**查询资产流动性 */
  async function getLiudong() {
    if (!address || liudongTokenid === "") return;
    const nft_owner = await contract.ownerOf(liudongTokenid);
    // 设置流动性列表
    setLiudong((prev) => [
      ...prev,
      { text: `id:${liudongTokenid} owner:${nft_owner}` }
    ]);
  }

  /**查询抽象账户所有者 */
  async function getPackOwner() {
    if (!address) return;

    const owner = await bagContract.ownerOf(bundleTokenid);
    setPackOnwer((prev) => [...prev, { text: `owner:${owner}` }]);
  }

  /**转移抽象账户 */
  async function transPack() {
    if (account6551account === "") {
      alert("请先创建账户");
      return;
    }
    if (bundleTokenid === "" || transPackAddress === "") {
      return;
    }
    setLoading(true);
    await bagContract.safeTransferFrom(
      address,
      transPackAddress,
      bundleTokenid
    );
    setLoading(false);
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
          <div
            className={`${eoaAddress !== "" ? "block" : "hidden"}`}
            style={{ fontSize: "larger" }}
          >
            EOA address: {eoaAddress}
            <br />
            <br />
            <div className="mb-3">
              与ERC-6551抽象账户绑定的pocketNFT的tokenID:
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

          <br />
          {/** 生成的6551地址 */}
          {account6551account !== "" ? (
            <>
              <div className="my-3" style={{ fontSize: "larger" }}>
                createdAccount: {account6551account}
              </div>
              <br />
              {/** 输入转入的assets tokenid */}
              <div className=" my-3" style={{ fontSize: "larger" }}>
                转入的assets tokenId:
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
              <br />
              <div className="mb-3" style={{ fontSize: "larger" }}>
                转出的assets tokenId:
                <input
                  className="text-black border"
                  type="number"
                  name=""
                  id=""
                  onInput={(e) => {
                    handleInput(e, "out");
                  }}
                />
              </div>
              <br />
              {/**需要查询流动性的nft ID */}
              <div className="mb-3" style={{ fontSize: "larger" }}>
                需要查询流动性的assets tokenId:
                <input
                  className="text-black border"
                  type="number"
                  name=""
                  id=""
                  onInput={(e) => {
                    handleInput(e, "liudong");
                  }}
                />
              </div>
              <br />
              {/**输入接受pack nft 的接受地址 */}
              <div className="mb-3" style={{ fontSize: "larger" }}>
                接受抽象账户转移的地址:
                <input
                  className="text-black border"
                  name=""
                  id=""
                  onInput={(e) => {
                    handleInput(e, "transPack");
                  }}
                />
              </div>
            </>
          ) : null}

          {/**按钮 */}
          <ComButton
            text="创建抽象账户"
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
            text="将assetsNFT转进抽象账户"
            cancel
            fontBold
            loading={loading}
            onClickButton={transTest}
          ></ComButton>

          <ComButton
            text="将assetsNFT转出抽象账户"
            cancel
            fontBold
            // buttonSize="big"
            loading={loading}
            onClickButton={executeCall}
          ></ComButton>

          <ComButton
            text="查询抽象账户内的资产"
            cancel
            fontBold
            loading={loading}
            onClickButton={getAssets}
          ></ComButton>

          <ComButton
            text="查询资产流动性说明"
            cancel
            fontBold
            loading={loading}
            onClickButton={getLiudong}
          ></ComButton>

          <ComButton
            text="转移抽象账户"
            cancel
            fontBold
            loading={loading}
            onClickButton={transPack}
          ></ComButton>

          <ComButton
            text="抽象账户所有者变化情况"
            cancel
            fontBold
            loading={loading}
            onClickButton={getPackOwner}
          ></ComButton>
        </div>

        {/**6551拥有的assets */}
        <div className="flex justify-between pb-7">
          {/**抽象账户内资产总数 */}
          <div className="w-[30%]">
            <div
              className={`${
                account6551account !== "" ? "block" : "hidden"
              } text-center text-[30px] font-bold mt-2 mb-1`}
            >
              抽象账户内资产总数：{assetsNumber}
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

          {/**资产流动性说明 */}
          <div className="w-[30%]">
            <div
              className={`${
                account6551account !== "" ? "block" : "hidden"
              } text-center text-[30px] font-bold mt-2 mb-1`}
            >
              资产流动性说明
            </div>
            <div
              className={`border rounded-sm h-[500px] p-2 overflow-y-scroll ${
                account6551account !== "" ? "block" : "hidden"
              }`}
            >
              {liudong.map((e, i) => {
                return (
                  <p className="text-center" key={i}>
                    {e.text}
                  </p>
                );
              })}
            </div>
          </div>

          {/**抽象账户所有者变化情况 */}
          <div className="w-[30%]">
            <div
              className={`${
                account6551account !== "" ? "block" : "hidden"
              } text-center text-[30px] font-bold mt-2 mb-1`}
            >
              抽象账户所有者变化情况
            </div>
            <div
              className={`border rounded-sm h-[500px] p-2 overflow-y-scroll ${
                account6551account !== "" ? "block" : "hidden"
              }`}
            >
              {packOnwer.map((e, i) => {
                return (
                  <p className="text-center" key={i}>
                    {e.text}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
