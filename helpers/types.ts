/*
 * It's not up to us, we store whatever Defillama returns
 * and inferring a type wouldn't be nice at all.
 */
export type Data = {
  lendBorrows: any;
  pools: any;
};
