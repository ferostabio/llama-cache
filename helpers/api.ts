import axios from "axios";
import {
  DEFILLAMA_PROXY,
  DEFILLAMA_URL,
  STAKING_REQUESTS,
} from "./constants.ts";
import { logger } from "./logger.ts";
import { Data, DefillamaUri, StakingResponse } from "./types.ts";

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
    logger.info("Starting API request");
    const [lendBorrows, pools] = await Promise.all([
      axios.get(uri.lendBorrow).then(({ data }) => data),
      axios.get(uri.pools).then(({ data }) => data.data),
    ]);
    logger.info("Completed request to API");
    return { lendBorrows, pools };
  } catch (error) {
    logger.error("Failed to fetch data from API:", error);
    throw error;
  }
}

export async function fetchStakingData(): Promise<StakingResponse[]> {
  try {
    const data = await Promise.all(
      STAKING_REQUESTS.map((request) => {
        logger.info(`Starting staking API request: ${request.url}`);
        return axios.get(request.url).then(({ data }) => {
          logger.info(`Completed staking API request: ${data}`);
          return { symbol: request.symbol, value: data.value };
        });
      })
    );
    return data;
  } catch (error) {
    logger.error("Failed to fetch staking data from API:", error);
    throw error;
  }
}
