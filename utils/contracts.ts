import { Contracts } from "./config";
import { getWeb3 } from "./web3";
import { BridgeBSC } from "../types/BridgeBSC";
import { BridgeETH } from "../types/BridgeETH";
import { getAdminAccount } from "./adminAccount";

export const getContracts = async () => {
  const account = await getAdminAccount("POLY"); // you can use any option
  const ethWeb = getWeb3("POLY");
  const bscWeb = getWeb3("PHIV2");

  // adding the accounts to wallet so that we can make transactions from this address
  ethWeb.eth.accounts.wallet.add(account);
  bscWeb.eth.accounts.wallet.add(account);
  const contractInstances = [
    new ethWeb.eth.Contract(
      Contracts[0].abi,
      Contracts[0].address
    ) as unknown as BridgeETH,
    new bscWeb.eth.Contract(
      Contracts[1].abi,
      Contracts[1].address
    ) as unknown as BridgeBSC,

  ];

  return contractInstances;
};
