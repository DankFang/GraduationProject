import { useRouter } from "next/router";
import { useEffect } from "react";
import style from "./headBar.module.scss";

// 连接web3的依赖
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

// 导航分类
const nav: Array<any> = [];
export default function HeadBar() {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected) {
      sessionStorage.setItem("isConnected", "true");
    } else {
      sessionStorage.setItem("isConnected", "false");
    }
  }, [isConnected, address]);

  return (
    <>
      <div
        id="headBar"
        className={`${style.headBar} flex pl-[4%] pr-[54px] pt-[24px] pb-[18px] content-center justify-between 2xl:pt-[34px]`}
      >
        <div className="flex items-center content-center space-x-4">
          {nav.map((e, i) => (
            <BarButton key={i} barName={e} />
          ))}
          <WalletButton />
        </div>
      </div>
    </>
  );
}

/**
 * topBar按钮的组件
 * @param barName 从父组件接受按钮的文字名称
 * @returns
 */
function BarButton({
  barName
}: {
  barName: {
    name: string;
    path: string;
    type: string;
  };
}) {
  const router = useRouter();

  return (
    <span className={style.navButton}>
      <a
        className="text-[0.875rem] font-bold px-1 cursor-pointer 2xl:text-[1.125rem] 3xl:text-[1.375rem] 4xl:text-[1.875rem]"
        onClick={() => {
          // router.push(barName.path);
          if (router.pathname !== "/" || barName.type === "jump") {
            // 路由跳转
            router.push(barName.path);
          } else if (barName.type === "outLink") {
            // 跳转外部链接
            window.open(barName.path);
          } else {
            // 页面滚动
            if (barName.path === "/") {
              window.scroll({
                top: 0,
                behavior: "smooth"
              });
            } else {
              const headHeight: number | undefined =
                document.getElementById("headBar")?.offsetHeight;
              const itemTop: number | undefined = document.getElementById(
                `${barName.name.toLocaleLowerCase()}`
              )?.offsetTop;
              if (headHeight) {
                window.scroll({
                  top: itemTop,
                  behavior: "smooth"
                });
              }
            }
          }
        }}
      >
        {barName.name}
      </a>
    </span>
  );
}

/**
 * 链接web3钱包的按钮
 * geoli是5
 * sepolia测试链是11155111
 */
// const chainId = 11155111;
function WalletButton() {
  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress, ensName }) => {
          return (
            <span
              onClick={show}
              className="bg-white p-2 text-black rounded text-sm cursor-pointer transition hover:scale-[1.01] active:scale-100  2xl:text-[24px] 2xl:p-3 3xl:text-[26px] 4xl:p-4 4xl:text-[32px] 4xl:p-6"
            >
              {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
            </span>
          );
        }}
      </ConnectKitButton.Custom>
    </>
  );
}
