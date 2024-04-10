import "@/styles/globals.css";
import "@/styles/iconfont.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import HeadBar from "../components/headerBar/headBar";

// 连接web3使用的依赖
import { ConnectKitProvider } from "connectkit";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../lib/wagmi";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <ConnectKitProvider theme="midnight">
          {/* <PageLoading /> */}
          <div className="mintContainer bg-black">
            <Head>
              <title>GraduationProjectFront</title>
            </Head>
            <HeadBar></HeadBar>
            <Component {...pageProps} />
          </div>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
