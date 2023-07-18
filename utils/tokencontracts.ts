import { Contracts } from "./config";
import { getWeb3 } from "./web3";
import { getAdminAccount } from "./adminAccount";
import { TokenETH } from "../types/TokenETH";

export const getTokenContracts = async () => {
    const account = await getAdminAccount("POLY"); // you can use any option
    const ethWeb = getWeb3("POLY");
    const bscWeb = getWeb3("PHIV2");

    // adding the accounts to wallet so that we can make transactions from this address
    ethWeb.eth.accounts.wallet.add(account);
    bscWeb.eth.accounts.wallet.add(account);
    const contractInstances = [
        new ethWeb.eth.Contract(
            Contracts[3].abi,
            Contracts[3].address
        ) as unknown as TokenETH,
        new bscWeb.eth.Contract(
            Contracts[2].abi,
            Contracts[2].address
        ) as unknown as TokenETH
    ];
    return contractInstances;
};
