import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /tenant/create", () => {
  let connection: DataSource;
  let jwks: JWKSMock;

  beforeAll(async () => {
    jwks = createJWKSMock("http:localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  describe("All fields given", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const response = await request(app)
        .post("/tenant")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(tenantData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should store tenant in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });
      await request(app)
        .post("/tenant")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(tenantData);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      // Assert
      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const response = await request(app).post("/tenant").send(tenantData);
      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(401);
      expect(tenants).toHaveLength(0);
    });

    it("should return 403 if user is not an admin", async () => {
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const userRepository = connection.getRepository(User);
      const manager = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(manager.id),
        role: manager.role,
      });
      // Arrange
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const response = await request(app)
        .post("/tenant")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(403);
      expect(tenants).toHaveLength(0);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
