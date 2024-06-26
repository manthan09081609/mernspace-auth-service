import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("UPDATE /tenants/update/:id", () => {
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

      const updateTenantData = {
        name: "tenant 1",
        address: "tenant 1 Address",
      };

      // Act

      const response = await request(app)
        .patch(`/tenants/update/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(updateTenantData);

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

      const userRepository = connection.getRepository(User);

      const admin = await userRepository.save(userData);
      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const updateTenantData = {
        name: "tenant 1",
        address: "tenant 1 Address",
      };

      // Act

      const response = await request(app)
        .patch(`/tenants/update/${"fdgg"}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(updateTenantData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const tenantRepository = connection.getRepository(Tenant);

      const tenant = await tenantRepository.save(tenantData);

      const updateTenantData = {
        name: "tenant 1",
        address: "tenant 1 Address",
      };
      // Act
      const response = await request(app)
        .patch(`/tenants/update/${tenant.id}`)
        .send(updateTenantData);

      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(401);
      expect(tenants[0].name).not.toBe(updateTenantData.name);
      expect(tenants[0].address).not.toBe(updateTenantData.address);
    });

    it("should return 403 if user is not an admin or manager", async () => {
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

      const updateTenantData = {
        name: "tenant 1",
        address: "tenant 1 Address",
      };

      // Act
      const response = await request(app)
        .patch(`/tenants/update/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send(updateTenantData);

      const tenants = await tenantRepository.find();

      // Assert
      expect(response.statusCode).toBe(403);
      expect(tenants[0].name).not.toBe(updateTenantData.name);
      expect(tenants[0].address).not.toBe(updateTenantData.address);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
