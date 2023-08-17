import express, { Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import {
  connectToRedis,
  getLlamaFinancials,
  saveDataToRedis,
} from "./helpers/redis.ts";
import { fetchFinancialsApi } from "./helpers/api.ts";
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

app.get("/llama_financials", async (_: Request, res: Response) => {
  try {
    const responseData = await getLlamaFinancials();
    res.json(responseData);
  } catch (err) {
    logger.error("Server error:", err);
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
  } catch {
    logger.error("Error fetching or saving data");
  }
}

export default app;
