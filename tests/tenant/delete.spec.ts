import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /tenants/delete/:id", () => {
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

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
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

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(userData);
      const tenant = await tenantRepository.save(tenantData);
      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      // Act

      const response = await request(app)
        .delete(`/tenants/delete/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return 400 status code if id is not valid", async () => {
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

      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(userData);
      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });
      await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .delete(`/tenants/delete/${"3d3"}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(400);
      expect(tenants.length).toBe(1);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };
      const tenantRepository = connection.getRepository(Tenant);

      await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .delete(`/tenants/delete/${"3d3"}`)
        .set("Cookie", [`accessToken=${"accessToken"}`])
        .send();

      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(401);
      expect(tenants.length).toBe(1);
    });

    it("should return 403 if user is not an admin", async () => {
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const customer = await userRepository.save(userData);
      const tenant = await tenantRepository.save(tenantData);
      const accessToken = jwks.token({
        sub: String(customer.id),
        role: customer.role,
      });

      // Act

      const response = await request(app)
        .delete(`/tenants/delete/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(403);
      expect(tenants.length).toBe(1);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
