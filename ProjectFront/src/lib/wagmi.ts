import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { mainnet, polygon, polygonMumbai, sepolia } from "wagmi/chains";

const chains = [mainnet, polygon, polygonMumbai, sepolia];

export const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId: "cc42b9ceb1b1088a79b4627c70d2ca2a",
    alchemyId: "P3zL4NWHnu_QE4WlZUkSUP6g4XViqDjD",
    chains,
    appName: "BosysTensei",
    appDescription: "BosysTensei",
    appUrl: "https://www.bosyotensei.xyz/"
  })
);
