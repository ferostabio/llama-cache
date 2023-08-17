import request from "supertest";
import app, { server } from "../index.ts";
import { disconnectFromRedis, getLlamaFinancials } from "../helpers/redis.ts";

// Bare minimum
describe("Express App API", () => {
  it("API request should respond with proper json", async () => {
    const response = await request(app).get("/llama_financials");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("lendBorrows");
    expect(response.body).toHaveProperty("pools");
  });

  it("Redis returns proper json", async () => {
    const data = await getLlamaFinancials();

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
