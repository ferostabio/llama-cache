import axios from "axios";
import {
  DEFILLAMA_PROXY,
  DEFILLAMA_URL,
  STAKING_SERVICE,
  STAKING_URL,
} from "./constants.ts";
import { logger } from "./logger.ts";
import {
  Data,
  DefillamaUri,
  StakingRequest,
  StakingResponse,
} from "./types.ts";

function defillamaUri(): DefillamaUri {
  return {
    lendBorrow: DEFILLAMA_PROXY
      ? `${DEFILLAMA_PROXY}lendBorrow`
      : DEFILLAMA_URL.LEND_BORROW,
    pools: DEFILLAMA_PROXY ? `${DEFILLAMA_PROXY}pools` : DEFILLAMA_URL.POOLS,
  };
}

export async function fetchFinancialsApi(): Promise<Data> {
  const uri = defillamaUri();
  try {
    logger.info("Starting Defillama API requests");
    const [lendBorrows, pools] = await Promise.all([
      axios.get(uri.lendBorrow).then(({ data }) => data),
      axios.get(uri.pools).then(({ data }) => data.data),
    ]);
    logger.info("Completed requests to Defillama API");
    return { lendBorrows, pools };
  } catch (error) {
    logger.error("Failed to fetch data from API:", error);
    throw error;
  }
}

export async function fetchStakingData(): Promise<StakingResponse[]> {
  try {
    logger.info("Starting staking API requests");
    const data = await Promise.all([
      axios.get(STAKING_URL.MATICX).then(({ data }) => {
        return { symbol: STAKING_SERVICE.MATICX, value: data.value };
      }),
      axios.get(STAKING_URL.WSTETH).then(({ data }) => {
        const value = data.data.apr;
        return { symbol: STAKING_SERVICE.WSTETH, value, data };
      }),
    ]);
    logger.info("Completed requests to staking API");
    return data;
  } catch (error) {
    logger.error("Failed to fetch staking data from API:", error);
    throw error;
  }
}
