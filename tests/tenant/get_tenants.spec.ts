import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /tenants", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("All fields given", () => {
    it("should return 200 status code", async () => {
      // Arrange

      // Act

      const response = await request(app).get("/tenants").send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a list of tenants", async () => {
      // Arrange
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const tenantRepository = connection.getRepository(Tenant);

      await tenantRepository.save(tenantData);
      const response = await request(app).get("/tenants").send();
      const tenants = await tenantRepository.find();

      // Assert
      expect((response.body as Record<string, string>).length).toBe(
        tenants.length,
      );
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
