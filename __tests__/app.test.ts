import request from "supertest";
import app, { server } from "../index.ts";
import { disconnectFromRedis, getFinancials } from "../helpers/redis.ts";
import { fetchFinancialsApi, fetchStakingData } from "../helpers/api.ts";

// Bare minimum, need to test all functions with mocks
describe("Express App API", () => {
  it("/financials request should execute successfully", async () => {
    const response = await request(app).get("/financials");
    expect(response.status).toBe(200);
  });

  it("API should fetch financial data", async () => {
    const result = await fetchFinancialsApi();

    expect(result).toHaveProperty("lendBorrows");
    expect(result).toHaveProperty("pools");
  });

  it("API should fetch staking data", async () => {
    const result = await fetchStakingData();

    expect(result).toHaveLength(1);
  });

  it("Redis should return proper json", async () => {
    const data = await getFinancials();

    expect(data.lendBorrows).not.toBeUndefined();
    expect(data.pools).not.toBeUndefined();
  });

  afterAll((done: jest.DoneCallback) => {
    disconnectFromRedis();
    if (server) {
      server.close();
    }
    done();
  });
});
