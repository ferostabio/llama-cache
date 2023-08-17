import axios from "axios";
import { DEFILLAMA_PROXY, DEFILLAMA_URL } from "./constants.ts";
import { logger } from "./logger.ts";
import { Data } from "./types.ts";

type DefillamaUri = {
  lendBorrow: string;
  pools: string;
};

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
      axios.get(uri.pools).then(({ data }) => data),
    ]);
    logger.info("Completed request to API");
    return { lendBorrows, pools };
  } catch (error) {
    logger.error("Failed to fetch data from API:", error);
    throw error;
  }
}
