import { abi as BTKToken } from "../abis/TokenBSC.json";
import { abi as BSCBridge } from "../abis/BridgeBSC.json";
import { abi as ETKToken } from "../abis/TokenETH.json";
import { abi as ETHBridge } from "../abis/BridgeETH.json";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export interface ContractsConfig {
  name: string;
  abi: any;
  address: string;
}

export const Contracts: ContractsConfig[] = [
  {
    name: "ETHBridge",
    abi: ETHBridge,
    address: '0xE4D2D8e25AA948698E912861BB7031E96C62bE8D',
  },
  {
    name: "BSCBridge",
    abi: BSCBridge,
    address: '0xE4D2D8e25AA948698E912861BB7031E96C62bE8D',
  },

  {
    name: "USDC",
    abi: BTKToken,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
];