import request from "supertest";
import app, { server } from "../index.ts";
import { disconnectFromRedis, getFinancials } from "../helpers/redis.ts";
import { fetchFinancialsApi, fetchStakingData } from "../helpers/api.ts";
import { STAKING_SERVICE } from "../helpers/constants.ts";

// Bare minimum, need to test all functions with mocks
describe("Express App API", () => {
  it("/financials request should execute successfully", async () => {
    const response = await request(app).get("/financials");
    expect(response.status).toBe(200);
  });

  it("API should fetch financial data", async () => {
    const result = await fetchFinancialsApi();

    expect(result.lendBorrows).not.toBeUndefined();
    expect(result.pools).not.toBeUndefined();
  });

  it("API should fetch staking data", async () => {
    const result = await fetchStakingData();

    expect(result).toHaveLength(2);
    expect(result[0].symbol).toEqual(STAKING_SERVICE.MATICX);
    expect(result[1].symbol).toEqual(STAKING_SERVICE.WSTETH);
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
