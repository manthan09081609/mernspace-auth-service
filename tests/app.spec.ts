import request from "supertest";

import app from "../src/app";
import { calculateDiscount } from "../src/utils";

describe.skip("App", () => {
  it("should calculate the discount", () => {
    const result = calculateDiscount(100, 10);

    expect(result).toBe(10);
  });

  it("shoulf return 200 status code", async () => {
    const response = await request(app).get("/").send();

    expect(response.statusCode).toBe(200);
  });
});
