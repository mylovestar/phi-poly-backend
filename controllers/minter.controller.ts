import { Request, Response } from "express";
import Web3 from "web3";
import logger from "../utils/logger";
import { getWeb3 } from "../utils/web3";
import { getContracts } from "../utils/contracts";
import { getAdminAccount } from "../utils/adminAccount";
import { BridgeETH } from "../types/BridgeETH";
import { BridgeBSC } from "../types/BridgeBSC";
import { getBSCTokenContracts } from "../utils/BSCtokencontracts";

/**
 *
 * @param txHash the burn hash for the transaction that's being processed by the user
 * @param web3 the web3 instance that should be used to connect with the chain for getting the data
 * @returns the amount burned and verification for the transaction
 */

const amountFetcher = async (txHash: string, selectTokenName: string, web3: Web3) => {
  const receipt = await web3.eth.getTransaction(txHash);
  let amount;
  if (selectTokenName === 'USDC') {
    amount = receipt.value;
  } else {
    amount = web3.utils.hexToNumberString(`0x${receipt.input.slice(35, 74)}`);
  }
  return [amount, receipt.from];
};

/**
 *
 * @param res takes the response object for express
 * @param target the target token data for displaying in the logger and returning in response
 * @param bridge the bridge container for calling the functions on them
 * @param recipient the recipient that will receive the transferred token
 * @param burnedAmount the amount to mint
 * @param nonce the nonce value for other chain to restrict double spending
 * @param account the admin account from which the transaction will be processing
 */

const burnMinterMethod = async (
  res: Response,
  hash: string,
  target: "PHIV2" | "POLY",
  bridge: BridgeETH | BridgeBSC,
  recipient: string,
  burnedAmount: string,
  tokenaddress: string,
  nonce: string,
  account: any
) => {
  bridge.methods
    .mint(recipient, burnedAmount, nonce, tokenaddress, hash)
    .send({
      from: account.address,
      gas: "3000000",
      gasPrice: "120000000000"
    })
    .once("transactionHash", function (hash) {
      console.log(hash);
    })
    .once("confirmation", function () {
      logger.info("✅: Minting is done! ");
      return res.status(200).json({
        message: `Minting done for ${target}. Please check your balance!`,
      });
    })
    .once("error", (error) => {
      console.log(error.message);
      return new Error("error");
    });
};

const etxMinterMethod = async (
  res: Response,
  hash: string,
  target: "PHIV2" | "POLY",
  bridge: BridgeETH | BridgeBSC,
  recipient: string,
  burnedAmount: string,
  nonce: string,
  account: any
) => {
  bridge.methods
    .etxMint(recipient, burnedAmount, nonce, hash)
    .send({
      from: account.address,
      gas: "1000000",
    })
    .once("transactionHash", function (hash) {
      console.log(hash);
    })
    .once("confirmation", function () {
      logger.info("✅: Minting is done! ");
      return res.status(200).json({
        message: `Minting done for ${target}. Please check your balance!`,
      });
    })
    .once("error", (error) => {
      console.log(error.message);
      return new Error("error");
    });
};

//----------------------------------------------------------------------------------------------------------------------

// CONTROLLER FUNCTIONS

/**
 * method for starting the minting process on ethereum
 * @param req the request object
 * @param res the response object
 */

