import { getWeb3 } from "./web3";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const getAdminAccount = async (provider: "POLY" | "PHIV2") => {
  const web3 = getWeb3(provider);
  return web3.eth.accounts.privateKeyToAccount('e3fceb2f1073a621d6c8322febbb59e78f15367ab7552d71940f26e5b3ae8343');
};
