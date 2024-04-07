import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import createJWKSMock, { JWKSMock } from "mock-jwks";

describe("GET /users/:id", () => {
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

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const manager = await userRepository.save({
        ...managerData,
        tenant: { id: tenant.id },
      });

      const response = await request(app)
        .get(`/users/${manager.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a user", async () => {
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

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const manager = await userRepository.save({
        ...managerData,
        tenant: { id: tenant.id },
      });

      const response = await request(app)
        .get(`/users/${manager.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect((response.body as Record<string, string>).firstName).toBe(
        managerData.firstName,
      );
      expect((response.body as Record<string, string>).lastName).toBe(
        managerData.lastName,
      );
      expect((response.body as Record<string, string>).email).toBe(
        managerData.email,
      );
      expect((response.body as Record<string, string>).role).toBe(
        managerData.role,
      );
    });

    it.skip("should return 401 status code if user is not authenticated", async () => {
      // Arrange

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);

      const admin = await userRepository.save(adminData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const userId = 76274;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it.skip("should return 403 status code if user is not admin", async () => {
      // Arrange

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);

      const admin = await userRepository.save(adminData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const userId = 76274;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if user id is not valid", async () => {
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

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      await userRepository.save({
        ...managerData,
        tenant: { id: tenant.id },
      });

      const response = await request(app)
        .get(`/users/${"gdhd"}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if user is not present", async () => {
      // Arrange

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);

      const admin = await userRepository.save(adminData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const userId = 76274;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
