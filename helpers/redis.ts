import { createClient } from "redis";
import { logger } from "./logger.ts";
import { Data, StakingResponse } from "./types.ts";
import { REDIS_KEY } from "./constants.ts";

const REDIS_URL = process.env.REDIS_URL ?? "";
const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;
const EXPIRATION = {
  EX: THREE_DAYS_IN_SECONDS,
};

const client = createClient({
  url: REDIS_URL,
});

client.on("error", (err: Error) => {
  logger.error("Redis error:", err);
});

export async function connectToRedis() {
  try {
    await client.connect();
    logger.info("Connected to Redis");
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
}

export async function disconnectFromRedis() {
  return await client.quit();
}

export async function getFinancials(): Promise<Data> {
  try {
    const [lendBorrowsRaw, poolsRaw, stakingApyRaw] = await client
      .multi()
      .get(REDIS_KEY.LEND_BORROW)
      .get(REDIS_KEY.POOLS)
      .hGetAll(REDIS_KEY.STAKING_APY)
      .exec();

    const lendBorrows =
      typeof lendBorrowsRaw === "string" ? JSON.parse(lendBorrowsRaw) : [];
    const pools = typeof poolsRaw === "string" ? JSON.parse(poolsRaw) : [];
    const stakingApys: StakingResponse[] =
      typeof stakingApyRaw === "object"
        ? Object.keys(stakingApyRaw as any).map((key) => {
            return {
              symbol: key,
              value: parseFloat((stakingApyRaw as any)[key]),
            };
          })
        : [];

    // Update pools with staking rewards
    pools.forEach((pool: any) => {
      const match = stakingApys.find((apy) => apy.symbol === pool.symbol);
      if (match) {
        pool.stakingApy = match.value;
      }
    });

    return {
      lendBorrows,
      pools,
    };
  } catch (error) {
    logger.error("Failed to get data from Redis:", error);
    throw error;
  }
}

export function saveDataToRedis(data: Data): void {
  try {
    client.set(
      REDIS_KEY.LEND_BORROW,
      JSON.stringify(data.lendBorrows),
      EXPIRATION
    );
    client.set(REDIS_KEY.POOLS, JSON.stringify(data.pools), EXPIRATION);
    logger.info("Saved data to Redis");
  } catch (error) {
    logger.error("Failed to save data to Redis:", error);
    throw error;
  }
}

export function saveStakingDataToRedis(data: StakingResponse[]): void {
  try {
    data.forEach(async (d) => {
      await client.hSet(REDIS_KEY.STAKING_APY, d.symbol, d.value.toString());
    });
    client.expire(REDIS_KEY.STAKING_APY, THREE_DAYS_IN_SECONDS);
  } catch (error) {
    logger.error("Failed to save staking data to Redis:", error);
    throw error;
  }
}
