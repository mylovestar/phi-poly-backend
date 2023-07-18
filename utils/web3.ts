import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

export const getWeb3 = (network: "POLY" | "PHIV2") => {
  return new Web3(
    network === "POLY"
      ? 'https://endpoints.omniatech.io/v1/matic/mainnet/public'
      : 'https://phi-network-v2.rpc.thirdweb.com'
  );
};
