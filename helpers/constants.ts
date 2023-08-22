import { StakingRequest } from "./types";

export const PORT = Number(process.env.PORT) || 3000;
export const REDIS_URL = process.env.REDIS_URL ?? "";
export const DEFILLAMA_PROXY = process.env.DEFILLAMA_PROXY;

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;

export enum DEFILLAMA_URL {
  LEND_BORROW = "https://yields.llama.fi/lendBorrow",
  POOLS = "https://yields.llama.fi/pools",
}

export enum REDIS_KEY {
  LEND_BORROW = "lendBorrow",
  POOLS = "pools",
  STAKING_APY = "stakingApy",
}

export enum STAKING_SERVICE {
  MATICX = "MATICX",
  WSTETH = "WSTETH",
}

export const STAKING_URL: Record<STAKING_SERVICE, string> = {
  [STAKING_SERVICE.MATICX]: "https://universe.staderlabs.com/polygon/apy",
  [STAKING_SERVICE.WSTETH]:
    "https://eth-api.lido.fi/v1/protocol/steth/apr/last",
};
