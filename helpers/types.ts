export type DefillamaUri = {
  lendBorrow: string;
  pools: string;
};

/*
 * It's not up to us, we store whatever Defillama returns
 * and inferring a type wouldn't be nice at all.
 */
export type Data = {
  lendBorrows: any;
  pools: any;
};

export type StakingRequest = {
  url: string;
  symbol: string;
};

export type StakingResponse = {
  symbol: string;
  value: number;
  data?: any; // Since we're calling different APIs, let's store the raw data just in case
};