export const mintETH = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;
    const account = await getAdminAccount("POLY");
    const [ethBridge, bscBridge] = await getContracts();
    logger.info(`ℹ: txHash for burning BTK on binance: ${txHash}`);

    const [burnedAmount, recipient] = await amountFetcher(
      txHash,
      'bETX',
      getWeb3("PHIV2")
    );
    let token1address = "";
    let burnedAmount1 = "";
    token1address = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
    burnedAmount1 = getWeb3("POLY").utils.toWei((parseFloat(burnedAmount) / (10 ** 30)).toFixed(18), "ether");
    const bscBridgeNonce = await bscBridge.methods.getNonce().call({
      from: account.address,
    });
    logger.info(`✅${bscBridgeNonce} `);
    const hash = await bscBridge.methods.getHash(burnedAmount1, Number(bscBridgeNonce).toString()).call({
      from: account.address,
    });
    console.log('debug->test',hash, recipient, burnedAmount1, token1address)
    await burnMinterMethod(
      res,
      hash,
      "POLY",
      ethBridge,
      recipient,
      burnedAmount1,
      token1address,
      bscBridgeNonce,
      account
    );
    return;
  } catch (err: any) {
    logger.error(`Can't mint the tokens!: ${err.message}`);
    res.status(500).json({
      message: "Can't mint the tokens!",
    });
  }
};

/**
 * method for starting the minting process on binance-chain
 * @param req the request object
 * @param res the response object
 */

export const mintBSC = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.body;
    const account = await getAdminAccount("POLY");
    const [ethBridge, bscBridge] = await getContracts();

    console.log("")

    logger.info(`ℹ: txHash for burning ETK on ethereum: ${txHash}`);
    setTimeout(() => { }, 10000);
    const [burnedAmount, recipient] = await amountFetcher(
      txHash,
      "USDC",
      getWeb3("POLY")
    );
    let token1address = "";
    let burnedAmount1 = "";
    token1address = "0xE0195eA0A07b5835B6ECFa87f10DB37f603dEB02";
    burnedAmount1 = getWeb3("PHIV2").utils.toWei((parseFloat(burnedAmount) / (10 ** 18)).toFixed(18), "ether");
    logger.info(`✅:  Amount of ETK burned is ${burnedAmount}`);
    logger.info(`✅:  Minting for ${burnedAmount1} BTK in progress`);
    const ethBridgeNonce = await ethBridge.methods.getNonce().call({
      from: account.address,
    });
    logger.info(`✅${ethBridgeNonce} `);
    const hash = await ethBridge.methods.getHash(burnedAmount1, Number(ethBridgeNonce).toString()).call({
      from: account.address,
    });
    await burnMinterMethod(
      res,
      hash,
      "PHIV2",
      bscBridge,
      recipient,
      burnedAmount1,
      token1address,
      ethBridgeNonce,
      account
    );
  } catch (err: any) {
    logger.error(`Can't mint the tokens!: ${err.message}`);
    res.status(500).json({
      message: "Error while minting. Please try again!",
    });
  }
};

export const BridgeBalance = async (req: Request, res: Response) => {
  try {
    var toChainID = req.body.toChainId;
    const balances = await amountBridge(toChainID);
    res.status(200).json({
      balances
    });
  } catch (err: any) {
    logger.error(`Can't find amount!: ${err.message}`);
    res.status(500).json({
      message: "Error while searching. Please try again!",
    });
  }
};


const amountBridge = async (
  toChainID: number,
) => {
  let balances = [];
  if (toChainID === 137) {
    // let ETXbalance;
    // const ETX_PROVIDER_URL = "https://polygon-rpc.com/";
    // let BSCweb3 = new Web3(new Web3.providers.HttpProvider(ETX_PROVIDER_URL));
    // ETXbalance = await BSCweb3.eth.getBalance("0xE4D2D8e25AA948698E912861BB7031E96C62bE8D"); // Bridge address
    // balances[0] = getWeb3("PHIV2").utils.toWei((parseFloat(ETXbalance) / (10 ** 18)).toFixed(18), "ether");
    const [bETX] = await getBSCTokenContracts();
    balances[0] = await bETX.methods.balanceOf("0xE4D2D8e25AA948698E912861BB7031E96C62bE8D").call({});
  }
  else {
    const [bETX] = await getBSCTokenContracts();
    balances[0] = await bETX.methods.balanceOf("0xE4D2D8e25AA948698E912861BB7031E96C62bE8D").call({});
    console.log(balances[0]);
  }
  return balances;
};