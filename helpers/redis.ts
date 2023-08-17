import { createClient } from "redis";
import { logger } from "./logger.ts";
import { Data } from "./types.ts";

const REDIS_URL = process.env.REDIS_URL ?? "";
const THREE_DAYS_IN_SECONDS = 3 * 24 * 60 * 60;

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

export async function getLlamaFinancials(): Promise<Data> {
  try {
    logger.info("Retrieving data from Redis");
    const [lendBorrows, pools] = await client
      .multi()
      .get("lendBorrows")
      .get("pools")
      .exec();
    logger.info("Got data from Redis");
    return {
      lendBorrows:
        typeof lendBorrows === "string" ? JSON.parse(lendBorrows) : null,
      pools: typeof pools === "string" ? JSON.parse(pools) : null,
    };
  } catch (error) {
    logger.error("Failed to get data from Redis:", error);
    throw error;
  }
}

export function saveDataToRedis(data: Data): void {
  try {
    client.set("lendBorrows", JSON.stringify(data.lendBorrows), {
      EX: THREE_DAYS_IN_SECONDS,
    });
    client.set("pools", JSON.stringify(data.pools), {
      EX: THREE_DAYS_IN_SECONDS,
    });
    logger.info("Saved data to Redis");
  } catch (error) {
    logger.error("Failed to save data to Redis:", error);
    throw error;
  }
}
