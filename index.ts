import express, { Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import {
  connectToRedis,
  getFinancials,
  saveDataToRedis,
  saveStakingDataToRedis,
} from "./helpers/redis.ts";
import { fetchFinancialsApi, fetchStakingData } from "./helpers/api.ts";
import { FIFTEEN_MINUTES, PORT } from "./helpers/constants.ts";
import { logger } from "./helpers/logger.ts";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15'
  max: 100,
});
app.use(limiter);

app.get("/financials", async (_: Request, res: Response) => {
  try {
    const responseData = await getFinancials();
    res.json(responseData);
  } catch (err) {
    // No need to log, we already do on inner functions
    res.status(500).json({ error: "Error retrieving data" });
  }
});

export const server = app.listen(PORT, async () => {
  logger.info(`Server is running on ${PORT}`);
  try {
    await connectToRedis();
  } catch (error) {
    logger.error("Stopping server during initialization");
    process.exit(1); // Exit if there's a problem connecting to Redis during initialization
  }
  setInterval(fetchDataAndSaveToRedis, FIFTEEN_MINUTES);
  fetchDataAndSaveToRedis();
});

async function fetchDataAndSaveToRedis(): Promise<void> {
  try {
    const data = await fetchFinancialsApi();
    saveDataToRedis(data);

    const stakingData = await fetchStakingData();
    saveStakingDataToRedis(stakingData);
  } catch {
    logger.error("Error fetching or saving data");
  }
}

export default app;
