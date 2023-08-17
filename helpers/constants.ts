export const PORT = Number(process.env.PORT) || 3000;
export const REDIS_URL = process.env.REDIS_URL ?? "";
export const DEFILLAMA_PROXY = process.env.DEFILLAMA_PROXY;

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;

export enum DEFILLAMA_URL {
  LEND_BORROW = "https://yields.llama.fi/lendBorrow",
  POOLS = "https://yields.llama.fi/pools",
}
