import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /tenants/:id", () => {
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

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const tenantRepository = connection.getRepository(Tenant);

      const tenant = await tenantRepository.save(tenantData);

      const response = await request(app).get(`/tenants/${tenant.id}`).send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a tenant", async () => {
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };
      const tenantRepository = connection.getRepository(Tenant);

      const tenant = await tenantRepository.save(tenantData);

      const response = await request(app).get(`/tenants/${tenant.id}`).send();

      // Assert
      expect((response.body as Record<string, string>).name).toBe(
        tenantData.name,
      );
      expect((response.body as Record<string, string>).address).toBe(
        tenantData.address,
      );
    });

    it("should return 400 status code if tennat id is not valid", async () => {
      // Arrange

      // Act
      const response = await request(app).get(`/tenants/${"ggf"}`).send();

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if tenant is not present", async () => {
      // Arrange
      const tenantRepository = connection.getRepository(Tenant);
      const id = "234";

      // Act
      const response = await request(app).get(`/tenants/${id}`).send();
      const tenant = await tenantRepository.findOne({
        where: { id: Number(id) },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(tenant).toBeNull();
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
