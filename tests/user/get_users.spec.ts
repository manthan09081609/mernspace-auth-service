import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("GET /users", () => {
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

      const response = await request(app).get("/users").send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a list of users", async () => {
      // Arrange
      const managerData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const tenant = await tenantRepository.save(tenantData);

      await userRepository.save({ ...managerData, tenant: { id: tenant.id } });

      // Act

      const response = await request(app).get("/users").send();

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
