import { Router } from "express";
import { BridgeBalance, mintBSC, mintETH } from "../controllers/minter.controller";

export const router = Router();

router.post("/mint-eth", mintETH);
router.post("/mint-bsc", mintBSC);
router.post("/bridgebalance", BridgeBalance);