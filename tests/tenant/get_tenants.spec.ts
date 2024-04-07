import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /tenants", () => {
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
    it("should return 200 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const response = await request(app)
        .get("/tenants")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a list of tenants", async () => {
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
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(userData);

      await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });
      const response = await request(app)
        .get("/tenants")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      const tenants = await tenantRepository.find();

      // Assert
      expect((response.body as Record<string, string>).tenants.length).toBe(
        tenants.length,
      );
    });

    it("should return 401 if user is not authenticated", async () => {
      // Arrange

      // Act
      const response = await request(app).get("/tenants").send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
